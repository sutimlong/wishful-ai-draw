import { afterEach, describe, expect, it, vi } from 'vitest'
import { FalCostService } from '../src/main/services/falCostService'

const ORIGINAL_FETCH = globalThis.fetch

function mockFetch(
  handler: (url: string, init?: RequestInit) => Promise<Response>
): ReturnType<typeof vi.fn> {
  const fn = vi.fn(async (input: unknown, init?: RequestInit) => handler(String(input), init))
  globalThis.fetch = fn as unknown as typeof fetch
  return fn
}

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH
  vi.restoreAllMocks()
})

describe('FalCostService', () => {
  it('解析 billing-events 回傳的實際扣款金額（cost_total）', async () => {
    const fetchMock = mockFetch(async () =>
      new Response(
        JSON.stringify({
          billing_events: [
            {
              request_id: 'req-abc',
              endpoint_id: 'fal-ai/gpt-image-2.6-sunburst/edit',
              cost_subtotal: 0.05,
              cost_discount: 0.005,
              cost_total: 0.045,
              cost_estimate_nano_usd: 45000000
            }
          ],
          next_cursor: null,
          has_more: false
        }),
        { status: 200 }
      )
    )

    const service = new FalCostService()
    const cost = await service.getActualRequestCost('fal-key', 'req-abc')

    expect(cost).toEqual({
      costUsd: 0.045,
      currency: 'USD',
      isEstimated: false,
      source: 'billing_events'
    })

    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain('/v1/models/billing-events')
    expect(calledUrl).toContain('request_id=req-abc')
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>
    expect(headers.Authorization).toBe('Key fal-key')
  })

  it('API Key 無帳務權限（403）時回傳 null，並改用歷史均價（historical_api_price）估算', async () => {
    const fetchMock = mockFetch(async (url, init) => {
      if (url.includes('billing-events')) {
        return new Response(
          JSON.stringify({
            error: {
              type: 'authorization_error',
              message: 'This API key is not permitted to perform this action.'
            }
          }),
          { status: 403 }
        )
      }
      const requestBody = JSON.parse(String(init?.body)) as { estimate_type: string }
      // 歷史均價優先；若誤用 unit_price 會得到失真的 $1
      const totalCost = requestBody.estimate_type === 'historical_api_price' ? 0.12 : 1
      return new Response(
        JSON.stringify({
          estimate_type: requestBody.estimate_type,
          total_cost: totalCost,
          currency: 'USD'
        }),
        { status: 200 }
      )
    })

    const service = new FalCostService()
    const actual = await service.getActualRequestCost('fal-key', 'req-abc')
    expect(actual).toBeNull()

    const cost = await service.resolveItemCost(
      'fal-key',
      'fal-ai/gpt-image-2.6-sunburst/edit',
      'req-abc'
    )
    expect(cost).toEqual({
      costUsd: 0.12,
      currency: 'USD',
      isEstimated: true,
      source: 'pricing_estimate'
    })

    const estimateBodies = fetchMock.mock.calls
      .map((call) => call[1]?.body)
      .filter(Boolean)
      .map((raw) => JSON.parse(String(raw)) as { estimate_type: string })
    expect(estimateBodies).toHaveLength(1)
    expect(estimateBodies[0].estimate_type).toBe('historical_api_price')
  })

  it('費用預估依 endpoint 快取，同一批次同模型只查詢一次', async () => {
    const fetchMock = mockFetch(async () =>
      new Response(
        JSON.stringify({
          estimate_type: 'historical_api_price',
          total_cost: 0.025,
          currency: 'USD'
        }),
        { status: 200 }
      )
    )

    const service = new FalCostService()
    const first = await service.getPerCallCostEstimate('fal-key', 'fal-ai/flux/dev/image-to-image')
    const second = await service.getPerCallCostEstimate('fal-key', 'fal-ai/flux/dev/image-to-image/')

    expect(first?.costUsd).toBe(0.025)
    expect(second).toEqual(first)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const body = JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))
    expect(body).toEqual({
      estimate_type: 'historical_api_price',
      endpoints: { 'fal-ai/flux/dev/image-to-image': { call_quantity: 1 } }
    })
  })

  it('端點沒有歷史均價（404）時退回 unit_price 單價估算', async () => {
    const fetchMock = mockFetch(async (_url, init) => {
      const requestBody = JSON.parse(String(init?.body)) as { estimate_type: string }
      if (requestBody.estimate_type === 'historical_api_price') {
        return new Response(
          JSON.stringify({ error: { type: 'not_found', message: 'Endpoint(s) not found' } }),
          { status: 404 }
        )
      }
      return new Response(
        JSON.stringify({ estimate_type: 'unit_price', total_cost: 0.002, currency: 'USD' }),
        { status: 200 }
      )
    })

    const service = new FalCostService()
    const cost = await service.getPerCallCostEstimate('fal-key', 'fal-ai/fal-image-resize')

    expect(cost).toEqual({
      costUsd: 0.002,
      currency: 'USD',
      isEstimated: true,
      source: 'pricing_estimate'
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const fallbackBody = JSON.parse(String((fetchMock.mock.calls[1][1] as RequestInit).body))
    expect(fallbackBody).toEqual({
      estimate_type: 'unit_price',
      endpoints: { 'fal-ai/fal-image-resize': { unit_quantity: 1 } }
    })
  })

  it('端點在定價服務完全不存在（歷史與單價皆 404）時回傳 null 並快取避免重複查詢', async () => {
    const fetchMock = mockFetch(async () =>
      new Response(
        JSON.stringify({ error: { type: 'not_found', message: 'Endpoint(s) not found' } }),
        { status: 404 }
      )
    )

    const service = new FalCostService()
    expect(await service.getPerCallCostEstimate('fal-key', 'fal-ai/not-exist')).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)

    // 第二次應命中 null 快取，不再發出請求
    expect(await service.getPerCallCostEstimate('fal-key', 'fal-ai/not-exist')).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('API 查詢失敗（5xx / 網路錯誤）時安全回傳 null，不拋出例外', async () => {
    mockFetch(async () => new Response('{"error":{"type":"server_error"}}', { status: 500 }))
    const service = new FalCostService()
    expect(await service.getActualRequestCost('fal-key', 'req-abc')).toBeNull()
    expect(await service.getPerCallCostEstimate('fal-key', 'fal-ai/flux/dev')).toBeNull()

    mockFetch(async () => {
      throw new Error('network down')
    })
    const secondService = new FalCostService()
    expect(await secondService.resolveItemCost('fal-key', 'fal-ai/flux/dev', 'req-1')).toBeNull()
  })

  it('相容不同的 billing-events 外層包裝（items / data / 裸陣列）', async () => {
    const service = new FalCostService()

    mockFetch(
      async () =>
        new Response(JSON.stringify({ items: [{ request_id: 'req-1', cost_total: 0.12 }] }), {
          status: 200
        })
    )
    expect((await service.getActualRequestCost('fal-key', 'req-1'))?.costUsd).toBe(0.12)

    mockFetch(
      async () =>
        new Response(JSON.stringify({ data: [{ request_id: 'req-2', cost_total: '0.08' }] }), {
          status: 200
        })
    )
    const fromData = await service.getActualRequestCost('fal-key', 'req-2')
    expect(fromData?.costUsd).toBe(0.08)
    expect(fromData?.isEstimated).toBe(false)

    // 只有 cost_estimate_nano_usd 時，換算為美元
    mockFetch(
      async () =>
        new Response(JSON.stringify([{ request_id: 'req-3', cost_estimate_nano_usd: 30000000 }]), {
          status: 200
        })
    )
    expect((await service.getActualRequestCost('fal-key', 'req-3'))?.costUsd).toBeCloseTo(0.03, 6)
  })

  it('偵測到 403 後不再重複查詢 billing-events（避免大批次被限流）', async () => {
    const fetchMock = mockFetch(async (url) => {
      if (url.includes('billing-events')) {
        return new Response(JSON.stringify({ error: { type: 'authorization_error' } }), {
          status: 403
        })
      }
      return new Response(
        JSON.stringify({ estimate_type: 'unit_price', total_cost: 0.04, currency: 'USD' }),
        { status: 200 }
      )
    })

    const service = new FalCostService()
    for (const id of ['req-1', 'req-2', 'req-3']) {
      const cost = await service.resolveItemCost('fal-key', 'fal-ai/flux-pro/kontext', id)
      expect(cost?.source).toBe('pricing_estimate')
    }

    const billingCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes('billing-events')
    )
    expect(billingCalls).toHaveLength(1)
  })

  it('沒有 API Key 或 request_id 時不發出請求', async () => {
    const fetchMock = mockFetch(async () => new Response('{}', { status: 200 }))
    const service = new FalCostService()

    expect(await service.getActualRequestCost('', 'req-abc')).toBeNull()
    expect(await service.getActualRequestCost('fal-key', '')).toBeNull()
    expect(await service.getPerCallCostEstimate('fal-key', '')).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('FalCostService.getAccountCredits', () => {
  it('解析帳戶剩餘額度（credits.current_balance）並帶上正確的認證標頭', async () => {
    const fetchMock = mockFetch(async () =>
      new Response(
        JSON.stringify({
          username: 'wishful-team',
          credits: { current_balance: 24.5, currency: 'USD' }
        }),
        { status: 200 }
      )
    )

    const service = new FalCostService()
    const result = await service.getAccountCredits('fal-key')

    expect(result).toEqual({
      ok: true,
      balance: {
        currentBalance: 24.5,
        currency: 'USD',
        username: 'wishful-team'
      }
    })

    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain('/v1/account/billing')
    expect(calledUrl).toContain('expand=credits')
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>
    expect(headers.Authorization).toBe('Key fal-key')
  })

  it('缺少幣別時預設為 USD', async () => {
    mockFetch(async () =>
      new Response(JSON.stringify({ credits: { current_balance: 12 } }), { status: 200 })
    )

    const service = new FalCostService()
    expect(await service.getAccountCredits('fal-key')).toEqual({
      ok: true,
      balance: {
        currentBalance: 12,
        currency: 'USD',
        username: undefined
      }
    })
  })

  it('API Key 無 billing:usage:read 權限（403）或未授權（401）時回傳 unauthorized', async () => {
    mockFetch(async () =>
      new Response(
        JSON.stringify({ error: { type: 'authorization_error', message: 'not permitted' } }),
        { status: 403 }
      )
    )
    expect(await new FalCostService().getAccountCredits('fal-key')).toEqual({
      ok: false,
      reason: 'unauthorized'
    })

    mockFetch(async () =>
      new Response(JSON.stringify({ error: { type: 'unauthorized' } }), { status: 401 })
    )
    expect(await new FalCostService().getAccountCredits('fal-key')).toEqual({
      ok: false,
      reason: 'unauthorized'
    })
  })

  it('回應缺少 credits 或餘額非數字時回傳 unavailable', async () => {
    const service = new FalCostService()

    mockFetch(async () => new Response(JSON.stringify({ username: 'x' }), { status: 200 }))
    expect(await service.getAccountCredits('fal-key')).toEqual({
      ok: false,
      reason: 'unavailable'
    })

    mockFetch(async () =>
      new Response(JSON.stringify({ credits: { current_balance: 'n/a' } }), { status: 200 })
    )
    expect(await service.getAccountCredits('fal-key')).toEqual({
      ok: false,
      reason: 'unavailable'
    })

    mockFetch(async () =>
      new Response(JSON.stringify({ credits: { current_balance: null } }), { status: 200 })
    )
    expect(await service.getAccountCredits('fal-key')).toEqual({
      ok: false,
      reason: 'unavailable'
    })
  })

  it('餘額以字串回傳時仍可正確解析', async () => {
    mockFetch(async () =>
      new Response(
        JSON.stringify({ credits: { current_balance: '8.75', currency: 'USD' } }),
        { status: 200 }
      )
    )

    const service = new FalCostService()
    const result = await service.getAccountCredits('fal-key')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.balance.currentBalance).toBe(8.75)
    }
  })

  it('沒有 API Key 時不發出請求，網路錯誤時安全回傳 unavailable', async () => {
    const fetchMock = mockFetch(async () => new Response('{}', { status: 200 }))
    const service = new FalCostService()

    expect(await service.getAccountCredits('')).toEqual({ ok: false, reason: 'unavailable' })
    expect(await service.getAccountCredits('   ')).toEqual({ ok: false, reason: 'unavailable' })
    expect(fetchMock).not.toHaveBeenCalled()

    mockFetch(async () => {
      throw new Error('network down')
    })
    expect(await new FalCostService().getAccountCredits('fal-key')).toEqual({
      ok: false,
      reason: 'unavailable'
    })
  })
})
