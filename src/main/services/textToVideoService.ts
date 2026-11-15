import { fal } from '@fal-ai/client'
import { mkdir, stat, writeFile } from 'fs/promises'
import { basename, extname, join } from 'path'
import {
  DEFAULT_IMAGE_TO_VIDEO_MODEL_ID,
  findImageToVideoModel
} from '../../shared/falImageToVideoModels'
import { DEFAULT_TEXT_TO_VIDEO_MODEL_ID, findTextToVideoModel } from '../../shared/falTextToVideoModels'
import {
  FalModelPreset,
  FalVideoDurationSpec,
  TextToVideoAspect,
  TextToVideoGeneratedVideo,
  TextToVideoRequest
} from '../../shared/types'

const VIDEO_ASPECT_TO_SIZE_NAME: Record<TextToVideoAspect, string> = {
  '1:1': 'square_hd',
  '16:9': 'landscape_16_9',
  '9:16': 'portrait_16_9',
  '4:3': 'landscape_4_3',
  '3:4': 'portrait_4_3',
  '21:9': 'landscape_16_9'
}

const VALID_VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.mkv', '.m4v'])

/** 依模型 resolutionEnum 解析最適合的解析度字串（大小寫與精確/近似高度容錯） */
export function resolveVideoResolution(
  resolutionEnum: string[] | undefined,
  requestedResolution: string,
  aspectId: TextToVideoAspect
): string {
  if (!resolutionEnum || resolutionEnum.length === 0) {
    return requestedResolution
  }

  // 若某些模型（如 LTX）把 ImageSize 名稱放在 resolution 欄位，依畫面比例挑選
  if (resolutionEnum.some((v) => v.includes('landscape_') || v.includes('portrait_') || v === 'square')) {
    return resolveVideoSizeFromEnum(resolutionEnum, aspectId)
  }

  const normalizedReq = requestedResolution.trim().toLowerCase()
  const exact = resolutionEnum.find((item) => item.toLowerCase() === normalizedReq)
  if (exact) return exact

  const parseHeight = (label: string): number | null => {
    const clean = label.trim().toLowerCase()
    if (clean === '2k') return 1440
    if (clean === '4k') return 2160
    const pMatch = clean.match(/^(\d+)p$/)
    if (pMatch) return Number(pMatch[1])
    const dimMatch = clean.match(/^\d+x(\d+)$/)
    if (dimMatch) return Number(dimMatch[1])
    return null
  }

  const targetHeight = parseHeight(requestedResolution)
  if (targetHeight !== null) {
    let bestItem: string | undefined
    let bestDiff = Infinity
    for (const candidate of resolutionEnum) {
      const h = parseHeight(candidate)
      if (h === null) continue
      const diff = Math.abs(h - targetHeight)
      if (diff < bestDiff) {
        bestDiff = diff
        bestItem = candidate
      }
    }
    if (bestItem) return bestItem
  }

  return resolutionEnum[0]
}

/** 依 videoSizeEnum 與畫面比例選出對應的尺寸枚舉（例如 landscape_16_9） */
export function resolveVideoSizeFromEnum(
  sizeEnum: string[] | undefined,
  aspectId: TextToVideoAspect
): string {
  const preferred = VIDEO_ASPECT_TO_SIZE_NAME[aspectId] || 'landscape_16_9'
  if (!sizeEnum || sizeEnum.length === 0) return preferred
  if (sizeEnum.includes(preferred)) return preferred

  const fallbackOrder =
    aspectId === '9:16' || aspectId === '3:4'
      ? ['portrait_16_9', 'portrait_4_3', 'square_hd', 'square']
      : aspectId === '1:1'
        ? ['square_hd', 'square', 'landscape_4_3', 'landscape_16_9']
        : ['landscape_16_9', 'landscape_4_3', 'square_hd', 'square']

  for (const cand of fallbackOrder) {
    if (sizeEnum.includes(cand)) return cand
  }
  return sizeEnum[0]
}

/** 依 aspectRatioEnum 與目標畫面比例選出安全合法的長寬比字串 */
export function resolveVideoAspectRatio(
  aspectRatioEnum: string[] | undefined,
  requestedAspect: TextToVideoAspect
): string {
  if (!aspectRatioEnum || aspectRatioEnum.length === 0) return requestedAspect
  if (aspectRatioEnum.includes(requestedAspect)) return requestedAspect

  const fallbackOrder =
    requestedAspect === '9:16' || requestedAspect === '3:4'
      ? ['9:16', '3:4', 'auto', 'adaptive']
      : requestedAspect === '1:1'
        ? ['1:1', '4:3', '16:9', 'auto', 'adaptive']
        : ['16:9', '21:9', '4:3', '16:10', 'auto', 'adaptive']

  for (const cand of fallbackOrder) {
    if (aspectRatioEnum.includes(cand)) return cand
  }
  return aspectRatioEnum[0]
}

/** 依 durationSpec 把使用者選的秒數轉成模型要求的型別（整數／數字字串／Ns 字串） */
export function resolveVideoDurationValue(
  durationSpec: FalVideoDurationSpec | undefined,
  requestedSeconds: number
): string | number | undefined {
  if (!durationSpec) return undefined

  const target =
    typeof requestedSeconds === 'number' && Number.isFinite(requestedSeconds) && requestedSeconds > 0
      ? requestedSeconds
      : 5

  if (durationSpec.enum && durationSpec.enum.length > 0) {
    const parseSec = (val: string | number): number | null => {
      const m = String(val).trim().match(/^(\d+(?:\.\d+)?)s?$/i)
      return m ? Number(m[1]) : null
    }

    let best: string | number | undefined
    let bestDiff = Infinity
    for (const candidate of durationSpec.enum) {
      const num = parseSec(candidate)
      if (num === null) continue
      const diff = Math.abs(num - target)
      if (diff < bestDiff) {
        bestDiff = diff
        best = candidate
      }
    }
    if (best !== undefined) return best
    if (durationSpec.default !== undefined) return durationSpec.default
    return durationSpec.enum[0]
  }

  let clamped = target
  if (typeof durationSpec.min === 'number') clamped = Math.max(durationSpec.min, clamped)
  if (typeof durationSpec.max === 'number') clamped = Math.min(durationSpec.max, clamped)
  clamped = Math.round(clamped)

  if (durationSpec.type === 'seconds_string') return `${clamped}s`
  if (durationSpec.type === 'string') return String(clamped)
  return clamped
}

/** 組裝送給 fal.ai 文字生成影片端點的輸入 payload */
export function buildTextToVideoPayload(
  model: FalModelPreset | undefined,
  request: TextToVideoRequest,
  referenceImageUrls: string[] = []
): Record<string, unknown> {
  const unsupported = new Set(model?.unsupportedFields ?? [])
  const payload: Record<string, unknown> = { ...(model?.defaultParams ?? {}) }

  const promptField = model?.promptField || 'prompt'
  payload[promptField] = request.prompt.trim()

  if (!unsupported.has('aspect_ratio')) {
    payload.aspect_ratio = resolveVideoAspectRatio(model?.aspectRatioEnum, request.aspectId)
  }

  if (!unsupported.has('duration') && model?.durationSpec) {
    const dur = resolveVideoDurationValue(model.durationSpec, request.durationSeconds)
    if (dur !== undefined) payload.duration = dur
  }

  if (!unsupported.has('resolution')) {
    payload.resolution = resolveVideoResolution(
      model?.resolutionEnum,
      request.resolution,
      request.aspectId
    )
  }

  if (!unsupported.has('video_size') && (model?.videoSizeEnum || unsupported.has('resolution'))) {
    payload.video_size = resolveVideoSizeFromEnum(model?.videoSizeEnum, request.aspectId)
  }

  if (model?.audioField) {
    payload[model.audioField] = Boolean(request.generateAudio)
  }

  if (request.negativePrompt?.trim() && !unsupported.has('negative_prompt')) {
    payload.negative_prompt = request.negativePrompt.trim()
  }

  if (typeof request.seed === 'number' && !unsupported.has('seed')) {
    payload.seed = request.seed
  }

  if (referenceImageUrls.length > 0 && model?.referenceImageField) {
    payload[model.referenceImageField] = model.isArrayReferenceImage
      ? referenceImageUrls
      : referenceImageUrls[0]
  }

  for (const field of unsupported) {
    delete payload[field]
  }

  return payload
}

/**
 * 依據所選圖生影片模型組裝 fal.ai API Input Payload
 * @param model 模型中繼資料（可能為自訂或未知 ID）
 * @param request 影片生成請求參數
 * @param uploadedImageUrls 已上傳至 fal storage 的來源圖片 URL 陣列（第 1 張為主圖/首幀，第 2 張為可選尾幀或多圖參考）
 */
export function buildImageToVideoPayload(
  model: FalModelPreset | undefined,
  request: TextToVideoRequest,
  uploadedImageUrls: string[]
): Record<string, unknown> {
  const payload = buildTextToVideoPayload(model, request, [])

  if (typeof payload.prompt === 'string' && !payload.prompt.trim() && model?.requiresPrompt === false) {
    delete payload.prompt
  }

  if (uploadedImageUrls.length > 0) {
    const primaryField = model?.imageInputField || 'image_url'
    if (model?.isArrayImageInput) {
      payload[primaryField] = uploadedImageUrls
    } else {
      payload[primaryField] = uploadedImageUrls[0]
      if (uploadedImageUrls.length > 1 && model?.endImageField) {
        payload[model.endImageField] = uploadedImageUrls[1]
      }
    }
  }

  return payload
}

/** 從 fal.ai 非同步推論回傳結構中解析輸出影片 URL 與 metadata */
export function extractFalOutputVideo(
  data: unknown
): { url: string; width?: number; height?: number; duration?: number } | null {
  if (!data) return null
  if (typeof data === 'string') {
    return data.startsWith('http') ? { url: data } : null
  }
  if (typeof data !== 'object') return null

  const obj = data as Record<string, unknown>

  const readEntry = (
    entry: unknown
  ): { url: string; width?: number; height?: number; duration?: number } | null => {
    if (!entry) return null
    if (typeof entry === 'string') {
      return entry.startsWith('http') ? { url: entry } : null
    }
    if (typeof entry === 'object') {
      const rec = entry as Record<string, unknown>
      if (typeof rec.url === 'string' && rec.url.startsWith('http')) {
        return {
          url: rec.url,
          width: typeof rec.width === 'number' ? rec.width : undefined,
          height: typeof rec.height === 'number' ? rec.height : undefined,
          duration: typeof rec.duration === 'number' ? rec.duration : undefined
        }
      }
    }
    return null
  }

  const direct = readEntry(obj.video) || readEntry(obj.video_url) || readEntry(obj.output_url) || readEntry(obj.url)
  if (direct) return direct

  if (Array.isArray(obj.videos)) {
    for (const item of obj.videos) {
      const parsed = readEntry(item)
      if (parsed) return parsed
    }
  }

  if (obj.data && typeof obj.data === 'object') {
    return extractFalOutputVideo(obj.data)
  }

  return null
}

function detectVideoExtension(videoUrl: string, contentType?: string | null): string {
  try {
    const pathname = new URL(videoUrl).pathname
    const urlExt = extname(pathname).toLowerCase()
    if (VALID_VIDEO_EXTENSIONS.has(urlExt)) return urlExt
  } catch {
    // 忽略無效 URL，改由 Content-Type 推斷
  }
  const ct = (contentType || '').toLowerCase()
  if (ct.includes('webm')) return '.webm'
  if (ct.includes('quicktime')) return '.mov'
  return '.mp4'
}

function formatTimestampTag(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

async function resolveUniqueFilePath(directory: string, baseName: string, ext: string): Promise<string> {
  const first = join(directory, `${baseName}${ext}`)
  try {
    await stat(first)
  } catch {
    return first
  }
  for (let i = 1; i < 1000; i++) {
    const candidate = join(directory, `${baseName}_${i}${ext}`)
    try {
      await stat(candidate)
    } catch {
      return candidate
    }
  }
  return join(directory, `${baseName}_${Date.now()}${ext}`)
}

/** 下載 fal.ai 產生的影片檔並儲存至指定資料夾 */
export async function downloadOutputVideo(
  videoUrl: string,
  outputDirectory: string,
  index = 0,
  filePrefix: 'text2vid' | 'img2vid' = 'text2vid'
): Promise<string> {
  await mkdir(outputDirectory, { recursive: true })
  const response = await fetch(videoUrl)
  if (!response.ok) {
    throw new Error(`下載影片失敗（HTTP ${response.status}）`)
  }
  const arrayBuffer = await response.arrayBuffer()
  const ext = detectVideoExtension(videoUrl, response.headers.get('content-type'))
  const baseName = `${filePrefix}_${formatTimestampTag()}_${index}`
  const targetPath = await resolveUniqueFilePath(outputDirectory, baseName, ext)
  await writeFile(targetPath, Buffer.from(arrayBuffer))
  return targetPath
}

export interface TextToVideoGenerateRunResult {
  videos: TextToVideoGeneratedVideo[]
  endpointId: string
  requestId?: string
}

/**
 * 執行 fal.ai 文字生成影片並自動下載儲存至輸出資料夾。
 */
export interface VideoGenerateOptions {
  /** 是否為「圖片生成影片」模式（預設 false 代表文生影片） */
  isImageToVideo?: boolean
}

export class TextToVideoService {
  public async generate(
    request: TextToVideoRequest,
    apiKey: string,
    outputDirectory: string,
    uploadedReferenceUrls: string[] = [],
    options: VideoGenerateOptions = {}
  ): Promise<TextToVideoGenerateRunResult> {
    const cleanKey = apiKey.trim()
    if (!cleanKey) {
      throw new Error('請先在設定中輸入 fal.ai API Key')
    }

    const isImageToVideo = Boolean(options.isImageToVideo)
    const endpointId =
      request.endpointId.trim() ||
      (isImageToVideo ? DEFAULT_IMAGE_TO_VIDEO_MODEL_ID : DEFAULT_TEXT_TO_VIDEO_MODEL_ID)
    const model = isImageToVideo
      ? findImageToVideoModel(endpointId)
      : findTextToVideoModel(endpointId)

    if (isImageToVideo && uploadedReferenceUrls.length === 0) {
      throw new Error('請先選擇至少一張來源圖片')
    }
    if (isImageToVideo && model?.requiresEndImage && uploadedReferenceUrls.length < 2) {
      throw new Error(`模型「${model.name}」需要同時提供首幀與尾幀兩張圖片`)
    }

    const cleanPrompt = request.prompt.trim()
    if (!cleanPrompt && (!isImageToVideo || model?.requiresPrompt !== false)) {
      throw new Error(
        isImageToVideo ? '請先輸入影片提示詞 (Prompt) 描述動態效果' : '請先輸入影片提示詞 (Prompt)'
      )
    }

    const inputPayload = isImageToVideo
      ? buildImageToVideoPayload(model, request, uploadedReferenceUrls)
      : buildTextToVideoPayload(model, request, uploadedReferenceUrls)

    fal.config({ credentials: cleanKey })
    const result = await fal.subscribe(endpointId, {
      input: inputPayload,
      logs: false
    })

    const requestId =
      result && typeof result === 'object' && 'requestId' in result
        ? String((result as { requestId?: unknown }).requestId || '')
        : undefined

    const data =
      result && typeof result === 'object' && 'data' in result
        ? (result as { data: unknown }).data
        : result

    const extracted = extractFalOutputVideo(data)
    if (!extracted) {
      throw new Error('fal.ai 未回傳可用的影片網址')
    }

    const savedFilePath = await downloadOutputVideo(
      extracted.url,
      outputDirectory,
      0,
      isImageToVideo ? 'img2vid' : 'text2vid'
    )
    const video: TextToVideoGeneratedVideo = {
      url: extracted.url,
      width: extracted.width,
      height: extracted.height,
      duration: extracted.duration,
      savedFilePath
    }

    return {
      videos: [video],
      endpointId,
      requestId: requestId || undefined
    }
  }
}

export function getVideoFileBasename(filePath: string): string {
  return basename(filePath)
}
