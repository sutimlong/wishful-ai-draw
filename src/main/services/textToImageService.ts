import { fal } from '@fal-ai/client'
import {
  FalModelPreset,
  TextToImageAspect,
  TextToImageRequest
} from '../../shared/types'
import { FAL_TEXT_TO_IMAGE_MODELS } from '../../shared/falTextToImageModels'

/** 各畫面比例對應的輸出像素（fal 常見可整除尺寸，皆為約 1 MP） */
const ASPECT_PIXELS: Record<TextToImageAspect, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1344, height: 768 },
  '9:16': { width: 768, height: 1344 },
  '4:3': { width: 1152, height: 896 },
  '3:4': { width: 896, height: 1152 }
}

/** 畫面比例 → fal `image_size` 字串列舉（square / landscape_16_9 / ...） */
const IMAGE_SIZE_ENUMS: Record<TextToImageAspect, string> = {
  '1:1': 'square',
  '16:9': 'landscape_16_9',
  '9:16': 'portrait_16_9',
  '4:3': 'landscape_4_3',
  '3:4': 'portrait_4_3'
}

/** 畫面比例 → fal `aspect_ratio` 字串（Nano Banana 系列使用） */
const ASPECT_RATIO_STRINGS: Record<TextToImageAspect, string> = {
  '1:1': '1:1',
  '16:9': '16:9',
  '9:16': '9:16',
  '4:3': '4:3',
  '3:4': '3:4'
}

/** 畫面比例 → 顯示用的像素尺寸 */
export function aspectPixels(aspectId: TextToImageAspect): { width: number; height: number } {
  return ASPECT_PIXELS[aspectId]
}

function normalizeEndpointId(endpointId: string): string {
  return endpointId.trim().replace(/^\/+/, '').replace(/\/+$/, '')
}

/** 從模型的 imageSizeEnum 中選出最接近目標比例的列舉值（找不到時退回 square） */
function pickImageSize(
  model: FalModelPreset | undefined,
  aspectId: TextToImageAspect
): string {
  const preferred = IMAGE_SIZE_ENUMS[aspectId]
  const enums = model?.imageSizeEnum ?? []
  if (enums.includes(preferred)) return preferred
  if (enums.includes('square')) return 'square'
  return enums[0] ?? preferred
}

/**
 * 組出送往 fal.ai 的文生圖 payload。
 * 依模型 schema 計算出的 `unsupportedFields` 剔除不支援的欄位，
 * 並在 image_size / aspect_ratio / width+height 三種尺寸表示法間自動選擇。
 */
export function buildTextToImagePayload(
  model: FalModelPreset | undefined,
  request: TextToImageRequest,
  referenceImageUrl?: string
): Record<string, unknown> {
  const unsupported = new Set(model?.unsupportedFields ?? [])
  const promptField = model?.promptField?.trim() || 'prompt'
  const payload: Record<string, unknown> = { [promptField]: request.prompt.trim() }

  if (!unsupported.has('image_size')) {
    payload.image_size = pickImageSize(model, request.aspectId)
  } else if (!unsupported.has('aspect_ratio')) {
    payload.aspect_ratio = ASPECT_RATIO_STRINGS[request.aspectId]
  } else if (!unsupported.has('width') && !unsupported.has('height')) {
    payload.width = ASPECT_PIXELS[request.aspectId].width
    payload.height = ASPECT_PIXELS[request.aspectId].height
  }

  if (!unsupported.has('num_images') && request.numImages > 1) {
    payload.num_images = request.numImages
  }
  if (!unsupported.has('output_format')) {
    payload.output_format = request.outputFormat
  }
  if (!unsupported.has('seed') && typeof request.seed === 'number' && !Number.isNaN(request.seed)) {
    payload.seed = request.seed
  }

  // 參考圖：模型有支援的欄位且已上傳時才帶入
  if (referenceImageUrl && model?.referenceImageField) {
    payload[model.referenceImageField] = model.isArrayReferenceImage
      ? [referenceImageUrl]
      : referenceImageUrl
  }

  return payload
}

/** 從 fal 回應中解析所有輸出圖片 URL（單張或多張） */
export function extractFalOutputImageUrls(result: unknown): string[] {
  if (!result || typeof result !== 'object') {
    throw new Error('fal.ai 回傳結果為空或格式不正確')
  }

  const obj = result as Record<string, unknown>
  const data = (obj.data && typeof obj.data === 'object' ? obj.data : obj) as Record<
    string,
    unknown
  >

  const toUrl = (value: unknown): string | null => {
    if (typeof value === 'string' && value.startsWith('http')) return value
    if (value && typeof value === 'object' && typeof (value as { url?: unknown }).url === 'string') {
      return (value as { url: string }).url
    }
    return null
  }

  // 1. data.images: [{ url }, ...] 或 ['http...']
  if (Array.isArray(data.images) && data.images.length > 0) {
    const urls = data.images.map(toUrl).filter((url): url is string => Boolean(url))
    if (urls.length > 0) return urls
  }

  // 2. 單張 data.image / data.url / data.output_url
  for (const key of ['image', 'url', 'output_url'] as const) {
    const url = toUrl(data[key])
    if (url) return [url]
  }

  throw new Error('無法從 fal.ai 回應中解析輸出圖片 URL')
}

export interface TextToImageExecutionResult {
  outputImageUrls: string[]
  requestId?: string
}

/** 文字生成圖片服務：以 prompt 直接呼叫 fal.ai 文生圖模型 */
export class TextToImageService {
  public configureCredentials(apiKey: string): void {
    fal.config({ credentials: apiKey.trim() })
  }

  public async generate(
    request: TextToImageRequest,
    apiKey: string,
    referenceImageUrl?: string
  ): Promise<TextToImageExecutionResult> {
    if (!apiKey || !apiKey.trim()) {
      const err = new Error('尚未設定 fal.ai API Key，請先於右上角設定中填入')
      ;(err as { status?: number }).status = 401
      throw err
    }

    this.configureCredentials(apiKey)

    const model = FAL_TEXT_TO_IMAGE_MODELS.find((entry) => entry.id === request.endpointId)
    const payload = buildTextToImagePayload(model, request, referenceImageUrl)

    const result = await fal.subscribe(normalizeEndpointId(request.endpointId), {
      input: payload,
      logs: true
    })

    const outputImageUrls = extractFalOutputImageUrls(result)
    return { outputImageUrls, requestId: result.requestId }
  }
}

export const textToImageService = new TextToImageService()
