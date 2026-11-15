/**
 * 判斷使用者是否明確要求「切換／指定模型」。
 *
 * DeepSeek 會回傳 applyModelChange，但有時（例如「幫我改指定的模型」）
 * 模型只回覆建議而未帶旗標；這裡再做一次本地意圖判斷，確保右側選單同步。
 */
const MODEL_SWITCH_INTENT =
  /(?:幫我改|改(?:用|為|成|指)|切換|換(?:成|到|個|一個|模型)|套用|指定使用|指定.{0,6}模型|使用.{0,6}模型|switch\s+(?:to|model)|change\s+(?:to|model)|use\s+.{0,24}model)/i

export function userRequestedModelChange(text: string): boolean {
  return MODEL_SWITCH_INTENT.test(text)
}

/**
 * 判斷是否應立即套用 DeepSeek 建議的模型。
 * - DeepSeek 明確標記 applyModelChange
 * - 或使用者文字本身具有切換模型意圖
 * - 且建議模型與目前模型不同
 */
export function shouldApplySuggestedModel(params: {
  currentEndpointId: string
  suggestedModelId?: string
  applyModelChange?: boolean
  userText: string
}): boolean {
  const suggested = params.suggestedModelId
  if (!suggested || suggested === params.currentEndpointId) return false
  return params.applyModelChange === true || userRequestedModelChange(params.userText)
}
