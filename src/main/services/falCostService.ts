/**
 * fal.ai 費用查詢服務
 *
 * 1. 實際費用：GET https://api.fal.ai/v1/models/billing-events?request_id=...
 *    - 需要 API Key 具備 `billing:usage:read` 權限（BILLING / FULL preset）
 *    - 回傳每筆請求的 cost_total（已套用折扣後的實際扣款金額）
 * 2. 預估費用：POST https://api.fal.ai/v1/models/pricing/estimate（unit_price）
 *    - 任何有效 API Key 皆可呼叫（required permissions: none）
 *    - 以「一個計費單位（一張圖）× 單價」估算，用於金鑰無帳務權限時的替代顯示
 */

const PLATFORM_API_BASE = 'https://api.fal.ai/v1'
const BILLING_EVENTS_URL = `${PLATFORM_API_BASE}/models/billing-events`
const PRICING_ESTIMATE_URL = `${PLATFORM_API_BASE}/models/pricing/estimate`
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
  /** 單價預估快取（key = endpointId），同一批次同模型只查一次 */
  private unitPriceCache = new Map<string, FalCostResult | null>()
  /** 一旦偵測到目前 API Key 無帳務權限（403），後續請求就不再嘗試 billing-events */
  private billingDenied = false

  public clearCache(): void {
    this.unitPriceCache.clear()
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
        // 金鑰沒有 billing:usage:read 權限 → 之後直接改用預估單價，避免大量重複失敗請求
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
   * 查詢模型「單一計費單位（一張圖）」的預估單價。
   * 任何有效 API Key 皆可呼叫，結果會依 endpointId 快取。
   */
  public async getUnitPriceEstimate(
    apiKey: string,
    endpointId: string
  ): Promise<FalCostResult | null> {
    const normalized = normalizeEndpointId(endpointId)
    if (!apiKey?.trim() || !normalized) return null

    const cached = this.unitPriceCache.get(normalized)
    if (cached !== undefined) return cached

    try {
      const { status, body } = await fetchJson(PRICING_ESTIMATE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estimate_type: 'unit_price',
          endpoints: { [normalized]: { unit_quantity: 1 } }
        })
      })
      if (status !== 200) return null

      const payload = body as { total_cost?: unknown; currency?: unknown } | null
      const totalCost = Number(payload?.total_cost)
      if (!Number.isFinite(totalCost) || totalCost < 0) return null

      const result: FalCostResult = {
        costUsd: totalCost,
        currency: typeof payload?.currency === 'string' && payload.currency ? payload.currency : 'USD',
        isEstimated: true,
        source: 'pricing_estimate'
      }
      this.unitPriceCache.set(normalized, result)
      return result
    } catch {
      return null
    }
  }

  /**
   * 取得單張圖片的費用：優先實際帳務金額，失敗時退回預估單價。
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
    return this.getUnitPriceEstimate(apiKey, endpointId)
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
