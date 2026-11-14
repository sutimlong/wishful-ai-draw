import { fal } from '@fal-ai/client'
import { readFile } from 'fs/promises'
import { basename, extname } from 'path'
import {
  BackgroundRemovalFeatureConfig,
  BatchItem,
  FaceRestoreFeatureConfig,
  GenerationConfig,
  ResizeFeatureConfig,
  UpscaleFeatureConfig
} from '../../shared/types'
import { buildFalInputPayload, extractFalOutputImageUrl } from './falPayloadBuilder'

// Cache uploaded local file paths to avoid re-uploading on retry or parameter tweak
const uploadCache = new Map<string, string>()
// In-flight uploads: 多張任務同時上傳同一張圖時，共用同一個上傳 Promise（避免重複上傳）
const uploadInflight = new Map<string, Promise<string>>()

/** 放大圖片使用的 fal.ai 端點 */
export const UPSCALE_ENDPOINT_ID = 'fal-ai/clarity-upscaler'
/** 去背使用的 fal.ai 端點 */
export const BACKGROUND_REMOVAL_ENDPOINT_ID = 'fal-ai/birefnet'
/** 縮放使用的 fal.ai 端點 */
export const RESIZE_ENDPOINT_ID = 'fal-ai/fal-image-resize'
/** 臉部修復使用的 fal.ai 端點 */
export const FACE_RESTORE_ENDPOINT_ID = 'fal-ai/codeformer'

function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  switch (ext) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new Error('Task Cancelled'))
    }
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new Error('Task Cancelled'))
      },
      { once: true }
    )
  })
}

function normalizeEndpointId(endpointId: string): string {
  // 允許使用者貼上網站路徑或多餘斜線，fal 端點 ID 不接受結尾斜線
  return endpointId.trim().replace(/^\/+/, '').replace(/\/+$/, '')
}

export interface FalExecutionCallbacks {
  onStatusUpdate: (patch: Partial<BatchItem>) => void
  signal: AbortSignal
}

export class FalService {
  public configureCredentials(apiKey: string): void {
    fal.config({
      credentials: apiKey.trim()
    })
  }

  public async uploadLocalImage(
    filePath: string,
    existingRemoteUrl?: string,
    apiKey?: string
  ): Promise<string> {
    if (existingRemoteUrl && existingRemoteUrl.startsWith('http')) {
      return existingRemoteUrl
    }
    const cached = uploadCache.get(filePath)
    if (cached) {
      return cached
    }
    const inflight = uploadInflight.get(filePath)
    if (inflight) {
      return inflight
    }

    // 並行上傳階段可能在生成請求之前呼叫，需先確保 fal client 已有憑證
    if (apiKey && apiKey.trim()) {
      this.configureCredentials(apiKey)
    }

    const uploadTask = (async (): Promise<string> => {
      const buffer = await readFile(filePath)
      const mimeType = getMimeType(filePath)
      const fileName = basename(filePath)
      const blob = new Blob([buffer], { type: mimeType })
      // Attach name property for fal.storage
      const fileObj = new File([blob], fileName, { type: mimeType })

      const uploadedUrl = await fal.storage.upload(fileObj)
      uploadCache.set(filePath, uploadedUrl)
      return uploadedUrl
    })()

    uploadInflight.set(filePath, uploadTask)
    try {
      return await uploadTask
    } finally {
      uploadInflight.delete(filePath)
    }
  }

  public async executeMockGeneration(
    item: BatchItem,
    config: GenerationConfig,
    callbacks: FalExecutionCallbacks
  ): Promise<{ remoteInputUrl: string; outputImageUrl: string }> {
    const { onStatusUpdate, signal } = callbacks

    // Validate custom JSON even in mock mode
    buildFalInputPayload(item, config, 'https://mock.fal.media/input.png')

    const preUploadedUrl =
      item.remoteInputUrl && item.remoteInputUrl.startsWith('http') ? item.remoteInputUrl : undefined
    let mockRemoteUrl = preUploadedUrl

    if (!mockRemoteUrl) {
      onStatusUpdate({
        status: 'uploading',
        progress: 15,
        logs: ['[Mock] 正在讀取並模擬上傳本地圖片...']
      })
      await sleep(350, signal)
      mockRemoteUrl = `https://mock.fal.media/${encodeURIComponent(item.sourceFileName)}`
    }

    onStatusUpdate({
      status: 'queued',
      progress: 35,
      remoteInputUrl: mockRemoteUrl,
      queuePosition: 1,
      logs: ['[Mock] 圖片已上傳，進入模擬佇列 #1']
    })
    await sleep(350, signal)

    onStatusUpdate({
      status: 'processing',
      progress: 65,
      queuePosition: 0,
      logs: [
        '[Mock] 圖片已上傳，進入模擬佇列 #1',
        `[Mock] 呼叫模型 ${config.endpointId} (Steps: ${config.numInferenceSteps})...`
      ]
    })
    await sleep(500, signal)

    onStatusUpdate({
      status: 'processing',
      progress: 90,
      logs: [
        '[Mock] 圖片已上傳，進入模擬佇列 #1',
        `[Mock] 呼叫模型 ${config.endpointId} (Steps: ${config.numInferenceSteps})...`,
        '[Mock] 推論完成，準備寫入輸出資料夾...'
      ]
    })
    await sleep(250, signal)

    return {
      remoteInputUrl: mockRemoteUrl,
      outputImageUrl: mockRemoteUrl
    }
  }

  public async executeRealGeneration(
    item: BatchItem,
    config: GenerationConfig,
    apiKey: string,
    callbacks: FalExecutionCallbacks
  ): Promise<{ remoteInputUrl: string; outputImageUrl: string; requestId?: string }> {
    const { onStatusUpdate, signal } = callbacks

    if (!apiKey || !apiKey.trim()) {
      const err = new Error('尚未設定 fal.ai API Key，請先於右上角設定中填入')
      ;(err as { status?: number }).status = 401
      throw err
    }

    this.configureCredentials(apiKey)

    if (signal.aborted) throw new Error('Task Cancelled')

    const preUploadedUrl = item.remoteInputUrl && item.remoteInputUrl.startsWith('http')
      ? item.remoteInputUrl
      : undefined

    let remoteInputUrl: string
    if (preUploadedUrl) {
      // 並行上傳階段已完成上傳，這裡直接沿用，避免重複上傳
      remoteInputUrl = preUploadedUrl
    } else {
      onStatusUpdate({
        status: 'uploading',
        progress: 12,
        logs: ['正在將圖片上傳至 fal.storage...']
      })
      remoteInputUrl = await this.uploadLocalImage(item.sourceFilePath, item.remoteInputUrl)
    }

    if (signal.aborted) throw new Error('Task Cancelled')

    const inputPayload = buildFalInputPayload(item, config, remoteInputUrl)
    // 保留引擎上傳階段寫入的日誌，避免覆蓋掉「圖片已上傳」等訊息
    const collectedLogs: string[] = item.logs ? [...item.logs] : []
    const pushLog = (message?: string): void => {
      if (message && !collectedLogs.includes(message)) {
        collectedLogs.push(message)
      }
    }
    pushLog(
      preUploadedUrl
        ? '使用已完成上傳的圖片，正在發送請求至 fal.ai...'
        : '圖片上傳成功，正在發送請求至 fal.ai...'
    )

    onStatusUpdate({
      status: 'queued',
      progress: preUploadedUrl ? 32 : 25,
      remoteInputUrl,
      logs: [...collectedLogs]
    })

    let stepProgress = preUploadedUrl ? 40 : 30
    const result = await fal.subscribe(normalizeEndpointId(config.endpointId), {
      input: inputPayload,
      logs: true,
      onQueueUpdate: (update) => {
        if (signal.aborted) return
        if (update.status === 'IN_QUEUE') {
          onStatusUpdate({
            status: 'queued',
            queuePosition: update.queue_position,
            progress: 34
          })
        } else if (update.status === 'IN_PROGRESS') {
          if (update.logs && update.logs.length > 0) {
            for (const l of update.logs) {
              pushLog(l.message)
            }
          }
          stepProgress = Math.min(92, stepProgress + 12)
          onStatusUpdate({
            status: 'processing',
            progress: stepProgress,
            logs: [...collectedLogs]
          })
        }
      }
    })

    if (signal.aborted) throw new Error('Task Cancelled')

    const outputImageUrl = extractFalOutputImageUrl(result)
    return { remoteInputUrl, outputImageUrl, requestId: result.requestId }
  }

  /**
   * 通用影像處理訂閱器：呼叫指定 fal 模型並解析輸出圖片 URL。
   * 所有後處理功能（放大 / 去背 / 縮放 / 臉部修復）皆透過此方法執行。
   */
  private async subscribeToModel(
    endpointId: string,
    input: Record<string, unknown>,
    apiKey: string,
    callbacks: FalExecutionCallbacks,
    startProgress: number
  ): Promise<{ outputImageUrl: string; requestId?: string }> {
    const { onStatusUpdate, signal } = callbacks

    if (!apiKey || !apiKey.trim()) {
      const err = new Error('尚未設定 fal.ai API Key，無法執行影像處理')
      ;(err as { status?: number }).status = 401
      throw err
    }

    this.configureCredentials(apiKey)
    if (signal.aborted) throw new Error('Task Cancelled')

    let stepProgress = startProgress
    const result = await fal.subscribe(endpointId, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (signal.aborted) return
        if (update.status === 'IN_QUEUE') {
          onStatusUpdate({
            status: 'processing',
            queuePosition: update.queue_position,
            progress: startProgress
          })
        } else if (update.status === 'IN_PROGRESS') {
          stepProgress = Math.min(96, stepProgress + 14)
          onStatusUpdate({ status: 'processing', progress: stepProgress })
        }
      }
    })

    if (signal.aborted) throw new Error('Task Cancelled')

    const outputImageUrl = extractFalOutputImageUrl(result)
    return { outputImageUrl, requestId: result.requestId }
  }

  /** 呼叫 fal-ai/clarity-upscaler 將生成結果放大 */
  public async executeUpscale(
    outputImageUrl: string,
    cfg: UpscaleFeatureConfig,
    apiKey: string,
    callbacks: FalExecutionCallbacks
  ): Promise<{ outputImageUrl: string; requestId?: string }> {
    const input: Record<string, unknown> = {
      image_url: outputImageUrl,
      upscale_factor: Math.max(1, Math.min(4, Math.round(cfg.factor))),
      creativity: cfg.creativity,
      resemblance: cfg.resemblance,
      guidance_scale: cfg.guidanceScale,
      num_inference_steps: cfg.numInferenceSteps
    }
    if (cfg.negativePrompt && cfg.negativePrompt.trim()) {
      input.negative_prompt = cfg.negativePrompt.trim()
    }
    if (typeof cfg.seed === 'number' && !Number.isNaN(cfg.seed)) {
      input.seed = cfg.seed
    }
    return this.subscribeToModel(UPSCALE_ENDPOINT_ID, input, apiKey, callbacks, 46)
  }

  /** 呼叫 fal-ai/birefnet 去除背景 */
  public async executeBackgroundRemoval(
    outputImageUrl: string,
    cfg: BackgroundRemovalFeatureConfig,
    apiKey: string,
    callbacks: FalExecutionCallbacks
  ): Promise<{ outputImageUrl: string; requestId?: string }> {
    return this.subscribeToModel(
      BACKGROUND_REMOVAL_ENDPOINT_ID,
      {
        image_url: outputImageUrl,
        model: cfg.model,
        operating_resolution: cfg.operatingResolution,
        refine_foreground: cfg.refineForeground,
        output_format: cfg.outputFormat
      },
      apiKey,
      callbacks,
      46
    )
  }

  /** 呼叫 fal-ai/fal-image-resize 縮放圖片 */
  public async executeResize(
    outputImageUrl: string,
    cfg: ResizeFeatureConfig,
    apiKey: string,
    callbacks: FalExecutionCallbacks
  ): Promise<{ outputImageUrl: string; requestId?: string }> {
    return this.subscribeToModel(
      RESIZE_ENDPOINT_ID,
      {
        image_url: outputImageUrl,
        width: Math.round(cfg.width),
        height: Math.round(cfg.height),
        fit: cfg.fit,
        output_format: cfg.outputFormat
      },
      apiKey,
      callbacks,
      46
    )
  }

  /** 呼叫 fal-ai/codeformer 修復模糊/失真的人臉 */
  public async executeFaceRestore(
    outputImageUrl: string,
    cfg: FaceRestoreFeatureConfig,
    apiKey: string,
    callbacks: FalExecutionCallbacks
  ): Promise<{ outputImageUrl: string; requestId?: string }> {
    const input: Record<string, unknown> = {
      image_url: outputImageUrl,
      fidelity: cfg.fidelity,
      upscale_factor: Math.round(cfg.upscaleFactor),
      aligned: cfg.aligned,
      only_center_face: cfg.onlyCenterFace,
      face_upscale: cfg.faceUpscale
    }
    if (typeof cfg.seed === 'number' && !Number.isNaN(cfg.seed)) {
      input.seed = cfg.seed
    }
    return this.subscribeToModel(FACE_RESTORE_ENDPOINT_ID, input, apiKey, callbacks, 46)
  }
}

export const falService = new FalService()

