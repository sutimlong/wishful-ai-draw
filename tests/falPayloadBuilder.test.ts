import { describe, expect, it } from 'vitest'
import {
  buildFalInputPayload,
  extractFalOutputImageUrl
} from '../src/main/services/falPayloadBuilder'
import { BatchItem, DEFAULT_FAL_PRESETS, GenerationConfig } from '../src/shared/types'

const baseItem: BatchItem = {
  id: 'item-1',
  sourceFilePath: '/tmp/sample.png',
  sourceFileName: 'sample.png',
  sourcePreviewUrl: 'local-media://image?path=%2Ftmp%2Fsample.png',
  status: 'idle',
  progress: 0
}

const baseConfig: GenerationConfig = {
  endpointId: 'fal-ai/flux/dev/image-to-image',
  imageInputField: 'image_url',
  isArrayImageInput: false,
  prompt: 'global cinematic prompt',
  negativePrompt: 'blurry, lowres',
  strength: 0.75,
  numInferenceSteps: 28,
  guidanceScale: 3.5,
  outputFormat: 'png',
  seed: 42,
  customJsonParams: '',
  upscale: { enabled: false, factor: 2, creativity: 0.35, resemblance: 0.6, guidanceScale: 4, numInferenceSteps: 18 },
  backgroundRemoval: { enabled: false, model: 'General Use (Light)', operatingResolution: '1024x1024', refineForeground: true, outputFormat: 'png' },
  resize: { enabled: false, width: 1024, height: 1024, fit: 'contain', outputFormat: 'png' },
  faceRestore: { enabled: false, fidelity: 0.5, upscaleFactor: 2, faceUpscale: true, aligned: false, onlyCenterFace: false }
}

describe('falPayloadBuilder', () => {
  it('builds standard single image_url payload with global prompt', () => {
    const payload = buildFalInputPayload(
      baseItem,
      baseConfig,
      'https://fal.media/files/uploaded.png'
    )

    expect(payload).toEqual({
      image_url: 'https://fal.media/files/uploaded.png',
      prompt: 'global cinematic prompt',
      negative_prompt: 'blurry, lowres',
      strength: 0.75,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      output_format: 'png',
      seed: 42
    })
  })

  it('overrides global prompt when item has customPrompt and wraps array image field', () => {
    const itemWithCustom: BatchItem = {
      ...baseItem,
      customPrompt: 'custom anime style portrait'
    }
    const arrayConfig: GenerationConfig = {
      ...baseConfig,
      imageInputField: 'image_urls',
      isArrayImageInput: true,
      seed: null
    }

    const payload = buildFalInputPayload(
      itemWithCustom,
      arrayConfig,
      'https://fal.media/files/uploaded.png'
    )

    expect(payload.image_urls).toEqual(['https://fal.media/files/uploaded.png'])
    expect(payload.prompt).toBe('custom anime style portrait')
    expect(payload.seed).toBeUndefined()
  })

  it('merges customJsonParams and throws on invalid JSON', () => {
    const configWithJson: GenerationConfig = {
      ...baseConfig,
      customJsonParams: '{"safety_tolerance": "2", "upscale_factor": 4}'
    }

    const payload = buildFalInputPayload(
      baseItem,
      configWithJson,
      'https://fal.media/files/uploaded.png'
    )

    expect(payload.safety_tolerance).toBe('2')
    expect(payload.upscale_factor).toBe(4)

    const badJsonConfig: GenerationConfig = {
      ...baseConfig,
      customJsonParams: '{invalid_json'
    }

    expect(() =>
      buildFalInputPayload(baseItem, badJsonConfig, 'https://fal.media/files/uploaded.png')
    ).toThrow(/JSON/)
  })

  it('omits diffusion-only params and seed for OpenAI GPT Image family models', () => {
    const gptConfig: GenerationConfig = {
      ...baseConfig,
      // fal.ai 實測：GPT Image 2.6 圖生圖端點為 fal-ai/gpt-image-2.6-sunburst/edit
      endpointId: 'fal-ai/gpt-image-2.6-sunburst/edit',
      imageInputField: 'image_urls',
      isArrayImageInput: true,
      includeDiffusionParams: false
    }

    const payload = buildFalInputPayload(
      baseItem,
      gptConfig,
      'https://fal.media/files/uploaded.png'
    )

    expect(payload).toEqual({
      image_urls: ['https://fal.media/files/uploaded.png'],
      prompt: 'global cinematic prompt',
      output_format: 'png'
    })
    expect(payload.strength).toBeUndefined()
    expect(payload.num_inference_steps).toBeUndefined()
    expect(payload.guidance_scale).toBeUndefined()
    expect(payload.negative_prompt).toBeUndefined()
    expect(payload.seed).toBeUndefined()
  })

  it('defaults to GPT Image 2.6 Sunburst and provides both requested presets', () => {
    // 實測確認的 fal.ai 端點 ID（網站路徑 openai/gpt-image-2.6/sunburst 會回 404）
    expect(DEFAULT_FAL_PRESETS[0].id).toBe('fal-ai/gpt-image-2.6-sunburst/edit')
    expect(DEFAULT_FAL_PRESETS[0].includeDiffusionParams).toBe(false)
    expect(DEFAULT_FAL_PRESETS[0].imageInputField).toBe('image_urls')
    expect(DEFAULT_FAL_PRESETS[0].isArrayImageInput).toBe(true)

    const flare = DEFAULT_FAL_PRESETS.find((p) => p.id === 'fal-ai/gpt-image-2.6-flare/edit')
    expect(flare).toBeDefined()
    expect(flare?.includeDiffusionParams).toBe(false)
    expect(flare?.imageInputField).toBe('image_urls')
    expect(flare?.isArrayImageInput).toBe(true)
  })

  it('drops parameters the selected model schema does not support', () => {
    const strictConfig: GenerationConfig = {
      ...baseConfig,
      endpointId: 'fal-ai/aura-sr',
      imageInputField: 'image_url',
      isArrayImageInput: false,
      includeDiffusionParams: true,
      unsupportedFields: [
        'prompt',
        'output_format',
        'strength',
        'num_inference_steps',
        'guidance_scale',
        'negative_prompt',
        'seed'
      ]
    }

    const payload = buildFalInputPayload(
      baseItem,
      strictConfig,
      'https://fal.media/files/uploaded.png'
    )

    expect(payload).toEqual({ image_url: 'https://fal.media/files/uploaded.png' })
  })

  it('lets advanced JSON params override schema-level filtering', () => {
    const strictConfig: GenerationConfig = {
      ...baseConfig,
      endpointId: 'fal-ai/aura-sr',
      includeDiffusionParams: true,
      unsupportedFields: ['strength'],
      customJsonParams: '{"strength": 0.4}'
    }

    const payload = buildFalInputPayload(
      baseItem,
      strictConfig,
      'https://fal.media/files/uploaded.png'
    )

    expect(payload.strength).toBe(0.4)
    expect(payload.image_url).toBe('https://fal.media/files/uploaded.png')
  })

  it('extracts output image URL across different fal.ai response structures', () => {
    expect(
      extractFalOutputImageUrl({
        data: { images: [{ url: 'https://fal.media/out1.png' }] }
      })
    ).toBe('https://fal.media/out1.png')

    expect(
      extractFalOutputImageUrl({
        data: { image: { url: 'https://fal.media/out2.png' } }
      })
    ).toBe('https://fal.media/out2.png')

    expect(
      extractFalOutputImageUrl({
        images: ['https://fal.media/out3.png']
      })
    ).toBe('https://fal.media/out3.png')

    expect(() => extractFalOutputImageUrl({ data: {} })).toThrow()
  })
})

