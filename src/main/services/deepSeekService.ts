/**
 * DeepSeek 提示詞優化服務
 *
 * 使用 DeepSeek 的 OpenAI 相容 Chat Completions API：
 *   POST https://api.deepseek.com/chat/completions
 *
 * 目的：把使用者輸入的提示詞（多為中文）改寫成結構化、適合影像生成模型的英文提示詞，
 * 並保留原始創作意圖。金鑰僅存在於 main process，不會暴露給 renderer。
 *
 * 餘額查詢（TopBar 顯示目前額度）：
 *   GET https://api.deepseek.com/user/balance
 *
 * 注意：內建金鑰會被打包進應用程式產物中，僅適合個人／內部使用；
 * 若要對外散布，應改為由使用者在設定中填入自己的 DeepSeek Key。
 */

import type { DeepSeekBalanceResult } from '../../shared/types'

export const DEEPSEEK_CHAT_URL = 'https://api.deepseek.com/chat/completions'
export const DEEPSEEK_BALANCE_URL = 'https://api.deepseek.com/user/balance'
/** 提示詞優化使用的模型（沿用既有設定） */
export const DEEPSEEK_MODEL = 'deepseek-chat'
/**
 * 對話模式使用的模型：DeepSeek Flash。
 * 官方 Chat Completions 支援 `image_url` 內容（Vision），可讓 AI 直接看使用者上傳的圖片。
 */
export const DEEPSEEK_CHAT_MODEL = 'deepseek-flash'
export const DEFAULT_DEEPSEEK_API_KEY = 'sk-37718d6662e84f4e80eb2085b1b30fba'

const DEEPSEEK_REQUEST_TIMEOUT_MS = 30000
const DEEPSEEK_CHAT_TIMEOUT_MS = 90000
const DEEPSEEK_BALANCE_TIMEOUT_MS = 8000

/**
 * 系統提示詞：要求模型只輸出「優化後、可直接餵給影像生成模型的英文提示詞」，
 * 不要加任何說明、標題或引號，避免把多餘文字寫回使用者的提示詞欄位。
 */
export const PROMPT_OPTIMIZATION_SYSTEM_PROMPT = [
  'You are an expert prompt engineer for AI image generation models (FLUX, GPT Image, Stable Diffusion, etc.).',
  'The user provides a prompt that may be written in Chinese (Traditional or Simplified) or mixed languages.',
  'Rewrite it into a single, richly detailed English prompt that follows image-generation prompting best practices:',
  '- Lead with the main subject and action, then composition, setting, lighting, colour palette, materials, camera/lens and artistic style.',
  '- Preserve the original creative intent, every key subject and any explicit constraints; never invent unrelated content.',
  '- Use natural, descriptive English phrases separated by commas; avoid meta commentary, headings and explanations.',
  '- If the input is already in English, refine its clarity, specificity and structure without changing the intent.',
  'Return ONLY the final optimized English prompt text, without any prefix, suffix, quotation marks or explanation.'
].join('\n')

/** OpenAI 相容格式的文字內容片段 */
export interface DeepSeekTextContentPart {
  type: 'text'
  text: string
}

/** OpenAI 相容格式的圖片內容片段（支援 http(s) 或 base64 data URL） */
export interface DeepSeekImageContentPart {
  type: 'image_url'
  image_url: {
    url: string
    detail?: 'low' | 'high' | 'original' | 'auto'
  }
}

export type DeepSeekChatContentPart = DeepSeekTextContentPart | DeepSeekImageContentPart

export interface DeepSeekChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | DeepSeekChatContentPart[]
}

export interface DeepSeekChatRequest {
  model: string
  messages: DeepSeekChatMessage[]
  temperature: number
  stream: false
  /** JSON Output 模式：要求模型只回傳合法 JSON 物件 */
  response_format?: { type: 'json_object' }
  /** DeepSeek Flash 的思考模式（對話模式預設關閉，讓回覆更即時） */
  thinking?: { type: 'enabled' | 'disabled' }
}

interface DeepSeekChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null
      reasoning_content?: string | null
    } | null
    finish_reason?: string | null
  } | null> | null
  error?: { message?: string } | null
}

/** 提示詞優化過程中的可預期錯誤（訊息可直接顯示給使用者） */
export class DeepSeekPromptError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DeepSeekPromptError'
  }
}

/** 組出送往 DeepSeek 的 Chat Completions 請求內容（方便測試與檢查） */
export function buildDeepSeekRequest(
  prompt: string,
  model: string = DEEPSEEK_MODEL
): DeepSeekChatRequest {
  return {
    model,
    messages: [
      { role: 'system', content: PROMPT_OPTIMIZATION_SYSTEM_PROMPT },
      { role: 'user', content: prompt.trim() }
    ],
    temperature: 0.7,
    stream: false
  }
}

export interface OptimizePromptOptions {
  /** 覆寫 API Key（預設使用內建的 DEFAULT_DEEPSEEK_API_KEY） */
  apiKey?: string
  /** 覆寫模型（預設 deepseek-chat） */
  model?: string
  /** 覆寫 fetch（測試注入用） */
  fetchImpl?: typeof globalThis.fetch
  /** 請求逾時毫秒數 */
  timeoutMs?: number
}

/** 對話模式（DeepSeek Flash，支援看圖）的呼叫選項 */
export interface DeepSeekChatCompletionOptions {
  /** 覆寫 API Key（預設使用內建的 DEFAULT_DEEPSEEK_API_KEY） */
  apiKey?: string
  /** 覆寫模型（預設 deepseek-flash） */
  model?: string
  /** 覆寫 fetch（測試注入用） */
  fetchImpl?: typeof globalThis.fetch
  /** 請求逾時毫秒數 */
  timeoutMs?: number
  /** 取樣溫度 */
  temperature?: number
  /** 設為 json_object 時要求模型只輸出 JSON */
  responseFormat?: 'json_object'
  /** 是否啟用思考模式（預設關閉，讓對話回覆更即時） */
  thinking?: boolean
}

/** 共用的 DeepSeek Chat Completions 請求與錯誤處理 */
async function requestDeepSeekChatCompletion(
  request: DeepSeekChatRequest,
  options: {
    apiKey: string
    fetchImpl: typeof globalThis.fetch
    timeoutMs: number
    emptyContentMessage: string
  }
): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs)

  try {
    let response: Response
    try {
      response = await options.fetchImpl(DEEPSEEK_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${options.apiKey}`
        },
        body: JSON.stringify(request),
        signal: controller.signal
      })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new DeepSeekPromptError('DeepSeek 回應逾時，請稍後再試')
      }
      throw new DeepSeekPromptError('無法連線至 DeepSeek，請檢查網路連線')
    }

    let rawText = ''
    let body: unknown = null
    try {
      rawText = await response.text()
      body = rawText ? JSON.parse(rawText) : null
    } catch {
      body = null
    }

    if (!response.ok) {
      const apiMessage = (body as DeepSeekChatCompletionResponse | null)?.error?.message
      const suffix = apiMessage ? `：${apiMessage}` : ''
      if (response.status === 401) {
        throw new DeepSeekPromptError(`DeepSeek API Key 無效或已失效${suffix}`)
      }
      if (response.status === 429) {
        throw new DeepSeekPromptError(`DeepSeek 請求過於頻繁，請稍後再試${suffix}`)
      }
      throw new DeepSeekPromptError(`DeepSeek 服務回應錯誤（HTTP ${response.status}）${suffix}`)
    }

    const choice = (body as DeepSeekChatCompletionResponse | null)?.choices?.[0]
    const message = choice?.message
    const content = message?.content
    if (!content || !content.trim()) {
      // 少數情況模型只把決策放在 reasoning_content；若其中包含聊天 JSON 就沿用
      const reasoning =
        typeof message?.reasoning_content === 'string' ? message.reasoning_content : ''
      const jsonMatch = reasoning.match(/\{[\s\S]*\}/)
      if (jsonMatch && jsonMatch[0].includes('"action"')) {
        return jsonMatch[0]
      }

      // 診斷用：不包含金鑰，只記錄 API 原始回應，方便判斷是否為空 content
      console.error(
        '[DeepSeek] 回應缺少有效 content：',
        rawText.slice(0, 2000),
        'finish_reason:',
        choice?.finish_reason ?? 'unknown'
      )
      throw new DeepSeekPromptError(options.emptyContentMessage)
    }
    return content.trim()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 呼叫 DeepSeek 將提示詞優化並翻譯成英文。
 * 成功時回傳純文字提示詞（已 trim）；失敗時拋出 DeepSeekPromptError。
 */
export async function optimizePrompt(
  prompt: string,
  options: OptimizePromptOptions = {}
): Promise<string> {
  const trimmed = prompt.trim()
  if (!trimmed) {
    throw new DeepSeekPromptError('請先輸入提示詞再進行優化')
  }

  const apiKey = (options.apiKey ?? DEFAULT_DEEPSEEK_API_KEY).trim()
  if (!apiKey) {
    throw new DeepSeekPromptError('未設定 DeepSeek API Key')
  }

  return requestDeepSeekChatCompletion(buildDeepSeekRequest(trimmed, options.model), {
    apiKey,
    fetchImpl: options.fetchImpl ?? globalThis.fetch,
    timeoutMs: options.timeoutMs ?? DEEPSEEK_REQUEST_TIMEOUT_MS,
    emptyContentMessage: 'DeepSeek 未回傳有效的提示詞內容'
  })
}

/**
 * 對話模式用的 Chat Completions 呼叫。
 * 支援文字與圖片（image_url）內容，成功時回傳模型輸出的純文字（已 trim）。
 */
export async function createDeepSeekChatCompletion(
  messages: DeepSeekChatMessage[],
  options: DeepSeekChatCompletionOptions = {}
): Promise<string> {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new DeepSeekPromptError('請先提供對話內容')
  }

  const apiKey = (options.apiKey ?? DEFAULT_DEEPSEEK_API_KEY).trim()
  if (!apiKey) {
    throw new DeepSeekPromptError('未設定 DeepSeek API Key')
  }

  const request: DeepSeekChatRequest = {
    model: options.model ?? DEEPSEEK_CHAT_MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
    stream: false,
    thinking: { type: options.thinking === true ? 'enabled' : 'disabled' }
  }
  if (options.responseFormat) {
    request.response_format = { type: options.responseFormat }
  }

  const requestOptions = {
    apiKey,
    fetchImpl: options.fetchImpl ?? globalThis.fetch,
    timeoutMs: options.timeoutMs ?? DEEPSEEK_CHAT_TIMEOUT_MS
  }

  // 部分帳號在 JSON Output 或關閉思考模式下可能回傳空白 content；
  // 依序退回「無 JSON 模式 → 啟用思考模式」，避免對話直接中斷。
  const attempts: DeepSeekChatRequest[] = [request]
  if (request.response_format) {
    attempts.push({ ...request, response_format: undefined })
  }
  attempts.push({
    ...request,
    response_format: undefined,
    thinking: { type: 'enabled' }
  })

  let lastError: unknown = null
  for (const attempt of attempts) {
    try {
      return await requestDeepSeekChatCompletion(attempt, {
        ...requestOptions,
        emptyContentMessage: 'DeepSeek 未回傳有效的對話內容'
      })
    } catch (err) {
      lastError = err
      const isEmptyContent =
        err instanceof DeepSeekPromptError && /未回傳有效的對話內容/.test(err.message)
      if (!isEmptyContent) throw err
    }
  }

  if (lastError instanceof DeepSeekPromptError) {
    throw new DeepSeekPromptError(`${lastError.message}（已自動重試 ${attempts.length} 次）`)
  }
  throw new DeepSeekPromptError('DeepSeek 未回傳有效的對話內容')
}

interface DeepSeekBalanceInfo {
  currency?: string
  total_balance?: string | number
  granted_balance?: string | number
  topped_up_balance?: string | number
}

interface DeepSeekBalanceResponse {
  is_available?: boolean
  balance_infos?: DeepSeekBalanceInfo[] | null
}

export interface FetchDeepSeekBalanceOptions {
  /** 覆寫 API Key（預設使用內建的 DEFAULT_DEEPSEEK_API_KEY） */
  apiKey?: string
  /** 覆寫 fetch（測試注入用） */
  fetchImpl?: typeof globalThis.fetch
  /** 請求逾時毫秒數 */
  timeoutMs?: number
}

/** DeepSeek 餘額欄位為字串（例如 "1.10"），統一轉成數字 */
function toBalanceAmount(value: string | number | undefined): number {
  const amount = typeof value === 'number' ? value : Number(value ?? 0)
  return Number.isFinite(amount) ? amount : 0
}

/**
 * 查詢 DeepSeek 帳戶目前餘額（GET /user/balance）。
 *
 * 回應格式：
 * { "is_available": true,
 *   "balance_infos": [{ "currency": "USD", "total_balance": "1.10",
 *                       "granted_balance": "0.00", "topped_up_balance": "1.10" }] }
 *
 * 失敗時回傳 { ok: false, reason } 而不拋出例外，方便 TopBar 直接顯示狀態。
 */
export async function fetchDeepSeekBalance(
  options: FetchDeepSeekBalanceOptions = {}
): Promise<DeepSeekBalanceResult> {
  const apiKey = (options.apiKey ?? DEFAULT_DEEPSEEK_API_KEY).trim()
  if (!apiKey) {
    return { ok: false, reason: 'unavailable' }
  }

  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  const controller = new AbortController()
  const timer = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEEPSEEK_BALANCE_TIMEOUT_MS
  )

  try {
    const response = await fetchImpl(DEEPSEEK_BALANCE_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal
    })

    if (response.status === 401 || response.status === 403) {
      return { ok: false, reason: 'unauthorized' }
    }
    if (!response.ok) {
      return { ok: false, reason: 'unavailable' }
    }

    let body: unknown = null
    try {
      body = await response.json()
    } catch {
      return { ok: false, reason: 'unavailable' }
    }

    const parsed = body as DeepSeekBalanceResponse | null
    const info = parsed?.balance_infos?.[0]
    if (!info || info.total_balance === undefined || info.total_balance === null) {
      return { ok: false, reason: 'unavailable' }
    }

    return {
      ok: true,
      balance: {
        totalBalance: toBalanceAmount(info.total_balance),
        currency: (info.currency || 'USD').toUpperCase(),
        grantedBalance: toBalanceAmount(info.granted_balance),
        toppedUpBalance: toBalanceAmount(info.topped_up_balance),
        isAvailable: parsed?.is_available !== false
      }
    }
  } catch {
    return { ok: false, reason: 'unavailable' }
  } finally {
    clearTimeout(timer)
  }
}
