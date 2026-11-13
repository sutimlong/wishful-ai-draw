import {
  AppSettings,
  BatchItem,
  BatchQueueStatus,
  GenerationConfig,
  UpscaleStatus
} from '../../shared/types'
import { falService, UPSCALE_ENDPOINT_ID } from './falService'
import { falCostService, FalCostResult } from './falCostService'
import { downloadOrSaveOutputImage } from './imageDownloader'
import { toLocalMediaUrl } from '../ipc/file.ipc'

/** 上傳階段的最大同時上傳數量（所有圖片一次併發上傳，僅以此上限保護網路連線） */
const UPLOAD_CONCURRENCY = 10

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

export interface QueueEngineDeps {
  getSettings: () => AppSettings
  onItemUpdated: (item: BatchItem) => void
  onQueueStatusChanged: (status: BatchQueueStatus) => void
  /**
   * 自訂上傳器（測試或外掛擴充用）。未提供時使用 falService / Mock 模擬上傳。
   */
  customUploader?: (item: BatchItem, settings: AppSettings, signal: AbortSignal) => Promise<string>
  customRunner?: (
    item: BatchItem,
    config: GenerationConfig,
    settings: AppSettings,
    onProgress: (patch: Partial<BatchItem>) => void,
    signal: AbortSignal
  ) => Promise<{
    remoteInputUrl: string
    outputImageUrl: string
    savedFilePath?: string
    savedPreviewUrl?: string
    requestId?: string
  }>
  /** 自訂費用查詢器（測試用），未提供時呼叫 fal.ai 平台 API */
  costResolver?: (apiKey: string, endpointId: string, requestId?: string) => Promise<FalCostResult | null>
  retryBaseDelayMs?: number
}

interface QueuedEntry {
  item: BatchItem
  config: GenerationConfig
  index: number
}

function isNonRetryableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const status = (err as { status?: number; statusCode?: number }).status ??
    (err as { statusCode?: number }).statusCode
  if (
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 422 ||
    status === 400
  ) {
    return true
  }
  const msg = String((err as { message?: string }).message || '').toLowerCase()
  if (
    msg.includes('401') ||
    msg.includes('unauthorized') ||
    msg.includes('404') ||
    msg.includes('not found') ||
    msg.includes('422') ||
    msg.includes('invalid json') ||
    msg.includes('task cancelled')
  ) {
    return true
  }
  return false
}

export class BatchQueueEngine {
  private deps: QueueEngineDeps
  private queue: QueuedEntry[] = []
  private activeControllers = new Map<string, AbortController>()
  private uploadControllers = new Map<string, AbortController>()
  /** 已進入「並行上傳階段」但尚未完成上傳的任務 id（用於去重與取消） */
  private uploadPhaseIds = new Set<string>()
  private itemsMap = new Map<string, BatchItem>()
  private isPaused = false
  private concurrency = 2
  private maxRetries = 2
  private taskCounter = 0

  constructor(deps: QueueEngineDeps) {
    this.deps = deps
    const settings = deps.getSettings()
    this.concurrency = Math.max(1, Math.min(10, settings.concurrency || 2))
  }

  public setConcurrency(newConcurrency: number): void {
    this.concurrency = Math.max(1, Math.min(10, Math.round(newConcurrency)))
    this.pump()
  }

  public startBatch(items: BatchItem[], config: GenerationConfig): void {
    const settings = this.deps.getSettings()
    this.concurrency = Math.max(1, Math.min(10, settings.concurrency || 2))
    this.isPaused = false

    const accepted: QueuedEntry[] = []
    for (const rawItem of items) {
      // Avoid duplicating if already active, uploading, or queued
      if (this.activeControllers.has(rawItem.id)) continue
      if (this.uploadPhaseIds.has(rawItem.id)) continue
      if (this.queue.some((q) => q.item.id === rawItem.id)) continue

      this.taskCounter++
      const queuedItem: BatchItem = {
        ...rawItem,
        status: 'uploading',
        progress: 8,
        queuePosition: undefined,
        errorMessage: undefined,
        startedAt: Date.now(),
        completedAt: undefined,
        requestId: undefined,
        apiCostUsd: undefined,
        apiCostCurrency: undefined,
        apiCostIsEstimated: undefined
      }
      this.itemsMap.set(queuedItem.id, queuedItem)
      this.deps.onItemUpdated(queuedItem)
      accepted.push({
        item: queuedItem,
        config,
        index: this.taskCounter
      })
    }

    this.emitQueueStatus()

    if (accepted.length === 0) return

    if (this.deps.customRunner && !this.deps.customUploader) {
      // 自訂 runner 自行處理上傳 → 直接進入生成佇列
      for (const entry of accepted) {
        const queued = this.updateItem(entry.item.id, { status: 'queued', progress: 5 })
        this.queue.push({ ...entry, item: queued ?? entry.item })
      }
      this.emitQueueStatus()
      this.pump()
      return
    }

    // 先以「並行上傳階段」把本次批次所有圖片同時上傳至 fal.ai，再開始生成
    void this.runUploadPhase(accepted, settings)
  }

  public pause(): void {
    this.isPaused = true
    this.emitQueueStatus()
  }

  public resume(): void {
    if (!this.isPaused) return
    this.isPaused = false
    this.emitQueueStatus()
    this.pump()
  }

  public cancelItem(itemId: string): void {
    // 0. Check if still in the parallel upload phase
    if (this.uploadPhaseIds.has(itemId)) {
      const uploadController = this.uploadControllers.get(itemId)
      uploadController?.abort()
      this.uploadControllers.delete(itemId)
      this.uploadPhaseIds.delete(itemId)
      this.updateItem(itemId, {
        status: 'cancelled',
        progress: 0,
        errorMessage: '已由使用者中止上傳'
      })
      this.emitQueueStatus()
      return
    }

    // 1. Check if in waiting queue
    const qIndex = this.queue.findIndex((q) => q.item.id === itemId)
    if (qIndex !== -1) {
      const [removed] = this.queue.splice(qIndex, 1)
      this.updateItem(removed.item.id, {
        status: 'cancelled',
        progress: 0,
        errorMessage: '已由使用者取消'
      })
      this.emitQueueStatus()
      return
    }

    // 2. Check if currently active
    const controller = this.activeControllers.get(itemId)
    if (controller) {
      controller.abort()
      this.activeControllers.delete(itemId)
      this.updateItem(itemId, {
        status: 'cancelled',
        progress: 0,
        errorMessage: '已由使用者中止'
      })
      this.emitQueueStatus()
      this.pump()
    }
  }

  public cancelAll(): void {
    this.isPaused = false

    // 中止仍在並行上傳階段的所有任務
    for (const itemId of Array.from(this.uploadPhaseIds)) {
      const uploadController = this.uploadControllers.get(itemId)
      uploadController?.abort()
      this.updateItem(itemId, {
        status: 'cancelled',
        progress: 0,
        errorMessage: '已全部取消'
      })
    }
    this.uploadControllers.clear()
    this.uploadPhaseIds.clear()

    while (this.queue.length > 0) {
      const entry = this.queue.shift()!
      this.updateItem(entry.item.id, {
        status: 'cancelled',
        progress: 0,
        errorMessage: '已全部取消'
      })
    }

    for (const [itemId, controller] of this.activeControllers.entries()) {
      controller.abort()
      this.updateItem(itemId, {
        status: 'cancelled',
        progress: 0,
        errorMessage: '已全部取消'
      })
    }
    this.activeControllers.clear()
    this.emitQueueStatus()
  }

  private updateItem(itemId: string, patch: Partial<BatchItem>): BatchItem | undefined {
    const existing = this.itemsMap.get(itemId)
    if (!existing) return undefined
    const updated: BatchItem = { ...existing, ...patch }
    this.itemsMap.set(itemId, updated)
    this.deps.onItemUpdated(updated)
    return updated
  }

  private emitQueueStatus(): void {
    const allItems = Array.from(this.itemsMap.values())
    const activeCount = this.activeControllers.size + this.uploadControllers.size
    const queuedCount = this.queue.length
    const completedCount = allItems.filter((i) => i.status === 'completed').length
    const failedCount = allItems.filter((i) => i.status === 'failed').length

    this.deps.onQueueStatusChanged({
      isRunning: activeCount > 0 || queuedCount > 0,
      isPaused: this.isPaused,
      activeCount,
      completedCount,
      failedCount,
      totalCount: allItems.length
    })
  }

  /**
   * 並行上傳階段：本次批次的所有圖片同時上傳（以 UPLOAD_CONCURRENCY 為上限），
   * 上傳完成者立即進入生成佇列，讓上傳與生成重疊進行、縮短總等待時間。
   */
  private async runUploadPhase(entries: QueuedEntry[], settings: AppSettings): Promise<void> {
    const pending = [...entries]
    for (const entry of pending) {
      this.uploadPhaseIds.add(entry.item.id)
    }

    const workerCount = Math.min(UPLOAD_CONCURRENCY, pending.length)
    await Promise.all(
      Array.from({ length: workerCount }, () => this.uploadWorkerLoop(pending, settings))
    )

    this.emitQueueStatus()
    this.pump()
  }

  private async uploadWorkerLoop(pending: QueuedEntry[], settings: AppSettings): Promise<void> {
    for (;;) {
      const next = pending.shift()
      if (!next) return
      await this.uploadEntry(next, settings)
    }
  }

  private async uploadEntry(entry: QueuedEntry, settings: AppSettings): Promise<void> {
    const { item, config, index } = entry

    // 使用者可能在上傳開始前就已取消此任務
    if (!this.uploadPhaseIds.has(item.id)) return

    const controller = new AbortController()
    this.uploadControllers.set(item.id, controller)
    this.updateItem(item.id, {
      status: 'uploading',
      progress: 12,
      startedAt: this.itemsMap.get(item.id)?.startedAt ?? Date.now(),
      errorMessage: undefined
    })
    this.emitQueueStatus()

    try {
      const remoteInputUrl = await this.performUpload(item, settings, controller.signal)
      if (controller.signal.aborted || !this.uploadPhaseIds.has(item.id)) return

      this.uploadControllers.delete(item.id)
      this.uploadPhaseIds.delete(item.id)
      const updated = this.updateItem(item.id, {
        status: 'queued',
        progress: 30,
        remoteInputUrl,
        logs: [...(this.itemsMap.get(item.id)?.logs ?? []), '✅ 圖片已上傳至 fal.ai，等待生成排程']
      })
      if (updated) {
        this.queue.push({ item: updated, config, index })
      }
      this.emitQueueStatus()
      this.pump()
    } catch (err) {
      this.uploadControllers.delete(item.id)
      this.uploadPhaseIds.delete(item.id)
      if (controller.signal.aborted) return

      const errorMsg = err instanceof Error ? err.message : String(err)
      this.updateItem(item.id, {
        status: 'failed',
        progress: 0,
        errorMessage: `圖片上傳失敗：${errorMsg}`,
        completedAt: Date.now()
      })
      this.emitQueueStatus()
    }
  }

  private performUpload(
    item: BatchItem,
    settings: AppSettings,
    signal: AbortSignal
  ): Promise<string> {
    if (signal.aborted) {
      return Promise.reject(new Error('Task Cancelled'))
    }
    if (this.deps.customUploader) {
      return this.deps.customUploader(item, settings, signal)
    }
    if (settings.mockMode) {
      this.updateItem(item.id, {
        status: 'uploading',
        progress: 18,
        logs: [...(this.itemsMap.get(item.id)?.logs ?? []), '[Mock] 同時模擬上傳中...']
      })
      return sleep(300, signal).then(
        () => `https://mock.fal.media/${encodeURIComponent(item.sourceFileName)}`
      )
    }
    // 已上傳過的圖片會命中 falService 的快取（不會重複上傳）
    return falService.uploadLocalImage(item.sourceFilePath, item.remoteInputUrl, settings.falApiKey)
  }

  /** 任務完成後查詢該張圖片的 fal.ai API 費用（非阻塞，失敗不影響生成結果） */
  private async resolveCostForItem(
    itemId: string,
    apiKey: string,
    endpointId: string,
    requestId?: string,
    upscaleRequestId?: string
  ): Promise<void> {
    try {
      const resolver =
        this.deps.costResolver ??
        ((key: string, endpoint: string, rid?: string) =>
          falCostService.resolveItemCost(key, endpoint, rid))

      const costs: FalCostResult[] = []

      const genCost = await resolver(apiKey, endpointId, requestId)
      if (genCost) costs.push(genCost)

      if (upscaleRequestId) {
        const upscaleCost = await resolver(apiKey, UPSCALE_ENDPOINT_ID, upscaleRequestId)
        if (upscaleCost) costs.push(upscaleCost)
      }

      if (costs.length === 0) return

      const current = this.itemsMap.get(itemId)
      if (!current || current.status !== 'completed') return

      const totalUsd = costs.reduce((sum, c) => sum + c.costUsd, 0)
      const isEstimated = costs.some((c) => c.isEstimated)

      this.updateItem(itemId, {
        apiCostUsd: totalUsd,
        apiCostCurrency: costs[0].currency,
        apiCostIsEstimated: isEstimated
      })
    } catch {
      // 費用查詢失敗（網路、權限）不應影響已完成的生成結果
    }
  }

  private pump(): void {
    if (this.isPaused) return

    while (this.activeControllers.size < this.concurrency && this.queue.length > 0) {
      const nextEntry = this.queue.shift()!
      this.runWorker(nextEntry)
    }

    this.emitQueueStatus()
  }

  private async runWorker(entry: QueuedEntry): Promise<void> {
    const { item, config, index } = entry
    const controller = new AbortController()
    this.activeControllers.set(item.id, controller)

    const startedAt = Date.now()
    const hasUploadedInput = Boolean(item.remoteInputUrl && item.remoteInputUrl.startsWith('http'))
    this.updateItem(item.id, {
      status: hasUploadedInput ? 'queued' : 'uploading',
      progress: hasUploadedInput ? 30 : 10,
      startedAt: this.itemsMap.get(item.id)?.startedAt ?? startedAt,
      errorMessage: undefined
    })
    this.emitQueueStatus()

    let attempt = 0
    const baseDelay = this.deps.retryBaseDelayMs ?? 1200

    while (attempt <= this.maxRetries) {
      if (controller.signal.aborted) {
        return
      }

      try {
        const settings = this.deps.getSettings()
        const currentItem = this.itemsMap.get(item.id) || item

        const onProgress = (patch: Partial<BatchItem>): void => {
          if (controller.signal.aborted) return
          this.updateItem(item.id, patch)
        }

        let result: {
          remoteInputUrl: string
          outputImageUrl: string
          savedFilePath?: string
          savedPreviewUrl?: string
          requestId?: string
          upscaleStatus?: UpscaleStatus
          upscaleRequestId?: string
        }

        if (this.deps.customRunner) {
          result = await this.deps.customRunner(
            currentItem,
            config,
            settings,
            onProgress,
            controller.signal
          )
        } else {
          const genResult = settings.mockMode
            ? await falService.executeMockGeneration(currentItem, config, {
                onStatusUpdate: onProgress,
                signal: controller.signal
              })
            : await falService.executeRealGeneration(
                currentItem,
                config,
                settings.falApiKey,
                {
                  onStatusUpdate: onProgress,
                  signal: controller.signal
                }
              )

          let outputImageUrl = genResult.outputImageUrl
          let upscaleStatus: UpscaleStatus | undefined
          let upscaleRequestId: string | undefined

          // 實際放大：生成完成後呼叫 fal-ai/clarity-upscaler（Mock 模式不做真實放大）
          if (!settings.mockMode && config.upscaleEnabled) {
            onProgress({
              upscaleStatus: 'processing',
              logs: [
                ...(this.itemsMap.get(item.id)?.logs ?? []),
                `🎯 正在以 ${config.upscaleFactor}x 放大生成結果 (Clarity Upscaler)...`
              ]
            })
            try {
              const upscaleResult = await falService.executeUpscale(
                outputImageUrl,
                config.upscaleFactor,
                settings.falApiKey,
                { onStatusUpdate: onProgress, signal: controller.signal }
              )
              if (controller.signal.aborted) return
              outputImageUrl = upscaleResult.outputImageUrl
              upscaleRequestId = upscaleResult.requestId
              upscaleStatus = 'completed'
            } catch (err) {
              if (controller.signal.aborted) return
              // 放大失敗不影響已生成的原始圖片，保留原圖並標記放大失敗
              const msg = err instanceof Error ? err.message : String(err)
              upscaleStatus = 'failed'
              onProgress({
                upscaleStatus: 'failed',
                logs: [
                  ...(this.itemsMap.get(item.id)?.logs ?? []),
                  `⚠️ 放大失敗（保留原始生成圖）：${msg}`
                ]
              })
            }
          }

          let savedFilePath: string | undefined
          let savedPreviewUrl: string | undefined

          if (settings.autoSaveOutput && settings.outputDirectory) {
            savedFilePath = await downloadOrSaveOutputImage({
              outputImageUrl,
              sourceFilePath: currentItem.sourceFilePath,
              outputDirectory: settings.outputDirectory,
              namingPattern: settings.namingPattern,
              outputFormat: config.outputFormat,
              index,
              isMockLocalCopy: settings.mockMode,
              signal: controller.signal
            })
            savedPreviewUrl = toLocalMediaUrl(savedFilePath)
          }

          result = {
            ...genResult,
            outputImageUrl,
            savedFilePath,
            savedPreviewUrl,
            upscaleStatus,
            upscaleRequestId
          }
        }

        if (controller.signal.aborted) return

        const finishedSettings = this.deps.getSettings()
        const requestId = result.requestId ?? this.itemsMap.get(item.id)?.requestId

        this.activeControllers.delete(item.id)
        this.updateItem(item.id, {
          status: 'completed',
          progress: 100,
          remoteInputUrl: result.remoteInputUrl,
          outputImageUrl: result.outputImageUrl,
          savedFilePath: result.savedFilePath,
          savedPreviewUrl: result.savedPreviewUrl,
          requestId,
          upscaleStatus: result.upscaleStatus,
          upscaleRequestId: result.upscaleRequestId,
          completedAt: Date.now(),
          errorMessage: undefined
        })
        this.emitQueueStatus()
        this.pump()

        // 非阻塞查詢此張圖片的 API 費用（Mock 模式不計費；放大費用一併合併計算）
        if (!finishedSettings.mockMode) {
          void this.resolveCostForItem(
            item.id,
            finishedSettings.falApiKey,
            config.endpointId,
            requestId,
            result.upscaleRequestId
          )
        }
        return
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }

        attempt++
        const isFatal = isNonRetryableError(err)
        const errorMsg = err instanceof Error ? err.message : String(err)

        if (isFatal || attempt > this.maxRetries) {
          this.activeControllers.delete(item.id)
          this.updateItem(item.id, {
            status: 'failed',
            progress: 0,
            errorMessage: errorMsg,
            completedAt: Date.now()
          })
          this.emitQueueStatus()
          this.pump()
          return
        }

        // Exponential backoff before retry
        const delay = baseDelay * Math.pow(2, attempt - 1)
        this.updateItem(item.id, {
          status: 'queued',
          logs: [
            ...(this.itemsMap.get(item.id)?.logs || []),
            `⚠️ 發生暫時性錯誤 (${errorMsg})，將於 ${(delay / 1000).toFixed(1)} 秒後進行第 ${attempt} 次重試...`
          ]
        })

        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, delay)
          controller.signal.addEventListener(
            'abort',
            () => {
              clearTimeout(timer)
              resolve()
            },
            { once: true }
          )
        })
      }
    }
  }
}

