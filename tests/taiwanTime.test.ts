import { describe, expect, it } from 'vitest'
import { formatTaiwanTime } from '../src/main/services/taiwanTime'

describe('formatTaiwanTime', () => {
  it('把 UTC 時間轉成台灣時間（UTC+8）', () => {
    // 2026-11-14 04:05:03 UTC → 2026-11-14 12:05:03 台北
    expect(formatTaiwanTime(Date.UTC(2026, 10, 14, 4, 5, 3))).toBe('2026-11-14 12:05:03')
  })

  it('跨日邊界：UTC 16:00 之後即為台灣隔天', () => {
    expect(formatTaiwanTime('2026-11-13T16:00:00.000Z')).toBe('2026-11-14 00:00:00')
    expect(formatTaiwanTime('2026-11-13T15:59:59.999Z')).toBe('2026-11-13 23:59:59')
  })

  it('跨年邊界正確', () => {
    expect(formatTaiwanTime('2025-12-31T16:00:00.000Z')).toBe('2026-01-01 00:00:00')
  })

  it('接受 Date 物件與毫秒 timestamp', () => {
    const iso = '2026-11-14T04:05:03.000Z'
    expect(formatTaiwanTime(new Date(iso))).toBe('2026-11-14 12:05:03')
    expect(formatTaiwanTime(Date.parse(iso))).toBe('2026-11-14 12:05:03')
  })

  it('秒數以下會截斷，且數字補零', () => {
    expect(formatTaiwanTime('2026-01-02T03:04:05.678Z')).toBe('2026-01-02 11:04:05')
    expect(formatTaiwanTime('2026-01-02T16:07:08.000Z')).toBe('2026-01-03 00:07:08')
  })

  it('無效輸入回傳空字串（避免寫入 Invalid Date）', () => {
    expect(formatTaiwanTime('not-a-date')).toBe('')
    expect(formatTaiwanTime(Number.NaN)).toBe('')
    expect(formatTaiwanTime(new Date('invalid'))).toBe('')
  })
})
