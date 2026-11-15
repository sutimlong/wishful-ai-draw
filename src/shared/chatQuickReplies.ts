/** 對話模式的預設快速回覆（DeepSeek 未回傳時使用） */
export const DEFAULT_IMAGE_CHAT_QUICK_REPLIES = ['好', '請繼續', '再具體一點']
export const DEFAULT_IMAGE_GENERATE_QUICK_REPLIES = ['再生成一張', '調整風格', '換個模型']
export const DEFAULT_VIDEO_CHAT_QUICK_REPLIES = ['好', '請繼續', '再具體一點']
export const DEFAULT_VIDEO_GENERATE_QUICK_REPLIES = ['再生成一段', '調整鏡頭', '換個模型']

/**
 * 將 DeepSeek 回傳的 quickReplies 正規化：
 * - 只接受字串，去除項目符號／編號與多餘空白
 * - 去重、最多 4 個、每個最多 30 字
 * - 若沒有任何有效值，回傳指定的預設快速回覆
 */
export function normalizeQuickReplies(value: unknown, fallback: string[]): string[] {
  const raw = Array.isArray(value) ? value : []
  const replies: string[] = []

  for (const item of raw) {
    if (typeof item !== 'string') continue
    const text = item
      .replace(/^\s*(?:[-•*]|\d+[.)、])\s*/, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!text || text.length > 30) continue
    if (replies.includes(text)) continue
    replies.push(text)
    if (replies.length >= 4) break
  }

  return replies.length > 0 ? replies : [...fallback]
}
