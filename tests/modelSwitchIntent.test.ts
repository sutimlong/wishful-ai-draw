import { describe, expect, it } from 'vitest'
import {
  shouldApplySuggestedModel,
  userRequestedModelChange
} from '../src/renderer/src/utils/modelSwitchIntent'

describe('模型切換意圖判斷', () => {
  it('使用者明確要求切換或指定模型時回傳 true', () => {
    expect(userRequestedModelChange('幫我改指定的模型')).toBe(true)
    expect(userRequestedModelChange('請改用 nano banana 2.1')).toBe(true)
    expect(userRequestedModelChange('幫我換成 FLUX 2 Pro')).toBe(true)
    expect(userRequestedModelChange('切換到 GPT Image 2')).toBe(true)
    expect(userRequestedModelChange('使用這個模型生成')).toBe(true)
    expect(userRequestedModelChange('please switch to FLUX')).toBe(true)
  })

  it('只是詢問推薦時不應自動切換', () => {
    expect(userRequestedModelChange('你有推薦的模型嗎？')).toBe(false)
    expect(userRequestedModelChange('哪個模型比較適合寫實風格？')).toBe(false)
    expect(userRequestedModelChange('這個模型的價格是多少？')).toBe(false)
  })

  it('只有明確切換意圖或 DeepSeek 標記時才立即套用建議模型', () => {
    expect(
      shouldApplySuggestedModel({
        currentEndpointId: 'model-a',
        suggestedModelId: 'model-b',
        applyModelChange: false,
        userText: '幫我改指定的模型'
      })
    ).toBe(true)

    expect(
      shouldApplySuggestedModel({
        currentEndpointId: 'model-a',
        suggestedModelId: 'model-b',
        applyModelChange: true,
        userText: '你有推薦的模型嗎？'
      })
    ).toBe(true)

    expect(
      shouldApplySuggestedModel({
        currentEndpointId: 'model-a',
        suggestedModelId: 'model-b',
        applyModelChange: false,
        userText: '你有推薦的模型嗎？'
      })
    ).toBe(false)

    expect(
      shouldApplySuggestedModel({
        currentEndpointId: 'model-a',
        suggestedModelId: 'model-a',
        applyModelChange: true,
        userText: '切換模型'
      })
    ).toBe(false)
  })
})
