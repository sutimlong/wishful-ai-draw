import { describe, expect, it } from 'vitest'
import {
  CURATED_MODEL_GROUP,
  FAL_MODEL_CATALOG,
  FAL_MODEL_GROUPS
} from '../src/shared/falModelCatalog'
import { DEFAULT_FAL_MODEL_ID, DEFAULT_FAL_PRESETS, GenerationConfig } from '../src/shared/types'
import { formatModelPriceTag } from '../src/shared/falPricing'
import { buildFalInputPayload } from '../src/main/services/falPayloadBuilder'

/** payload builder 會送出的參數名稱；目錄的 unsupportedFields 只能從這裡挑 */
const KNOWN_PAYLOAD_KEYS = [
  'prompt',
  'output_format',
  'strength',
  'num_inference_steps',
  'guidance_scale',
  'negative_prompt',
  'seed',
  'scheduler',
  'quality',
  'image_size',
  'num_images',
  'safety_tolerance'
]

describe('fal 模型目錄 (falModelCatalog)', () => {
  it('收錄 fal.ai 全站圖生圖模型與精選模型', () => {
    expect(FAL_MODEL_CATALOG.length).toBeGreaterThan(200)
    expect(FAL_MODEL_CATALOG.length).toBeGreaterThanOrEqual(DEFAULT_FAL_PRESETS.length)
  })

  it('每個模型都有可用的端點與圖片欄位設定', () => {
    for (const model of FAL_MODEL_CATALOG) {
      expect(model.id.length).toBeGreaterThan(0)
      expect(model.name.length).toBeGreaterThan(0)
      expect(model.imageInputField.trim().length).toBeGreaterThan(0)
      expect(typeof model.defaultParams).toBe('object')
      expect(model.group && model.group.length > 0).toBe(true)
    }
  })

  it('模型端點 id 不重複', () => {
    const ids = FAL_MODEL_CATALOG.map((model) => model.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('預設模型為 GPT Image 2.6 Sunburst 且存在於目錄中', () => {
    expect(DEFAULT_FAL_MODEL_ID).toBe('fal-ai/gpt-image-2.6-sunburst/edit')
    const preset = FAL_MODEL_CATALOG.find((model) => model.id === DEFAULT_FAL_MODEL_ID)
    expect(preset).toBeDefined()
    expect(preset?.name).toContain('GPT Image 2.6 Sunburst')
    expect(preset?.imageInputField).toBe('image_urls')
    expect(preset?.isArrayImageInput).toBe(true)
    expect(preset?.includeDiffusionParams).toBe(false)
  })

  it('精選模型固定排在清單最前面', () => {
    const curated = FAL_MODEL_CATALOG.slice(0, DEFAULT_FAL_PRESETS.length)
    expect(curated.map((model) => model.id)).toEqual(
      DEFAULT_FAL_PRESETS.map((preset) => preset.id)
    )
    expect(curated.every((model) => model.group === CURATED_MODEL_GROUP)).toBe(true)
  })

  it('目錄包含幾個常用的第三方模型', () => {
    const ids = new Set(FAL_MODEL_CATALOG.map((model) => model.id))
    expect(ids.has('fal-ai/flux/dev/image-to-image')).toBe(true)
    expect(ids.has('fal-ai/nano-banana-pro/edit')).toBe(true)
    expect(ids.has('fal-ai/clarity-upscaler')).toBe(true)
  })

  it('不會重複收錄 fal-ai / openai 別名的同一個模型', () => {
    // 精選的 fal-ai/gpt-image-2.6-sunburst/edit 與目錄中的 openai/gpt-image-2.6/sunburst/edit 是同一個模型
    const sunburst26 = FAL_MODEL_CATALOG.filter((model) => /gpt-image-2\.6.*sunburst/.test(model.id))
    expect(sunburst26).toHaveLength(1)
    expect(sunburst26[0].id).toBe(DEFAULT_FAL_MODEL_ID)
    expect(FAL_MODEL_CATALOG.some((model) => model.id === 'openai/gpt-image-2.6/sunburst/edit')).toBe(
      false
    )
  })

  it('unsupportedFields 只包含 payload 會用到的參數', () => {
    for (const model of FAL_MODEL_CATALOG) {
      for (const field of model.unsupportedFields ?? []) {
        expect(KNOWN_PAYLOAD_KEYS).toContain(field)
      }
    }
  })

  it('分組清單與目錄內容一致', () => {
    const groupsFromCatalog = new Set(FAL_MODEL_CATALOG.map((model) => model.group))
    expect(FAL_MODEL_GROUPS).toEqual([...groupsFromCatalog])
    expect(FAL_MODEL_GROUPS[0]).toBe(CURATED_MODEL_GROUP)
  })

  it('每個模型都有 fal.ai 的計價資訊', () => {
    const missing = FAL_MODEL_CATALOG.filter((model) => !model.pricing)
    expect(missing).toEqual([])
  })

  it('多數模型都能換算成「生成一張圖片」的預估金額', () => {
    const priced = FAL_MODEL_CATALOG.filter(
      (model) => typeof model.pricing?.perImageUsd === 'number'
    )
    expect(priced.length / FAL_MODEL_CATALOG.length).toBeGreaterThan(0.85)
  })

  it('計價資訊都有依據，單張預估金額落在合理範圍', () => {
    for (const model of FAL_MODEL_CATALOG) {
      const pricing = model.pricing
      if (!pricing) continue
      expect(pricing.basis.trim().length).toBeGreaterThan(0)
      expect(pricing.unit.trim().length).toBeGreaterThan(0)
      if (pricing.perImageUsd === undefined) continue
      expect(pricing.perImageUsd).toBeGreaterThan(0)
      expect(pricing.perImageUsd).toBeLessThan(5)
    }
  })

  it('預設模型能顯示單張預估價格', () => {
    const preset = FAL_MODEL_CATALOG.find((model) => model.id === DEFAULT_FAL_MODEL_ID)
    expect(typeof preset?.pricing?.perImageUsd).toBe('number')
    expect(formatModelPriceTag(preset?.pricing)).toMatch(/\/ 張$/)
  })

  it('精選模型沿用同名同步項目的計價資訊', () => {
    const curated = FAL_MODEL_CATALOG.slice(0, DEFAULT_FAL_PRESETS.length)
    for (const model of curated) {
      expect(model.pricing, model.id).toBeDefined()
      expect(formatModelPriceTag(model.pricing), model.id).not.toBe('未公布單價')
    }
  })

  it('includeDiffusionParams 與 unsupportedFields 不矛盾', () => {
    const diffusionKeys = [
      'strength',
      'num_inference_steps',
      'guidance_scale',
      'negative_prompt',
      'scheduler'
    ]
    for (const model of FAL_MODEL_CATALOG) {
      if (model.includeDiffusionParams === false) continue
      const blocked = new Set(model.unsupportedFields ?? [])
      expect(diffusionKeys.some((key) => !blocked.has(key))).toBe(true)
    }
  })

  it('套用任一模型後送出的 payload 都符合該模型支援的參數', () => {
    const item = {
      id: 'item-1',
      sourceFilePath: '/tmp/sample.png',
      sourceFileName: 'sample.png',
      sourcePreviewUrl: 'local-media://image?path=%2Ftmp%2Fsample.png',
      status: 'idle' as const,
      progress: 0
    }

    for (const model of FAL_MODEL_CATALOG) {
      const config: GenerationConfig = {
        endpointId: model.id,
        imageInputField: model.imageInputField,
        isArrayImageInput: Boolean(model.isArrayImageInput),
        includeDiffusionParams: model.includeDiffusionParams !== false,
        unsupportedFields: model.unsupportedFields,
        prompt: 'test prompt',
        negativePrompt: 'blurry',
        strength: 0.75,
        numInferenceSteps: 28,
        guidanceScale: 3.5,
        outputFormat: 'png',
        seed: 42,
        quality: 'high',
        imageSize: '1024x1024',
        numImages: 1,
        safetyTolerance: '2',
        customJsonParams: '',
        upscale: {
          enabled: false,
          factor: 2,
          creativity: 0.35,
          resemblance: 0.6,
          guidanceScale: 4,
          numInferenceSteps: 18
        },
        backgroundRemoval: {
          enabled: false,
          model: 'General Use (Light)',
          operatingResolution: '1024x1024',
          refineForeground: true,
          outputFormat: 'png'
        },
        resize: { enabled: false, width: 1024, height: 1024, fit: 'contain', outputFormat: 'png' },
        faceRestore: {
          enabled: false,
          fidelity: 0.5,
          upscaleFactor: 2,
          faceUpscale: true,
          aligned: false,
          onlyCenterFace: false
        }
      }

      const payload = buildFalInputPayload(item, config, 'https://fal.media/files/uploaded.png')

      // 主要圖片欄位一定存在，且型別符合 schema
      const imageValue = payload[model.imageInputField]
      if (model.isArrayImageInput) {
        expect(imageValue).toEqual(['https://fal.media/files/uploaded.png'])
      } else {
        expect(imageValue).toBe('https://fal.media/files/uploaded.png')
      }

      // 不支援的參數不得出現在 payload 中
      for (const field of model.unsupportedFields ?? []) {
        expect(payload[field]).toBeUndefined()
      }
    }
  })
})
