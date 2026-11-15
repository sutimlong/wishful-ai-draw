import { describe, expect, it } from 'vitest'
import type { FalModelPreset, TextToImageChatRequest } from '../src/shared/types'
import { DEFAULT_IMAGE_GENERATE_QUICK_REPLIES } from '../src/shared/chatQuickReplies'
import {
  buildTextToImageChatMessages,
  buildTextToImageChatSystemPrompt,
  collectTextToImageChatReferencePaths,
  collectTextToImageChatVisionTargets,
  describeTextToImageChatModel,
  extractRecommendedModelsFromReply,
  findChatModel,
  parseTextToImageChatDecision,
  resolveChatSuggestedModels
} from '../src/main/services/textToImageChat'
import { FAL_TEXT_TO_IMAGE_MODELS } from '../src/shared/falTextToImageModels'
import { FAL_TEXT_TO_VIDEO_MODELS } from '../src/shared/falTextToVideoModels'

const MODEL: FalModelPreset = {
  id: 'fal-ai/test-model',
  name: 'Test Model',
  description: 'A test text-to-image model for unit tests.',
  group: 'Test Lab',
  imageInputField: '',
  referenceImageField: 'image_urls',
  isArrayReferenceImage: true,
  pricing: {
    perImageUsd: 0.03,
    unit: 'images',
    unitPriceUsd: 0.03,
    basis: 'test price'
  },
  defaultParams: {}
}

const REQUEST: TextToImageChatRequest = {
  messages: [
    {
      role: 'user',
      content: '我想做一張電影感的城市夜景',
      attachments: [
        {
          filePath: '/tmp/city.png',
          fileName: 'city.png',
          forVision: true,
          asReference: true
        }
      ]
    },
    { role: 'assistant', content: '可以，建議使用冷暖對比的霓虹燈光。' },
    {
      role: 'user',
      content: '就用這個方向生成',
      attachments: [
        {
          filePath: '/tmp/city.png',
          fileName: 'city.png',
          forVision: true,
          asReference: true
        },
        {
          filePath: '/tmp/style.png',
          fileName: 'style.png',
          forVision: false,
          asReference: true
        }
      ]
    }
  ],
  endpointId: MODEL.id,
  aspectId: '16:9',
  numImages: 2,
  outputFormat: 'png'
}

describe('對話模式：模型目錄與系統提示詞', () => {
  it('模型摘要包含參考圖能力、價格與簡介', () => {
    const line = describeTextToImageChatModel(MODEL)
    expect(line).toContain('fal-ai/test-model')
    expect(line).toContain('支援多張參考圖')
    expect(line).toContain('$0.03 / 張')
    expect(line).toContain('A test text-to-image model')
  })

  it('系統提示詞帶入目前模型、介面設定與參考圖數量', () => {
    const prompt = buildTextToImageChatSystemPrompt(REQUEST, {
      models: [MODEL],
      selectedModel: MODEL
    })

    expect(prompt).toContain('DeepSeek Flash')
    expect(prompt).toContain('Test Model (fal-ai/test-model)')
    expect(prompt).toContain('畫面比例：16:9')
    expect(prompt).toContain('生成張數：2')
    expect(prompt).toContain('輸出格式：png')
    // 同一張 city.png 不重複計數；style.png 只有參考用途
    expect(prompt).toContain('生成時可使用的參考圖總數：2 張')
    expect(prompt).toContain('僅供生成參考（你看不到）的圖片：1 張')
    expect(prompt).toContain('"action":"chat"|"generate"')
  })
})

describe('對話模式：DeepSeek 訊息組裝', () => {
  it('使用者訊息會包含文字與圖片內容片段，assistant 只保留文字', () => {
    const messages = buildTextToImageChatMessages(REQUEST, 'system prompt', [
      { messageIndex: 0, fileName: 'city.png', dataUrl: 'data:image/jpeg;base64,AAA' }
    ])

    expect(messages[0]).toEqual({ role: 'system', content: 'system prompt' })
    expect(messages[1].role).toBe('user')
    const firstContent = messages[1].content
    expect(Array.isArray(firstContent)).toBe(true)
    if (Array.isArray(firstContent)) {
      expect(firstContent[0]).toEqual({ type: 'text', text: '我想做一張電影感的城市夜景' })
      expect(firstContent[1]).toMatchObject({ type: 'text' })
      expect(firstContent[2]).toMatchObject({
        type: 'image_url',
        image_url: { url: 'data:image/jpeg;base64,AAA', detail: 'auto' }
      })
    }
    expect(messages[2]).toEqual({ role: 'assistant', content: '可以，建議使用冷暖對比的霓虹燈光。' })
    expect(messages[3].content).toBe('就用這個方向生成')
  })

  it('只有圖片而沒有文字時仍會送出可理解的提示文字', () => {
    const messages = buildTextToImageChatMessages(
      {
        ...REQUEST,
        messages: [
          {
            role: 'user',
            content: '',
            attachments: [
              { filePath: '/tmp/a.png', fileName: 'a.png', forVision: false, asReference: true }
            ]
          }
        ]
      },
      'system',
      []
    )

    expect(messages[1]).toEqual({ role: 'user', content: '請看我上傳的圖片。' })
  })
})

describe('對話模式：DeepSeek 決策解析', () => {
  it('解析 generate 決策與模型 id', () => {
    const decision = parseTextToImageChatDecision(
      JSON.stringify({
        action: 'generate',
        reply: '好的，我用 Test Model 生成。',
        prompt: 'a cinematic neon city at night, 16:9',
        modelId: MODEL.id
      })
    )

    expect(decision).toEqual({
      action: 'generate',
      reply: '好的，我用 Test Model 生成。',
      prompt: 'a cinematic neon city at night, 16:9',
      modelId: MODEL.id,
      useReferenceImages: true,
      applyModelChange: false,
      quickReplies: DEFAULT_IMAGE_GENERATE_QUICK_REPLIES
    })
  })

  it('會保留 DeepSeek 提供的 quickReplies 並過濾無效值', () => {
    const decision = parseTextToImageChatDecision(
      JSON.stringify({
        action: 'chat',
        reply: '想先確認你想要的風格。',
        modelId: '',
        quickReplies: [' 好 ', '請繼續', '好', '', '再具體一點', '多出來的回覆']
      })
    )

    expect(decision.quickReplies).toEqual(['好', '請繼續', '再具體一點', '多出來的回覆'])
  })

  it('使用者明確要求切換模型時會標記 applyModelChange', () => {
    const decision = parseTextToImageChatDecision(
      JSON.stringify({
        action: 'chat',
        reply: '已幫你改用 Test Model。',
        prompt: '',
        modelId: MODEL.id,
        applyModelChange: true
      })
    )

    expect(decision.action).toBe('chat')
    expect(decision.modelId).toBe(MODEL.id)
    expect(decision.applyModelChange).toBe(true)
  })

  it('可依使用者要求關閉對話中的參考圖', () => {
    const decision = parseTextToImageChatDecision(
      JSON.stringify({
        action: 'generate',
        reply: '這次不使用參考圖。',
        prompt: 'a cat',
        modelId: MODEL.id,
        useReferenceImages: false
      })
    )

    expect(decision.action).toBe('generate')
    expect(decision.useReferenceImages).toBe(false)
  })

  it('支援 markdown code fence 包住的 JSON', () => {
    const decision = parseTextToImageChatDecision(
      '```json\n{"action":"chat","reply":"你想要什麼風格？","prompt":"","modelId":""}\n```'
    )

    expect(decision.action).toBe('chat')
    expect(decision.reply).toBe('你想要什麼風格？')
  })

  it('action 大小寫不一致時仍能辨識 generate', () => {
    const decision = parseTextToImageChatDecision(
      '{"action":"GENERATE","reply":"生成中","prompt":"a cat","modelId":"fal-ai/test-model"}'
    )

    expect(decision.action).toBe('generate')
    expect(decision.prompt).toBe('a cat')
  })

  it('generate 缺少 prompt 時退回對話，避免空提示詞生成', () => {
    const decision = parseTextToImageChatDecision(
      '{"action":"generate","reply":"需要更多細節","prompt":"","modelId":"fal-ai/test-model"}'
    )

    expect(decision.action).toBe('chat')
    expect(decision.reply).toContain('需要更多細節')
  })

  it('不是 JSON 時把原始內容當作一般回覆', () => {
    const decision = parseTextToImageChatDecision('這是一段普通的對話回覆')

    expect(decision.action).toBe('chat')
    expect(decision.reply).toBe('這是一段普通的對話回覆')
  })
})

describe('對話模式：附件用途收集', () => {
  it('參考圖會去重並保留順序', () => {
    expect(collectTextToImageChatReferencePaths(REQUEST.messages)).toEqual([
      '/tmp/city.png',
      '/tmp/style.png'
    ])
  })

  it('看圖目標只取最近 N 張', () => {
    const targets = collectTextToImageChatVisionTargets(REQUEST.messages, 1)
    expect(targets).toEqual([
      { messageIndex: 2, filePath: '/tmp/city.png', fileName: 'city.png' }
    ])
  })
})

describe('對話模式：推薦模型擷取與多模型切換清單', () => {
  it('支援解析 JSON 中的 suggestedModelIds 多模型清單與系統提示詞指引', () => {
    const prompt = buildTextToImageChatSystemPrompt(REQUEST, {
      models: [MODEL],
      selectedModel: MODEL
    })
    expect(prompt).toContain('suggestedModelIds')

    const decision = parseTextToImageChatDecision(
      JSON.stringify({
        action: 'chat',
        reply: '建議使用 Nano Banana Pro 或 GPT Image 2 Edit',
        prompt: '',
        modelId: 'fal-ai/nano-banana-pro/edit',
        suggestedModelIds: ['fal-ai/nano-banana-pro/edit', 'openai/gpt-image-2/edit'],
        applyModelChange: false
      })
    )
    expect(decision.modelId).toBe('fal-ai/nano-banana-pro/edit')
    expect(decision.suggestedModelIds).toEqual([
      'fal-ai/nano-banana-pro/edit',
      'openai/gpt-image-2/edit'
    ])
  })

  it('findChatModel 能忽略星號前綴與「可參考圖」標記進行匹配', () => {
    const found = findChatModel('★ Nano Banana Pro（可參考圖）', FAL_TEXT_TO_IMAGE_MODELS)
    expect(found?.id).toBe('fal-ai/nano-banana-pro/edit')

    const videoFound = findChatModel('Gemini Omni Flash 1.2 Text to Video', FAL_TEXT_TO_VIDEO_MODELS)
    expect(videoFound?.id).toBe('google/gemini-omni-flash/v1.2/text-to-video')
  })

  it('DeepSeek 未填 modelId 時，也能從回覆文字自動擷取推薦的多個模型並排除否定與目前模型', () => {
    const resolved = resolveChatSuggestedModels({
      decision: {
        action: 'chat',
        reply:
          '你目前的 Gemini Omni Flash 1.2 Text to Video 較適合快速預覽，不建議使用 Seedance 2.0 Fast Text to Video；若重視運鏡張力，推薦改用 Kling Video v3 Text to Video [Pro] 或 H3 Max Turbo Text to Video。',
        modelId: ''
      },
      models: FAL_TEXT_TO_VIDEO_MODELS,
      currentEndpointId: 'google/gemini-omni-flash/v1.2/text-to-video'
    })

    expect(resolved.suggestedModelIds).toEqual([
      'fal-ai/kling-video/v3/pro/text-to-video',
      'minimax/h3-max-turbo/text-to-video'
    ])
    expect(resolved.suggestedModelId).toBe('fal-ai/kling-video/v3/pro/text-to-video')
  })

  it('回覆同時包含子字串與較長模型名稱時，不應重複誤判較短名稱', () => {
    const extracted = extractRecommendedModelsFromReply(
      '這張海報建議用 Flux 2 Pro 或 Nano Banana 2.1 來製作。',
      FAL_TEXT_TO_IMAGE_MODELS
    )
    expect(extracted.map((m) => m.id)).toEqual([
      'fal-ai/flux-2-pro',
      expect.stringMatching(/nano-banana/)
    ])
  })
})
