import { describe, expect, it } from 'vitest'
import { toRowValues } from '../src/main/services/googleSheetsService'
import type { UsageRecord } from '../src/shared/types'

const BASE_RECORD: UsageRecord = {
  timestamp: Date.UTC(2026, 0, 2, 3, 4, 5),
  userEmail: 'alice@example.com',
  userName: 'Alice',
  eventType: 'image_generated',
  sourceFileName: 'a.png',
  endpointId: 'fal-ai/flux/dev',
  imageCount: 1,
  status: 'completed'
}

describe('toRowValues', () => {
  it('圖片生成列：A ~ J 共 10 欄，時間為台灣時間', () => {
    expect(
      toRowValues({
        ...BASE_RECORD,
        costUsd: 0.025,
        costCurrency: 'USD',
        costIsEstimated: false
      })
    ).toEqual([
      '2026-01-02 11:04:05',
      'alice@example.com',
      'Alice',
      'image_generated',
      'a.png',
      'fal-ai/flux/dev',
      '1',
      '0.025000',
      '實際',
      'completed'
    ])
  })

  it('提示詞優化列：張數與花費欄留空，事件為 Prompt word_optimization', () => {
    const row = toRowValues({
      ...BASE_RECORD,
      eventType: 'Prompt word_optimization',
      sourceFileName: '一隻貓 坐在窗邊',
      endpointId: 'deepseek-chat',
      imageCount: undefined,
      status: 'success'
    })

    expect(row).toHaveLength(10)
    expect(row[3]).toBe('Prompt word_optimization')
    expect(row[4]).toBe('一隻貓 坐在窗邊')
    expect(row[5]).toBe('deepseek-chat')
    expect(row[6]).toBe('')
    expect(row[7]).toBe('')
    expect(row[8]).toBe('')
    expect(row[9]).toBe('success')
  })
})
