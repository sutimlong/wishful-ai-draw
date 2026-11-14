import { describe, expect, it } from 'vitest'
import {
  FAL_TEXT_TO_IMAGE_MODELS,
  FAL_TEXT_TO_IMAGE_MODEL_GROUPS
} from '../src/shared/falTextToImageModels'
import { buildTextToImagePayload } from '../src/main/services/textToImageService'

const EXTRA_MODEL_IDS = [
  'fal-ai/nano-banana-pro/edit',
  'fal-ai/nano-banana-2/edit',
  'blackforestlabs/flux-3/edit-image',
  'fal-ai/flux-2/edit',
  'fal-ai/flux-pro/kontext/max/multi',
  'fal-ai/flux-pro/kontext/multi',
  'bytedance/seedream/v5.5/edit',
  'bytedance/seedream/v5/pro/edit',
  'openai/gpt-image-2/edit',
  'fal-ai/kling-image/o1',
  'fal-ai/vidu/reference-to-image',
  'bria/fibo-2/edit'
]

function findModel(id: string) {
  return FAL_TEXT_TO_IMAGE_MODELS.find((model) => model.id === id)
}

describe('文生圖模型清單（含手動補充模型）', () => {
  it('12 個指定模型都收錄，名稱後面都有「（可參考圖）」', () => {
    for (const id of EXTRA_MODEL_IDS) {
      const model = findModel(id)
      expect(model, `缺少模型 ${id}`).toBeTruthy()
      expect(model?.name).toContain('（可參考圖）')
      expect(model?.referenceImageField).toBeTruthy()
      expect(model?.isArrayReferenceImage).toBe(true)
      expect(model?.pricing?.perImageUsd).toBeGreaterThan(0)
    }
  })

  it('編輯模型會標記必須提供參考圖', () => {
    const model = findModel('fal-ai/flux-2/edit')
    expect(model?.requiresReferenceImage).toBe(true)

    // nano-banana 系列的 image_urls 是選填，不強制參考圖
    expect(findModel('fal-ai/nano-banana-pro/edit')?.requiresReferenceImage).toBeUndefined()
    expect(findModel('fal-ai/nano-banana-2/edit')?.requiresReferenceImage).toBeUndefined()
  })

  it('referenced 圖以陣列送出，並帶上比例與張數', () => {
    const payload = buildTextToImagePayload(
      findModel('fal-ai/flux-2/edit'),
      {
        endpointId: 'fal-ai/flux-2/edit',
        prompt: 'make it cinematic',
        aspectId: '16:9',
        numImages: 2,
        outputFormat: 'png'
      },
      'https://fal.media/reference.png'
    )

    expect(payload.image_urls).toEqual(['https://fal.media/reference.png'])
    expect(payload.image_size).toBe('landscape_16_9')
    expect(payload.num_images).toBe(2)
    expect(payload.output_format).toBe('png')
  })

  it('Vidu 使用 reference_image_urls 欄位', () => {
    const payload = buildTextToImagePayload(
      findModel('fal-ai/vidu/reference-to-image'),
      {
        endpointId: 'fal-ai/vidu/reference-to-image',
        prompt: 'same character, different pose',
        aspectId: '9:16',
        numImages: 1,
        outputFormat: 'png'
      },
      'https://fal.media/ref.png'
    )

    expect(payload.reference_image_urls).toEqual(['https://fal.media/ref.png'])
    expect(payload.aspect_ratio).toBe('9:16')
  })

  it('Bria 使用 instruction 作為提示詞欄位', () => {
    const payload = buildTextToImagePayload(
      findModel('bria/fibo-2/edit'),
      {
        endpointId: 'bria/fibo-2/edit',
        prompt: 'put the product on a marble table',
        aspectId: '1:1',
        numImages: 1,
        outputFormat: 'png'
      },
      'https://fal.media/ref.png'
    )

    expect(payload.instruction).toBe('put the product on a marble table')
    expect(payload).not.toHaveProperty('prompt')
    expect(payload.image_urls).toEqual(['https://fal.media/ref.png'])
  })

  it('指定的 7 個模型名稱前面都有「★」，且不會重複加星', () => {
    const starredIds = [
      'fal-ai/nano-banana-pro/edit',
      'fal-ai/nano-banana-2/edit',
      'openai/gpt-image-2/edit',
      'fal-ai/kling-image/o1',
      'wan/v2.6/text-to-image',
      'fal-ai/flux-pro/kontext/multi',
      'fal-ai/flux-pro/kontext/max/multi'
    ]

    for (const id of starredIds) {
      const model = findModel(id)
      expect(model, `缺少模型 ${id}`).toBeTruthy()
      expect(model?.name.startsWith('★ ')).toBe(true)
      expect(model?.name.split('★').length - 1).toBe(1)
    }
  })

  it('分組清單包含 Google 與 Black Forest Labs', () => {
    expect(FAL_TEXT_TO_IMAGE_MODEL_GROUPS).toContain('Google')
    expect(FAL_TEXT_TO_IMAGE_MODEL_GROUPS).toContain('Black Forest Labs')
  })
})
