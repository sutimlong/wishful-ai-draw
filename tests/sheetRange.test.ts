import { describe, expect, it } from 'vitest'
import { parseRowNumber } from '../src/main/services/sheetRange'

describe('parseRowNumber', () => {
  it('解析 Google Sheets 回傳的 updatedRange', () => {
    expect(parseRowNumber('Sheet1!A15:J15')).toBe(15)
    expect(parseRowNumber("'我的工作表'!A3")).toBe(3)
    expect(parseRowNumber('Sheet1!B7')).toBe(7)
  })

  it('無效輸入回傳 null', () => {
    expect(parseRowNumber(undefined)).toBeNull()
    expect(parseRowNumber(null)).toBeNull()
    expect(parseRowNumber('')).toBeNull()
    expect(parseRowNumber('Sheet1!A')).toBeNull()
    expect(parseRowNumber('Sheet1!A0')).toBeNull()
  })
})
