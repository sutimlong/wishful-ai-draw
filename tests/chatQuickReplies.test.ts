import { describe, expect, it } from 'vitest'
import {
  DEFAULT_IMAGE_CHAT_QUICK_REPLIES,
  normalizeQuickReplies
} from '../src/shared/chatQuickReplies'

describe('快速回覆正規化', () => {
  it('會清除編號、去重、限制數量並保留順序', () => {
    const replies = normalizeQuickReplies(
      [' 1. 好 ', '2. 請繼續', '好', '- 再具體一點', '3. 開始生成', '多出來的回覆'],
      ['備用']
    )

    expect(replies).toEqual(['好', '請繼續', '再具體一點', '開始生成'])
  })

  it('模型沒有提供有效快速回覆時使用預設值', () => {
    expect(normalizeQuickReplies(undefined, DEFAULT_IMAGE_CHAT_QUICK_REPLIES)).toEqual(
      DEFAULT_IMAGE_CHAT_QUICK_REPLIES
    )
    expect(normalizeQuickReplies(['', '   '], DEFAULT_IMAGE_CHAT_QUICK_REPLIES)).toEqual(
      DEFAULT_IMAGE_CHAT_QUICK_REPLIES
    )
    expect(normalizeQuickReplies('好', DEFAULT_IMAGE_CHAT_QUICK_REPLIES)).toEqual(
      DEFAULT_IMAGE_CHAT_QUICK_REPLIES
    )
  })

  it('忽略過長或非字串項目', () => {
    const tooLong = '這是一個刻意超過三十個字的快速回覆內容，用來確認過長的項目不會被顯示在聊天氣泡下方'
    expect(normalizeQuickReplies([tooLong, 123, '好'], ['備用'])).toEqual(['好'])
  })
})
