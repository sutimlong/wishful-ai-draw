/**
 * 從 Google Sheets API 回傳的 `updatedRange` 解析列號。
 *
 * 範例：`Sheet1!A15:J15` → 15；`'我的表'!A3` → 3
 */
export function parseRowNumber(updatedRange?: string | null): number | null {
  if (!updatedRange) return null
  const match = updatedRange.match(/![A-Z]+(\d+)/)
  if (!match) return null
  const row = Number(match[1])
  return Number.isFinite(row) && row > 0 ? row : null
}
