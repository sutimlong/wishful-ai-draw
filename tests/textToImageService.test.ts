import { describe, expect, it } from 'vitest'
import { FalModelPreset, TextToImageRequest } from '../src/shared/types'
import { FAL_TEXT_TO_IMAGE_MODELS } from '../src/shared/falTextToImageModels'
import {
  aspectPixels,
  buildTextToImagePayload,
  extractFalOutputImageUrls
} from '../src/main/services/textToImageService'

function model(id: string): FalModelPreset {
  const found = FAL_TEXT_TO_IMAGE_MODELS.find((entry) => entry.id === id)
  if (!found) throw new Error(`找不到測試模型 ${id}`)
  return found
}

const baseRequest: TextToImageRequest = {
  endpointId: 'fal-ai/flux/schnell',
  prompt: 'a cat in the rain',
  aspectId: '16:9',
  numImages: 2,
  outputFormat: 'png'
}

describe('文字生成圖片 payload', () => {
  it('image_size 型模型送出字串列舉，並附上 num_images 與 output_format', () => {
    const payload = buildTextToImagePayload(model('fal-ai/flux/schnell'), baseRequest)

    expect(payload.prompt).toBe('a cat in the rain')
    expect(payload.image_size).toBe('landscape_16_9')
    expect(payload.num_images).toBe(2)
    expect(payload.output_format).toBe('png')
  })

  it('單張時不送 num_images，交由模型預設', () => {
    const payload = buildTextToImagePayload(model('fal-ai/flux/schnell'), {
      ...baseRequest,
      numImages: 1
    })

    expect(payload).not.toHaveProperty('num_images')
  })

  it('aspect_ratio 型模型（Nano Banana）送出比例字串', () => {
    const payload = buildTextToImagePayload(model('fal-ai/nano-banana'), {
      ...baseRequest,
      endpointId: 'fal-ai/nano-banana',
      aspectId: '9:16',
      numImages: 1
    })

    expect(payload.aspect_ratio).toBe('9:16')
    expect(payload).not.toHaveProperty('image_size')
  })

  it('畫面比例對應的像素尺寸正確', () => {
    expect(aspectPixels('1:1')).toEqual({ width: 1024, height: 1024 })
    expect(aspectPixels('16:9')).toEqual({ width: 1344, height: 768 })
    expect(aspectPixels('9:16')).toEqual({ width: 768, height: 1344 })
  })

  it('參考圖：單一欄位模型（flux-general）帶入 reference_image_url', () => {
    const payload = buildTextToImagePayload(
      model('fal-ai/flux-general'),
      baseRequest,
      'https://fal.media/reference.png'
    )

    expect(payload.reference_image_url).toBe('https://fal.media/reference.png')
  })

  it('參考圖：陣列欄位模型（ideogram/v3）帶入 image_urls 陣列', () => {
    const payload = buildTextToImagePayload(
      model('fal-ai/ideogram/v3'),
      baseRequest,
      'https://fal.media/reference.png'
    )

    expect(payload.image_urls).toEqual(['https://fal.media/reference.png'])
  })

  it('未提供參考圖或不支援參考圖的模型，不帶入參考圖欄位', () => {
    const without = buildTextToImagePayload(model('fal-ai/flux/schnell'), baseRequest)
    expect(without).not.toHaveProperty('reference_image_url')
    expect(without).not.toHaveProperty('image_url')
  })
})

describe('解析 fal 輸出圖片 URL', () => {
  it('解析多張 images 陣列', () => {
    const urls = extractFalOutputImageUrls({
      data: { images: [{ url: 'https://a.png' }, { url: 'https://b.png' }] }
    })
    expect(urls).toEqual(['https://a.png', 'https://b.png'])
  })

  it('解析單張 image 物件與字串', () => {
    expect(extractFalOutputImageUrls({ data: { image: { url: 'https://single.png' } } })).toEqual([
      'https://single.png'
    ])
    expect(extractFalOutputImageUrls({ data: { image: 'https://str.png' } })).toEqual([
      'https://str.png'
    ])
  })

  it('無圖片時拋出錯誤', () => {
    expect(() => extractFalOutputImageUrls({ data: {} })).toThrow()
  })
})
