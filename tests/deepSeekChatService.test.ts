import { describe, expect, it, vi } from 'vitest'
import {
  createDeepSeekChatCompletion,
  DEEPSEEK_CHAT_MODEL,
  DEEPSEEK_CHAT_URL,
  DEEPSEEK_MODEL,
  type DeepSeekChatMessage
} from '../src/main/services/deepSeekService'

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

describe('DeepSeek 對話模式 Chat Completions', () => {
  it('使用 deepseek-flash、JSON Output 與圖片內容片段', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ choices: [{ message: { content: '{"action":"chat","reply":"好"}' } }] })
    )
    const messages: DeepSeekChatMessage[] = [
      { role: 'system', content: 'system' },
      {
        role: 'user',
        content: [
          { type: 'text', text: '請看這張圖' },
          {
            type: 'image_url',
            image_url: { url: 'data:image/jpeg;base64,AAA', detail: 'auto' }
          }
        ]
      }
    ]

    const result = await createDeepSeekChatCompletion(messages, {
      apiKey: 'sk-test',
      fetchImpl: fetchMock as unknown as typeof globalThis.fetch,
      responseFormat: 'json_object'
    })

    expect(result).toBe('{"action":"chat","reply":"好"}')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(DEEPSEEK_CHAT_URL)
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer sk-test')
    const body = JSON.parse(init.body as string) as {
      model: string
      messages: DeepSeekChatMessage[]
      response_format?: { type: string }
      thinking?: { type: string }
      stream: boolean
    }
    expect(body.model).toBe(DEEPSEEK_CHAT_MODEL)
    expect(body.model).not.toBe(DEEPSEEK_MODEL)
    expect(body.stream).toBe(false)
    expect(body.response_format).toEqual({ type: 'json_object' })
    expect(body.thinking).toEqual({ type: 'disabled' })
    expect(body.messages[1].content).toEqual(messages[1].content)
  })

  it('對話為空時直接丟出錯誤，不發出請求', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ choices: [] }))

    await expect(
      createDeepSeekChatCompletion([], {
        apiKey: 'sk-test',
        fetchImpl: fetchMock as unknown as typeof globalThis.fetch
      })
    ).rejects.toThrow('請先提供對話內容')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('content 為空時會自動退回非 JSON 模式重試', async () => {
    let call = 0
    const fetchMock = vi.fn(async () => {
      call++
      if (call === 1) {
        return jsonResponse({ choices: [{ message: { content: '' } }] })
      }
      return jsonResponse({
        choices: [{ message: { content: '{"action":"chat","reply":"重試成功"}' } }]
      })
    })

    const result = await createDeepSeekChatCompletion([{ role: 'user', content: 'hi' }], {
      apiKey: 'sk-test',
      fetchImpl: fetchMock as unknown as typeof globalThis.fetch,
      responseFormat: 'json_object'
    })

    expect(result).toBe('{"action":"chat","reply":"重試成功"}')
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const secondBody = JSON.parse(
      (fetchMock.mock.calls[1] as unknown as [string, RequestInit])[1].body as string
    ) as { response_format?: unknown; thinking?: { type: string } }
    expect(secondBody.response_format).toBeUndefined()
    expect(secondBody.thinking).toEqual({ type: 'disabled' })
  })

  it('content 為空但 reasoning_content 含決策 JSON 時仍可沿用', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        choices: [
          {
            message: {
              content: '',
              reasoning_content:
                '考量後決定輸出：{"action":"chat","reply":"使用推理內容回覆"}'
            }
          }
        ]
      })
    )

    const result = await createDeepSeekChatCompletion([{ role: 'user', content: 'hi' }], {
      apiKey: 'sk-test',
      fetchImpl: fetchMock as unknown as typeof globalThis.fetch
    })

    expect(result).toBe('{"action":"chat","reply":"使用推理內容回覆"}')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('API Key 無效時回傳可讀錯誤訊息', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ error: { message: 'Authentication Fails' } }, 401)
    )

    await expect(
      createDeepSeekChatCompletion([{ role: 'user', content: 'hi' }], {
        apiKey: 'bad-key',
        fetchImpl: fetchMock as unknown as typeof globalThis.fetch
      })
    ).rejects.toThrow('DeepSeek API Key 無效或已失效：Authentication Fails')
  })
})
