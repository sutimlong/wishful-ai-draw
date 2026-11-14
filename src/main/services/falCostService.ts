import type { FalCreditBalanceResult } from '../../shared/types'

/**
 * fal.ai 費用查詢服務
 *
 * 1. 實際費用：GET https://api.fal.ai/v1/models/billing-events?request_id=...
 *    - 需要 API Key 具備 `billing:usage:read` 權限（BILLING / FULL preset）
 *    - 回傳每筆請求的 cost_total（已套用折扣後的實際扣款金額）
 * 2. 預估費用：POST https://api.fal.ai/v1/models/pricing/estimate
 *    - 任何有效 API Key 皆可呼叫（required permissions: none）
 *    - 優先使用 `historical_api_price`（歷史單次呼叫均價，最接近實際扣款）：
 *      實測 fal-ai/gpt-image-2.6-sunburst/edit 歷史均價約 $0.12，
 *      而 `unit_price` 會回傳 $1（計費單位 unit 不等於一張圖），因此不採用。
 *    - 若該端點無歷史資料（API 回 404 / 非 200）則退回 `unit_price`（unit_quantity: 1）
 *    - 皆用於金鑰無帳務權限時的替代顯示
 * 3. 剩餘額度：GET https://api.fal.ai/v1/account/billing?expand=credits
 *    - 需要 API Key 具備 `billing:usage:read` 權限（BILLING / READONLY / FULL preset）
 *    - 回傳 credits.current_balance 與 credits.currency
 */

const PLATFORM_API_BASE = 'https://api.fal.ai/v1'
const BILLING_EVENTS_URL = `${PLATFORM_API_BASE}/models/billing-events`
const PRICING_ESTIMATE_URL = `${PLATFORM_API_BASE}/models/pricing/estimate`
const ACCOUNT_BILLING_URL = `${PLATFORM_API_BASE}/account/billing`
const REQUEST_TIMEOUT_MS = 8000

export type FalCostSource = 'billing_events' | 'pricing_estimate'

export interface FalCostResult {
  costUsd: number
  currency: string
  /** true = 預估費用；false = 實際扣款金額 */
  isEstimated: boolean
  source: FalCostSource
}

interface BillingEventRecord {
  request_id?: string
  cost_total?: number | string | null
  cost_estimate_nano_usd?: number | string | null
}

interface PlatformApiResponse {
  status: number
  body: unknown
}

function normalizeEndpointId(endpointId: string): string {
  return endpointId.trim().replace(/^\/+/, '').replace(/\/+$/, '')
}

/**
 * Platform API 可能以不同外層欄位包裝清單（billing_events / events / items / data），
 * 或直接回傳陣列；這裡全部容錯處理。
 */
function extractBillingEvents(body: unknown): BillingEventRecord[] {
  if (Array.isArray(body)) return body as BillingEventRecord[]
  if (body && typeof body === 'object') {
    const container = body as Record<string, unknown>
    for (const key of ['billing_events', 'events', 'items', 'data']) {
      const value = container[key]
      if (Array.isArray(value)) return value as BillingEventRecord[]
    }
  }
  return []
}

async function fetchJson(url: string, init: RequestInit): Promise<PlatformApiResponse> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, { ...init, signal: controller.signal })
    const text = await response.text()
    let body: unknown = null
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = null
    }
    return { status: response.status, body }
  } finally {
    clearTimeout(timer)
  }
}

export class FalCostService {
  /** 每張圖費用預估快取（key = endpointId），同一批次同模型只查一次 */
  private estimateCache = new Map<string, FalCostResult | null>()
  /** 一旦偵測到目前 API Key 無帳務權限（403），後續請求就不再嘗試 billing-events */
  private billingDenied = false

  public clearCache(): void {
    this.estimateCache.clear()
    this.billingDenied = false
  }

  /**
   * 查詢單筆請求的實際計費金額（需要具備 billing:usage:read 權限的 API Key）。
   * 查無資料（權限不足 / 帳務尚未入帳 / 網路錯誤）時回傳 null。
   */
  public async getActualRequestCost(
    apiKey: string,
    requestId: string
  ): Promise<FalCostResult | null> {
    if (!apiKey?.trim() || !requestId?.trim()) return null
    if (this.billingDenied) return null

    try {
      const { status, body } = await fetchJson(
        `${BILLING_EVENTS_URL}?request_id=${encodeURIComponent(requestId.trim())}&limit=1`,
        { headers: { Authorization: `Key ${apiKey.trim()}` } }
      )
      if (status === 403) {
        // 金鑰沒有 billing:usage:read 權限 → 之後直接改用費用預估，避免大量重複失敗請求
        this.billingDenied = true
        return null
      }
      if (status !== 200) return null

      const events = extractBillingEvents(body)
      if (events.length === 0) return null

      const record = events.find((e) => e.request_id === requestId.trim()) ?? events[0]
      const costUsd = this.readRecordCost(record)
      if (costUsd === null) return null

      return {
        costUsd,
        currency: 'USD',
        isEstimated: false,
        source: 'billing_events'
      }
    } catch {
      return null
    }
  }

  /**
   * 查詢模型「單張圖片」的預估費用。
   * 優先使用 `historical_api_price`（歷史單次呼叫均價，最接近實際扣款），
   * 該端點沒有歷史資料時退回 `unit_price`。結果依 endpointId 快取。
   */
  public async getPerCallCostEstimate(
    apiKey: string,
    endpointId: string
  ): Promise<FalCostResult | null> {
    const normalized = normalizeEndpointId(endpointId)
    if (!apiKey?.trim() || !normalized) return null

    const cached = this.estimateCache.get(normalized)
    if (cached !== undefined) return cached

    // 實測 gpt-image-2.6-sunburst/edit：historical_api_price ≈ $0.12、unit_price = $1（unit≠一張圖）
    // 部分端點（如 fal-ai/fal-image-resize）沒有歷史資料會回 404，此時才退回 unit_price。
    const historical = await this.requestPricingEstimate(apiKey, {
      estimate_type: 'historical_api_price',
      endpoints: { [normalized]: { call_quantity: 1 } }
    })
    const result =
      historical.cost ??
      (
        await this.requestPricingEstimate(apiKey, {
          estimate_type: 'unit_price',
          endpoints: { [normalized]: { unit_quantity: 1 } }
        })
      ).cost

    if (result) {
      this.estimateCache.set(normalized, result)
      return result
    }

    // 端點明確不存在於定價服務（404）：快取 null，避免大批次每張圖都重複查詢失敗
    if (historical.status === 404) {
      this.estimateCache.set(normalized, null)
    }
    return null
  }

  /** 呼叫 pricing/estimate 並正規化回應；非 200 或欄位非法時 cost 為 null。 */
  private async requestPricingEstimate(
    apiKey: string,
    requestBody: Record<string, unknown>
  ): Promise<{ cost: FalCostResult | null; status: number }> {
    try {
      const { status, body } = await fetchJson(PRICING_ESTIMATE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      if (status !== 200) return { cost: null, status }

      const payload = body as { total_cost?: unknown; currency?: unknown } | null
      const totalCost = Number(payload?.total_cost)
      if (!Number.isFinite(totalCost) || totalCost < 0) return { cost: null, status }

      return {
        status,
        cost: {
          costUsd: totalCost,
          currency:
            typeof payload?.currency === 'string' && payload.currency ? payload.currency : 'USD',
          isEstimated: true,
          source: 'pricing_estimate'
        }
      }
    } catch {
      return { cost: null, status: 0 }
    }
  }

  /**
   * 取得單張圖片的費用：優先實際帳務金額，失敗時退回歷史均價預估。
   */
  public async resolveItemCost(
    apiKey: string,
    endpointId: string,
    requestId?: string
  ): Promise<FalCostResult | null> {
    if (requestId) {
      const actual = await this.getActualRequestCost(apiKey, requestId)
      if (actual) return actual
    }
    return this.getPerCallCostEstimate(apiKey, endpointId)
  }

  /**
   * 查詢 fal.ai 帳戶目前剩餘額度。
   * 需要 API Key 具備 `billing:usage:read` 權限：
   * - 403 / 401 → reason: 'unauthorized'（Key 無帳務權限）
   * - 其他失敗（未設定 Key、網路、5xx、格式不符）→ reason: 'unavailable'
   */
  public async getAccountCredits(apiKey: string): Promise<FalCreditBalanceResult> {
    if (!apiKey?.trim()) return { ok: false, reason: 'unavailable' }

    try {
      const { status, body } = await fetchJson(`${ACCOUNT_BILLING_URL}?expand=credits`, {
        headers: { Authorization: `Key ${apiKey.trim()}` }
      })
      if (status === 403 || status === 401) return { ok: false, reason: 'unauthorized' }
      if (status !== 200) return { ok: false, reason: 'unavailable' }

      const payload = body as
        | {
            username?: unknown
            credits?: { current_balance?: unknown; currency?: unknown } | null
          }
        | null

      const credits = payload?.credits
      const rawBalance = credits?.current_balance
      if (typeof rawBalance === 'number') {
        // ok
      } else if (typeof rawBalance === 'string' && rawBalance.trim() !== '') {
        // ok（API 可能以字串回傳金額）
      } else {
        return { ok: false, reason: 'unavailable' }
      }

      const balance = Number(rawBalance)
      if (!Number.isFinite(balance) || balance < 0) return { ok: false, reason: 'unavailable' }

      return {
        ok: true,
        balance: {
          currentBalance: balance,
          currency:
            typeof credits?.currency === 'string' && credits.currency ? credits.currency : 'USD',
          username: typeof payload?.username === 'string' ? payload.username : undefined
        }
      }
    } catch {
      return { ok: false, reason: 'unavailable' }
    }
  }

  private readRecordCost(record: BillingEventRecord | undefined): number | null {
    if (!record) return null

    const costTotal = Number(record.cost_total)
    if (Number.isFinite(costTotal) && costTotal >= 0) return costTotal

    // cost_estimate_nano_usd 為 cost_total 的奈米美元（nano USD）表示，精度較高
    const nanoUsd = Number(record.cost_estimate_nano_usd)
    if (Number.isFinite(nanoUsd) && nanoUsd >= 0) return nanoUsd / 1e9

    return null
  }
}

export const falCostService = new FalCostService()
