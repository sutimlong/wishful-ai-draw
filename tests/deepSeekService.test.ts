import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_DEEPSEEK_API_KEY,
  DEEPSEEK_BALANCE_URL,
  DEEPSEEK_CHAT_URL,
  DEEPSEEK_MODEL,
  PROMPT_OPTIMIZATION_SYSTEM_PROMPT,
  buildDeepSeekRequest,
  fetchDeepSeekBalance,
  optimizePrompt
} from '../src/main/services/deepSeekService'

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

/** 建立可檢視呼叫參數的 fetch mock */
function createFetchMock(payload: unknown, status = 200): {
  fetchMock: ReturnType<typeof vi.fn>
  fetchImpl: typeof globalThis.fetch
} {
  const fetchMock = vi.fn(async () => jsonResponse(payload, status))
  return {
    fetchMock,
    fetchImpl: fetchMock as unknown as typeof globalThis.fetch
  }
}

function readInit(fetchMock: ReturnType<typeof vi.fn>): {
  url: string
  init: RequestInit
  headers: Record<string, string>
  body: { model: string; messages: Array<{ role: string; content: string }> }
} {
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
  return {
    url,
    init,
    headers: init.headers as Record<string, string>,
    body: JSON.parse(init.body as string)
  }
}

describe('deepSeekService 提示詞優化', () => {
  it('buildDeepSeekRequest 帶入系統提示詞並 trim 使用者輸入', () => {
    const request = buildDeepSeekRequest('  一隻在雨中散步的柴犬  ')

    expect(request.model).toBe(DEEPSEEK_MODEL)
    expect(request.stream).toBe(false)
    expect(request.temperature).toBeGreaterThan(0)
    expect(request.messages).toHaveLength(2)
    expect(request.messages[0]).toEqual({
      role: 'system',
      content: PROMPT_OPTIMIZATION_SYSTEM_PROMPT
    })
    expect(request.messages[1]).toEqual({ role: 'user', content: '一隻在雨中散步的柴犬' })
  })

  it('呼叫 DeepSeek Chat Completions 並回傳 trim 後的英文提示詞', async () => {
    const { fetchMock, fetchImpl } = createFetchMock({
      choices: [{ message: { content: '  A shiba inu walking in the rain, cinematic lighting  ' } }]
    })

    const result = await optimizePrompt('一隻在雨中散步的柴犬', { fetchImpl })

    expect(result).toBe('A shiba inu walking in the rain, cinematic lighting')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const { url, init, headers, body } = readInit(fetchMock)
    expect(url).toBe(DEEPSEEK_CHAT_URL)
    expect(init.method).toBe('POST')
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers.Authorization).toBe(`Bearer ${DEFAULT_DEEPSEEK_API_KEY}`)
    expect(body.model).toBe(DEEPSEEK_MODEL)
    expect(body.messages[1].content).toBe('一隻在雨中散步的柴犬')
  })

  it('可覆寫 API Key 與模型（方便日後改為使用者自填金鑰）', async () => {
    const { fetchMock, fetchImpl } = createFetchMock({
      choices: [{ message: { content: 'optimized prompt' } }]
    })

    await optimizePrompt('cat', {
      apiKey: 'sk-custom-key',
      model: 'deepseek-reasoner',
      fetchImpl
    })

    const { headers, body } = readInit(fetchMock)
    expect(headers.Authorization).toBe('Bearer sk-custom-key')
    expect(body.model).toBe('deepseek-reasoner')
  })

  it('提示詞為空時直接丟出錯誤，不發出請求', async () => {
    const { fetchMock, fetchImpl } = createFetchMock({ choices: [] })

    await expect(optimizePrompt('    ', { fetchImpl })).rejects.toThrow('請先輸入提示詞')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('API Key 無效（401）時回傳可讀錯誤訊息', async () => {
    const { fetchImpl } = createFetchMock(
      { error: { message: 'Authentication Fails' } },
      401
    )

    await expect(optimizePrompt('cat', { fetchImpl })).rejects.toThrow(
      'DeepSeek API Key 無效或已失效：Authentication Fails'
    )
  })

  it('回應格式不含 choices 內容時丟出錯誤', async () => {
    const { fetchImpl } = createFetchMock({ choices: [{ message: { content: '   ' } }] })

    await expect(optimizePrompt('cat', { fetchImpl })).rejects.toThrow(
      'DeepSeek 未回傳有效的提示詞內容'
    )
  })

  it('網路錯誤與逾時會轉成友善訊息', async () => {
    const networkError = vi.fn(async () => {
      throw new TypeError('fetch failed')
    })
    await expect(
      optimizePrompt('cat', { fetchImpl: networkError as unknown as typeof globalThis.fetch })
    ).rejects.toThrow('無法連線至 DeepSeek')

    const abortError = vi.fn(async () => {
      const error = new Error('aborted')
      error.name = 'AbortError'
      throw error
    })
    await expect(
      optimizePrompt('cat', { fetchImpl: abortError as unknown as typeof globalThis.fetch })
    ).rejects.toThrow('DeepSeek 回應逾時')
  })

describe('deepSeekService 餘額查詢', () => {
  it('解析 balance_infos 的字串金額並帶入 Bearer 金鑰', async () => {
    const { fetchMock, fetchImpl } = createFetchMock({
      is_available: true,
      balance_infos: [
        {
          currency: 'usd',
          total_balance: '1.10',
          granted_balance: '0.00',
          topped_up_balance: '1.10'
        }
      ]
    })

    const result = await fetchDeepSeekBalance({ apiKey: 'sk-test-key', fetchImpl })

    expect(result).toEqual({
      ok: true,
      balance: {
        totalBalance: 1.1,
        currency: 'USD',
        grantedBalance: 0,
        toppedUpBalance: 1.1,
        isAvailable: true
      }
    })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(DEEPSEEK_BALANCE_URL)
    expect(init.method).toBe('GET')
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer sk-test-key')
  })

  it('多幣別時取第一筆，並將 is_available: false 反映在餘額狀態', async () => {
    const { fetchImpl } = createFetchMock({
      is_available: false,
      balance_infos: [
        { currency: 'CNY', total_balance: '12.34', granted_balance: '2.34', topped_up_balance: '10' },
        { currency: 'USD', total_balance: '99.00' }
      ]
    })

    const result = await fetchDeepSeekBalance({ apiKey: 'sk-test-key', fetchImpl })

    expect(result).toEqual({
      ok: true,
      balance: {
        totalBalance: 12.34,
        currency: 'CNY',
        grantedBalance: 2.34,
        toppedUpBalance: 10,
        isAvailable: false
      }
    })
  })

  it('401 / 403 時回傳 unauthorized（不拋出例外）', async () => {
    const unauthorized = createFetchMock({ error: { message: 'Authentication Fails' } }, 401)
    await expect(
      fetchDeepSeekBalance({ apiKey: 'bad-key', fetchImpl: unauthorized.fetchImpl })
    ).resolves.toEqual({ ok: false, reason: 'unauthorized' })

    const forbidden = createFetchMock({ error: { message: 'Forbidden' } }, 403)
    await expect(
      fetchDeepSeekBalance({ apiKey: 'bad-key', fetchImpl: forbidden.fetchImpl })
    ).resolves.toEqual({ ok: false, reason: 'unauthorized' })
  })

  it('5xx、格式錯誤與網路錯誤皆回傳 unavailable', async () => {
    const serverError = createFetchMock({ message: 'boom' }, 500)
    await expect(
      fetchDeepSeekBalance({ apiKey: 'sk-test-key', fetchImpl: serverError.fetchImpl })
    ).resolves.toEqual({ ok: false, reason: 'unavailable' })

    const malformed = createFetchMock({ is_available: true })
    await expect(
      fetchDeepSeekBalance({ apiKey: 'sk-test-key', fetchImpl: malformed.fetchImpl })
    ).resolves.toEqual({ ok: false, reason: 'unavailable' })

    const networkError = vi.fn(async () => {
      throw new TypeError('fetch failed')
    })
    await expect(
      fetchDeepSeekBalance({
        apiKey: 'sk-test-key',
        fetchImpl: networkError as unknown as typeof globalThis.fetch
      })
    ).resolves.toEqual({ ok: false, reason: 'unavailable' })

    const emptyValues = createFetchMock({
      is_available: true,
      balance_infos: [{ currency: 'USD', total_balance: 'not-a-number' }]
    })
    await expect(
      fetchDeepSeekBalance({ apiKey: 'sk-test-key', fetchImpl: emptyValues.fetchImpl })
    ).resolves.toEqual({
      ok: true,
      balance: {
        totalBalance: 0,
        currency: 'USD',
        grantedBalance: 0,
        toppedUpBalance: 0,
        isAvailable: true
      }
    })
  })

  it('金鑰為空時直接回傳 unavailable 且不發出請求', async () => {
    const { fetchMock, fetchImpl } = createFetchMock({ is_available: true })

    const result = await fetchDeepSeekBalance({ apiKey: '   ', fetchImpl })

    expect(result).toEqual({ ok: false, reason: 'unavailable' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

})
