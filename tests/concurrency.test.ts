import { describe, expect, it } from 'vitest'
import { clampConcurrency, MAX_BATCH_CONCURRENCY } from '../src/shared/concurrency'

describe('批次生成併發上限', () => {
  it('上限對應 fal.ai 自助方案的最大併發數 40', () => {
    expect(MAX_BATCH_CONCURRENCY).toBe(40)
  })

  it('併發數一律被限制在 1 ~ 40', () => {
    expect(clampConcurrency(0)).toBe(1)
    expect(clampConcurrency(-5)).toBe(1)
    expect(clampConcurrency(1)).toBe(1)
    expect(clampConcurrency(10)).toBe(10)
    expect(clampConcurrency(40)).toBe(40)
    expect(clampConcurrency(41)).toBe(40)
    expect(clampConcurrency(999)).toBe(40)
  })

  it('非整數會四捨五入，非數字退回 1', () => {
    expect(clampConcurrency(12.6)).toBe(13)
    expect(clampConcurrency(Number.NaN)).toBe(1)
  })
})
