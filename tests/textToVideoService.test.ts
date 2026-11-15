import { describe, expect, it } from 'vitest'
import { findImageToVideoModel } from '../src/shared/falImageToVideoModels'
import { FAL_TEXT_TO_VIDEO_MODELS, findTextToVideoModel } from '../src/shared/falTextToVideoModels'
import {
  buildImageToVideoChatSystemPrompt,
  buildTextToVideoChatMessages,
  buildTextToVideoChatSystemPrompt,
  parseImageToVideoChatDecision,
  parseTextToVideoChatDecision
} from '../src/main/services/textToVideoChat'
import {
  buildImageToVideoPayload,
  buildTextToVideoPayload,
  extractFalOutputVideo,
  resolveVideoDurationValue,
  resolveVideoResolution
} from '../src/main/services/textToVideoService'
import {
  USAGE_EVENT_VIDEO_GENERATED,
  UsageLogger
} from '../src/main/services/usageLogger'
import {
  estimateVideoCostUsd,
  formatElectronIpcError
} from '../src/renderer/src/utils/textToVideoOptions'
import type {
  FalModelPreset,
  TextToVideoChatRequest,
  TextToVideoRequest,
  UsageRecord
} from '../src/shared/types'

const baseRequest: TextToVideoRequest = {
  endpointId: 'minimax/h3-max-turbo/text-to-video',
  prompt: 'A cinematic golden retriever running through neon rain at night',
  aspectId: '16:9',
  durationSeconds: 5,
  resolution: '720p',
  generateAudio: true
}

describe('TextToVideoService Payload 組裝與工具函式', () => {
  it('MiniMax H3 Max Turbo 應自動保留 prompt_expansion_mode 並對應最接近的 768P 解析度', () => {
    const model = findTextToVideoModel('minimax/h3-max-turbo/text-to-video')
    expect(model).toBeDefined()

    const payload = buildTextToVideoPayload(model, baseRequest)
    expect(payload.prompt).toBe(baseRequest.prompt)
    expect(payload.prompt_expansion_mode).toBe('balanced')
    expect(payload.aspect_ratio).toBe('16:9')
    expect(payload.duration).toBe(5)
    expect(payload.resolution).toBe('768P')
    // 不支援 negative_prompt 與音效開關時不可誤送
    expect(payload).not.toHaveProperty('negative_prompt')
    expect(payload).not.toHaveProperty('generate_audio')
  })

  it('resolveVideoDurationValue 應正確處理數字、字串與帶 s 後綴字串', () => {
    expect(resolveVideoDurationValue({ type: 'number', min: 2, max: 12 }, 20)).toBe(12)
    expect(
      resolveVideoDurationValue({ type: 'string', enum: ['4', '8', '12'], default: '4' }, 6)
    ).toBe('4')
    expect(
      resolveVideoDurationValue({ type: 'seconds_string', enum: ['5s', '10s'], default: '5s' }, 8)
    ).toBe('10s')
  })

  it('resolveVideoResolution 應支援大小寫與最接近高度比對', () => {
    expect(resolveVideoResolution(['480P', '768P', '1080P'], '480p', '16:9')).toBe('480P')
    expect(resolveVideoResolution(['480P', '768P', '1080P'], '720p', '16:9')).toBe('768P')
    expect(resolveVideoResolution(['720p', '1080p', '2K', '4K'], '1080p', '16:9')).toBe('1080p')
    expect(
      resolveVideoResolution(['landscape_16_9', 'portrait_16_9', 'square'], '720p', '9:16')
    ).toBe('portrait_16_9')
  })

  it('Kling v3 Pro 支援 generate_audio 時應正確帶入音效與字串 duration', () => {
    const kling = findTextToVideoModel('fal-ai/kling-video/v3/pro/text-to-video')
    expect(kling).toBeDefined()

    const payload = buildTextToVideoPayload(kling, {
      ...baseRequest,
      endpointId: kling!.id,
      durationSeconds: 5,
      generateAudio: true
    })
    expect(payload.generate_audio).toBe(true)
    expect(typeof payload.duration === 'string' || typeof payload.duration === 'number').toBe(true)
  })

  it('PixVerse 使用 generate_audio_switch 欄位且不應送出未支援欄位', () => {
    const pixverse = findTextToVideoModel('fal-ai/pixverse/v6/text-to-video')
    expect(pixverse).toBeDefined()

    const payload = buildTextToVideoPayload(pixverse, {
      ...baseRequest,
      endpointId: pixverse!.id,
      generateAudio: true
    })
    expect(payload.generate_audio_switch).toBe(true)
  })

  it('自訂模型若有 video_size 且不支援 resolution 時應自動填入 video_size', () => {
    const mockLtx: FalModelPreset = {
      id: 'fal-ai/ltx-test',
      name: 'LTX Test',
      description: 'test',
      imageInputField: 'image_url',
      videoSizeEnum: ['landscape_16_9', 'portrait_16_9', 'square_hd'],
      unsupportedFields: ['resolution', 'aspect_ratio'],
      durationSpec: { type: 'number', min: 1, max: 10 },
      defaultParams: {}
    }

    const payload = buildTextToVideoPayload(mockLtx, {
      ...baseRequest,
      aspectId: '9:16'
    })
    expect(payload.video_size).toBe('portrait_16_9')
    expect(payload).not.toHaveProperty('resolution')
    expect(payload).not.toHaveProperty('aspect_ratio')
  })

  it('extractFalOutputVideo 應能解析多種 fal.ai 回傳格式', () => {
    expect(
      extractFalOutputVideo({ video: { url: 'https://fal.media/out.mp4', width: 1280, height: 720 } })
    ).toEqual({ url: 'https://fal.media/out.mp4', width: 1280, height: 720, duration: undefined })

    expect(
      extractFalOutputVideo({ videos: [{ url: 'https://fal.media/list0.mp4' }] })
    ).toEqual({ url: 'https://fal.media/list0.mp4', width: undefined, height: undefined, duration: undefined })

    expect(extractFalOutputVideo({ url: 'https://fal.media/direct.webm' })).toEqual({
      url: 'https://fal.media/direct.webm',
      width: undefined,
      height: undefined,
      duration: undefined
    })

    expect(extractFalOutputVideo({})).toBeNull()
  })

  it('對話決策解析器與使用紀錄應正確處理文生影片資料', () => {
    const validIds = new Set(FAL_TEXT_TO_VIDEO_MODELS.map((m) => m.id))
    const chatRequest: TextToVideoChatRequest = {
      messages: [
        {
          role: 'user',
          content: '幫我構思一段夕陽海邊衝浪的影片',
          attachments: [
            {
              filePath: '/tmp/ref.png',
              fileName: 'ref.png',
              forVision: true,
              asReference: true
            }
          ]
        }
      ],
      endpointId: baseRequest.endpointId,
      aspectId: baseRequest.aspectId,
      durationSeconds: baseRequest.durationSeconds,
      resolution: baseRequest.resolution,
      generateAudio: baseRequest.generateAudio
    }
    const selectedModel = findTextToVideoModel(chatRequest.endpointId)
    const systemPrompt = buildTextToVideoChatSystemPrompt(chatRequest, { selectedModel })
    expect(systemPrompt).toContain(chatRequest.endpointId)
    expect(systemPrompt).toContain('## fal.ai 可用文生影片模型')
    expect(systemPrompt).toContain(`使用者目前選取的模型：${selectedModel?.name} (${chatRequest.endpointId})`)
    expect(systemPrompt).toContain('本輪對話可讓你看到的圖片（最多 6 張）：1 張')

    const chatMsgs = buildTextToVideoChatMessages(chatRequest, systemPrompt, [
      { messageIndex: 0, fileName: 'ref.png', dataUrl: 'data:image/png;base64,AAAA' }
    ])
    expect(chatMsgs[0].role).toBe('system')
    expect(Array.isArray(chatMsgs[1].content)).toBe(true)
    if (Array.isArray(chatMsgs[1].content)) {
      expect(chatMsgs[1].content[0]).toEqual({ type: 'text', text: '幫我構思一段夕陽海邊衝浪的影片' })
      expect(chatMsgs[1].content[2]).toEqual({
        type: 'image_url',
        image_url: { url: 'data:image/png;base64,AAAA', detail: 'auto' }
      })
    }

    const parsedGen = parseTextToVideoChatDecision(
      JSON.stringify({
        action: 'generate',
        reply: '好的，立即為您生成夕陽海浪影片',
        modelId: 'minimax/h3-max-turbo/text-to-video',
        prompt: 'Golden hour surfer riding ocean wave, drone tracking shot',
        useReferenceImages: true,
        applyModelChange: true
      }),
      validIds
    )
    expect(parsedGen.action).toBe('generate')
    expect(parsedGen.modelId).toBe('minimax/h3-max-turbo/text-to-video')
    expect(parsedGen.prompt).toContain('Golden hour surfer')
    expect(parsedGen.useReferenceImages).toBe(true)
    expect(parsedGen.applyModelChange).toBe(true)

    const parsedChat = parseTextToVideoChatDecision(
      JSON.stringify({
        action: 'chat',
        reply: '已幫你切換影片模型。',
        modelId: 'minimax/h3-max-turbo/text-to-video',
        applyModelChange: true
      }),
      validIds
    )
    expect(parsedChat.action).toBe('chat')
    expect(parsedChat.modelId).toBe('minimax/h3-max-turbo/text-to-video')
    expect(parsedChat.applyModelChange).toBe(true)
    expect(parsedChat.quickReplies.length).toBeGreaterThan(0)

    const parsedMulti = parseTextToVideoChatDecision(
      JSON.stringify({
        action: 'chat',
        reply: '可考慮 Gemini Omni Flash 1.2 或 Kling Video v3',
        modelId: 'Gemini Omni Flash 1.2 Text to Video',
        suggestedModelIds: [
          'google/gemini-omni-flash/v1.2/text-to-video',
          'fal-ai/kling-video/v3/pro/text-to-video'
        ]
      }),
      validIds
    )
    expect(parsedMulti.modelId).toBe('google/gemini-omni-flash/v1.2/text-to-video')
    expect(parsedMulti.suggestedModelIds).toEqual([
      'google/gemini-omni-flash/v1.2/text-to-video',
      'fal-ai/kling-video/v3/pro/text-to-video'
    ])

    const parsedFallback = parseTextToVideoChatDecision('非 JSON 純文字回覆', validIds)
    expect(parsedFallback.action).toBe('chat')
    expect(parsedFallback.reply).toBe('非 JSON 純文字回覆')
    expect(parsedFallback.modelId).toBe('')
    expect(parsedFallback.applyModelChange).toBe(false)

    const parsedInvalidModel = parseTextToVideoChatDecision(
      JSON.stringify({
        action: 'generate',
        reply: '測試無效模型過濾',
        modelId: 'not-a-valid/model',
        prompt: 'Test cinematic prompt',
        useReferenceImages: false
      }),
      validIds
    )
    expect(parsedInvalidModel.modelId).toBe('')

    const est1 = estimateVideoCostUsd(
      {
        id: 'm1',
        name: 'm1',
        description: '',
        pricing: { unitPriceUsd: 0.05, unit: 'seconds', currency: 'USD' }
      },
      6
    )
    expect(est1?.costUsd).toBeCloseTo(0.3)
    expect(est1?.note).toBe('依 6 秒估算')
    expect(
      estimateVideoCostUsd(
        {
          id: 'm2',
          name: 'm2',
          description: '',
          pricing: { unitPriceUsd: 0.25, unit: '5 seconds', currency: 'USD' }
        },
        8
      )
    ).toEqual({ costUsd: 0.5, note: '依 2 個 5 秒區段估算' })
    expect(
      estimateVideoCostUsd(
        {
          id: 'm3',
          name: 'm3',
          description: '',
          pricing: { unitPriceUsd: 0.4, unit: 'videos', currency: 'USD' }
        },
        5
      )
    ).toEqual({ costUsd: 0.4, note: '依單部影片計價' })

    const appended: UsageRecord[] = []
    const logger = new UsageLogger({
      sheets: {
        appendUsageRow: async (r) => {
          appended.push(r)
          return 2
        },
        updateCostCell: async () => undefined
      },
      getCurrentUser: () => ({
        id: 'u1',
        email: 'user@example.com',
        name: 'Tester',
        authMethod: 'google'
      })
    })
    logger.recordTextToVideoGenerated({
      endpointId: 'minimax/h3-max-turbo/text-to-video',
      sourceFileName: 'text2vid_20261116_0.mp4',
      costUsd: 0.125,
      costIsEstimated: false
    })
    expect(appended).toHaveLength(1)
    expect(appended[0].eventType).toBe(USAGE_EVENT_VIDEO_GENERATED)
    expect(appended[0].sourceFileName).toBe('text2vid_20261116_0.mp4')

    logger.recordImageToVideoGenerated({
      endpointId: 'google/gemini-omni-flash/v1.2/image-to-video',
      sourceFileName: 'img2vid_20261116_0.mp4',
      costUsd: 0.2184,
      costIsEstimated: true
    })
    expect(appended).toHaveLength(2)
    expect(appended[1].eventType).toBe(USAGE_EVENT_VIDEO_GENERATED)
    expect(appended[1].sourceFileName).toBe('img2vid_20261116_0.mp4')
  })

  it('ImageToVideoService Payload 與對話系統提示應正確處理單圖、首尾幀、多圖陣列與選填提示詞', () => {
    const omniImg2Vid = findImageToVideoModel('google/gemini-omni-flash/v1.2/image-to-video')
    expect(omniImg2Vid).toBeDefined()
    const singlePayload = buildImageToVideoPayload(
      omniImg2Vid,
      { ...baseRequest, endpointId: omniImg2Vid!.id },
      ['https://fal.media/first.png', 'https://fal.media/last.png']
    )
    expect(singlePayload.image_url).toBe('https://fal.media/first.png')
    expect(singlePayload.end_image_url).toBe('https://fal.media/last.png')
    expect(singlePayload.prompt).toBe(baseRequest.prompt)

    const klingImg2Vid = findImageToVideoModel('fal-ai/kling-video/v3/pro/image-to-video')
    expect(klingImg2Vid).toBeDefined()
    const optionalPromptPayload = buildImageToVideoPayload(
      klingImg2Vid,
      { ...baseRequest, endpointId: klingImg2Vid!.id, prompt: '   ' },
      ['https://fal.media/start.png']
    )
    expect(optionalPromptPayload.start_image_url).toBe('https://fal.media/start.png')
    expect(optionalPromptPayload).not.toHaveProperty('prompt')

    const arrayRefModel = findImageToVideoModel('google/gemini-omni-flash/v1.2/reference-to-video')
    expect(arrayRefModel).toBeDefined()
    const arrayPayload = buildImageToVideoPayload(
      arrayRefModel,
      { ...baseRequest, endpointId: arrayRefModel!.id },
      ['https://fal.media/a.png', 'https://fal.media/b.png']
    )
    expect(arrayPayload.image_urls).toEqual(['https://fal.media/a.png', 'https://fal.media/b.png'])

    const imgChatPrompt = buildImageToVideoChatSystemPrompt(
      {
        messages: [{ role: 'user', content: '幫這張圖設計運鏡' }],
        endpointId: omniImg2Vid!.id,
        aspectId: '16:9',
        durationSeconds: 8,
        resolution: '720p',
        generateAudio: true
      },
      { selectedModel: omniImg2Vid }
    )
    expect(imgChatPrompt).toContain('圖生影片')
    expect(imgChatPrompt).toContain('google/gemini-omni-flash/v1.2/image-to-video')

    const parsedDecision = parseImageToVideoChatDecision(
      JSON.stringify({
        action: 'chat',
        reply: '建議使用 Gemini Omni Flash 1.2 或 Kling v3 Pro。',
        prompt: '',
        modelId: 'google/gemini-omni-flash/v1.2/image-to-video',
        suggestedModelIds: [
          'google/gemini-omni-flash/v1.2/image-to-video',
          'fal-ai/kling-video/v3/pro/image-to-video'
        ],
        useReferenceImages: true,
        applyModelChange: false
      })
    )
    expect(parsedDecision.suggestedModelIds).toEqual([
      'google/gemini-omni-flash/v1.2/image-to-video',
      'fal-ai/kling-video/v3/pro/image-to-video'
    ])

    expect(
      formatElectronIpcError(new TypeError('window.electronAPI.generateImageToVideo is not a function'))
    ).toContain('重新執行 npm run dev')
    expect(
      formatElectronIpcError(new Error("No handler registered for 'image-to-video:generate'"))
    ).toContain('主程序尚未載入最新功能')
    expect(formatElectronIpcError(new Error('一般 API 錯誤'))).toBe('一般 API 錯誤')
  })
})
