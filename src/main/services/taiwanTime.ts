/** 台灣標準時間為 UTC+8（自 1979 年起無日光節約時間，故固定位移即可） */
const TAIWAN_OFFSET_MS = 8 * 60 * 60 * 1000

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * 將時間點格式化為台灣時間字串（`YYYY-MM-DD HH:mm:ss`）。
 *
 * - 以固定 +8 小時位移計算，**不受執行環境時區影響**（避免使用者電腦在國外時寫入錯誤時間）
 * - 輸出為不帶時區的「牆上時間」，寫入 Google 試算表後會直接顯示台灣時間
 * - 無法解析的時間回傳空字串，避免寫入 `Invalid Date`
 */
export function formatTaiwanTime(timestamp: number | string | Date): string {
  const time = timestamp instanceof Date ? timestamp.getTime() : new Date(timestamp).getTime()
  if (!Number.isFinite(time)) return ''

  const shifted = new Date(time + TAIWAN_OFFSET_MS)
  const datePart = `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(
    shifted.getUTCDate()
  )}`
  const timePart = `${pad2(shifted.getUTCHours())}:${pad2(shifted.getUTCMinutes())}:${pad2(
    shifted.getUTCSeconds()
  )}`

  return `${datePart} ${timePart}`
}
