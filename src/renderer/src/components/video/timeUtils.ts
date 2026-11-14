/**
 * 影片剪輯器使用的純工具函式（不依賴 React / Electron，方便單元測試）。
 */

const pad2 = (value: number): string => String(Math.floor(Math.abs(value))).padStart(2, '0')

/** 將數值夾在 min 與 max 之間（NaN 時回傳 min） */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

/**
 * 格式化時間碼。
 * - fps > 0：`HH:MM:SS:FF`（FF 為該秒內的影格編號，範圍 0 ~ fps-1）
 * - 否則：`HH:MM:SS.mmm`
 */
export function formatTimecode(seconds: number, fps = 0): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  const whole = Math.floor(safe)
  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const secs = whole % 60
  const base = `${pad2(hours)}:${pad2(minutes)}:${pad2(secs)}`

  if (Number.isFinite(fps) && fps > 0) {
    const maxFrame = Math.max(0, Math.ceil(fps) - 1)
    const frame = Math.min(maxFrame, Math.floor((safe - whole) * fps))
    return `${base}:${pad2(frame)}`
  }

  const ms = Math.round((safe - whole) * 1000)
  return `${base}.${String(ms).padStart(3, '0')}`
}

/** 將時間對齊到最接近的影格（fps <= 0 時僅保證非負） */
export function snapToFrame(seconds: number, fps: number): number {
  if (!Number.isFinite(seconds)) return 0
  const safe = Math.max(0, seconds)
  if (!Number.isFinite(fps) || fps <= 0) return safe
  return Math.round(safe * fps) / fps
}

/** 時間 → 時間軸百分比 (0 ~ 100) */
export function timeToPercent(time: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0
  return clamp((time / duration) * 100, 0, 100)
}

/** 時間軸百分比 (0 ~ 100) → 時間（秒） */
export function percentToTime(percent: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0
  return clamp((percent / 100) * duration, 0, duration)
}

/** 依影片長度決定膠捲縮圖張數（8 ~ 24 張） */
export function resolveFilmstripCount(duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 8
  return Math.max(8, Math.min(24, Math.ceil(duration)))
}
