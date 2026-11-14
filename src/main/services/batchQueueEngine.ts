import {
  AppSettings,
  BatchItem,
  BatchQueueStatus,
  FeatureStatus,
  GenerationConfig,
  UsageCostInfo
} from '../../shared/types'
import { clampConcurrency } from '../../shared/concurrency'
import {
  falService,
  UPSCALE_ENDPOINT_ID,
  BACKGROUND_REMOVAL_ENDPOINT_ID,
  RESIZE_ENDPOINT_ID,
  FACE_RESTORE_ENDPOINT_ID
} from './falService'
import { falCostService, FalCostResult } from './falCostService'
import { downloadOrSaveOutputImage } from './imageDownloader'
import type { RecordImageGeneratedOptions } from './usageLogger'
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

export interface UsageRecorder {
  /** 圖片生成完成時記錄（寫入雲端使用記錄；模擬模式會標記為 `image_generated_SIM`） */
  recordImageGenerated: (
    item: BatchItem,
    config: GenerationConfig,
    options?: RecordImageGeneratedOptions
  ) => void
  /** 費用查詢完成時回填對應記錄 */
  recordCostResolved: (itemId: string, cost: UsageCostInfo) => void
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
  /** 使用記錄器（雲端試算表），未提供時不記錄 */
  usageRecorder?: UsageRecorder
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
    this.concurrency = clampConcurrency(settings.concurrency || 2)
  }

  public setConcurrency(newConcurrency: number): void {
    this.concurrency = clampConcurrency(newConcurrency)
    this.pump()
  }

  public startBatch(items: BatchItem[], config: GenerationConfig): void {
    const settings = this.deps.getSettings()
    this.concurrency = clampConcurrency(settings.concurrency || 2)
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
    extraRequests: { endpointId: string; requestId?: string }[] = []
  ): Promise<void> {
    try {
      const resolver =
        this.deps.costResolver ??
        ((key: string, endpoint: string, rid?: string) =>
          falCostService.resolveItemCost(key, endpoint, rid))

      const costs: FalCostResult[] = []

      const genCost = await resolver(apiKey, endpointId, requestId)
      if (genCost) costs.push(genCost)

      for (const req of extraRequests) {
        if (!req.requestId) continue
        const featureCost = await resolver(apiKey, req.endpointId, req.requestId)
        if (featureCost) costs.push(featureCost)
      }

      if (costs.length === 0) return

      const current = this.itemsMap.get(itemId)
      if (!current || current.status !== 'completed') return

      const totalUsd = costs.reduce((sum, c) => sum + c.costUsd, 0)
      const isEstimated = costs.some((c) => c.isEstimated)

      const updated = this.updateItem(itemId, {
        apiCostUsd: totalUsd,
        apiCostCurrency: costs[0].currency,
        apiCostIsEstimated: isEstimated
      })

      if (updated) {
        this.deps.usageRecorder?.recordCostResolved(itemId, {
          costUsd: totalUsd,
          currency: costs[0].currency,
          isEstimated
        })
      }
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
          upscaleStatus?: FeatureStatus
          upscaleRequestId?: string
          backgroundRemovalStatus?: FeatureStatus
          backgroundRemovalRequestId?: string
          resizeStatus?: FeatureStatus
          resizeRequestId?: string
          faceRestoreStatus?: FeatureStatus
          faceRestoreRequestId?: string
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
          let upscaleStatus: FeatureStatus | undefined
          let upscaleRequestId: string | undefined
          let backgroundRemovalStatus: FeatureStatus | undefined
          let backgroundRemovalRequestId: string | undefined
          let resizeStatus: FeatureStatus | undefined
          let resizeRequestId: string | undefined
          let faceRestoreStatus: FeatureStatus | undefined
          let faceRestoreRequestId: string | undefined

          // 依序執行啟用的後處理功能（前一個輸出接後一個輸入；Mock 模式不做真實後處理）
          const runFeature = async (
            enabled: boolean,
            onStart: () => void,
            onDone: (requestId?: string) => void,
            onFail: (msg: string) => void,
            execute: () => Promise<{ outputImageUrl: string; requestId?: string }>
          ): Promise<void> => {
            if (!enabled || settings.mockMode) return
            onStart()
            try {
              const r = await execute()
              if (controller.signal.aborted) return
              outputImageUrl = r.outputImageUrl
              onDone(r.requestId)
            } catch (err) {
              if (controller.signal.aborted) return
              onFail(err instanceof Error ? err.message : String(err))
            }
          }

          const currentLogs = (): string[] => this.itemsMap.get(item.id)?.logs ?? []

          await runFeature(
            config.upscale.enabled,
            () => {
              upscaleStatus = 'processing'
              onProgress({
                upscaleStatus: 'processing',
                logs: [...currentLogs(), `🎯 正在以 ${config.upscale.factor}x 放大 (Clarity Upscaler)...`]
              })
            },
            (rid) => {
              upscaleStatus = 'completed'
              upscaleRequestId = rid
              onProgress({ upscaleStatus: 'completed' })
            },
            (msg) => {
              upscaleStatus = 'failed'
              onProgress({
                upscaleStatus: 'failed',
                logs: [...currentLogs(), `⚠️ 放大失敗（保留前一步結果）：${msg}`]
              })
            },
            () =>
              falService.executeUpscale(outputImageUrl, config.upscale, settings.falApiKey, {
                onStatusUpdate: onProgress,
                signal: controller.signal
              })
          )

          await runFeature(
            config.backgroundRemoval.enabled,
            () => {
              backgroundRemovalStatus = 'processing'
              onProgress({
                backgroundRemovalStatus: 'processing',
                logs: [...currentLogs(), '🎯 正在去除背景 (BiRefNet)...']
              })
            },
            (rid) => {
              backgroundRemovalStatus = 'completed'
              backgroundRemovalRequestId = rid
              onProgress({ backgroundRemovalStatus: 'completed' })
            },
            (msg) => {
              backgroundRemovalStatus = 'failed'
              onProgress({
                backgroundRemovalStatus: 'failed',
                logs: [...currentLogs(), `⚠️ 去背失敗（保留前一步結果）：${msg}`]
              })
            },
            () =>
              falService.executeBackgroundRemoval(
                outputImageUrl,
                config.backgroundRemoval,
                settings.falApiKey,
                { onStatusUpdate: onProgress, signal: controller.signal }
              )
          )

          await runFeature(
            config.resize.enabled,
            () => {
              resizeStatus = 'processing'
              onProgress({
                resizeStatus: 'processing',
                logs: [...currentLogs(), `🎯 正在縮放至 ${config.resize.width}×${config.resize.height}...`]
              })
            },
            (rid) => {
              resizeStatus = 'completed'
              resizeRequestId = rid
              onProgress({ resizeStatus: 'completed' })
            },
            (msg) => {
              resizeStatus = 'failed'
              onProgress({
                resizeStatus: 'failed',
                logs: [...currentLogs(), `⚠️ 縮放失敗（保留前一步結果）：${msg}`]
              })
            },
            () =>
              falService.executeResize(outputImageUrl, config.resize, settings.falApiKey, {
                onStatusUpdate: onProgress,
                signal: controller.signal
              })
          )

          await runFeature(
            config.faceRestore.enabled,
            () => {
              faceRestoreStatus = 'processing'
              onProgress({
                faceRestoreStatus: 'processing',
                logs: [...currentLogs(), '🎯 正在進行臉部修復 (CodeFormer)...']
              })
            },
            (rid) => {
              faceRestoreStatus = 'completed'
              faceRestoreRequestId = rid
              onProgress({ faceRestoreStatus: 'completed' })
            },
            (msg) => {
              faceRestoreStatus = 'failed'
              onProgress({
                faceRestoreStatus: 'failed',
                logs: [...currentLogs(), `⚠️ 臉部修復失敗（保留前一步結果）：${msg}`]
              })
            },
            () =>
              falService.executeFaceRestore(outputImageUrl, config.faceRestore, settings.falApiKey, {
                onStatusUpdate: onProgress,
                signal: controller.signal
              })
          )

          if (controller.signal.aborted) return

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
            upscaleRequestId,
            backgroundRemovalStatus,
            backgroundRemovalRequestId,
            resizeStatus,
            resizeRequestId,
            faceRestoreStatus,
            faceRestoreRequestId
          }
        }

        if (controller.signal.aborted) return

        const finishedSettings = this.deps.getSettings()
        const requestId = result.requestId ?? this.itemsMap.get(item.id)?.requestId

        this.activeControllers.delete(item.id)
        const completedItem = this.updateItem(item.id, {
          status: 'completed',
          progress: 100,
          remoteInputUrl: result.remoteInputUrl,
          outputImageUrl: result.outputImageUrl,
          savedFilePath: result.savedFilePath,
          savedPreviewUrl: result.savedPreviewUrl,
          requestId,
          upscaleStatus: result.upscaleStatus,
          upscaleRequestId: result.upscaleRequestId,
          backgroundRemovalStatus: result.backgroundRemovalStatus,
          backgroundRemovalRequestId: result.backgroundRemovalRequestId,
          resizeStatus: result.resizeStatus,
          resizeRequestId: result.resizeRequestId,
          faceRestoreStatus: result.faceRestoreStatus,
          faceRestoreRequestId: result.faceRestoreRequestId,
          completedAt: Date.now(),
          errorMessage: undefined
        })
        this.emitQueueStatus()
        this.pump()

        // 寫入雲端使用記錄（每張成功圖片一列；模擬模式標記為 image_generated_SIM）
        if (completedItem) {
          this.deps.usageRecorder?.recordImageGenerated(completedItem, config, {
            isSimulation: finishedSettings.mockMode
          })
        }

        // 非阻塞查詢此張圖片的 API 費用（Mock 模式不計費，故不回填花費欄位）
        if (!finishedSettings.mockMode) {
          void this.resolveCostForItem(
            item.id,
            finishedSettings.falApiKey,
            config.endpointId,
            requestId,
            [
              { endpointId: UPSCALE_ENDPOINT_ID, requestId: result.upscaleRequestId },
              {
                endpointId: BACKGROUND_REMOVAL_ENDPOINT_ID,
                requestId: result.backgroundRemovalRequestId
              },
              { endpointId: RESIZE_ENDPOINT_ID, requestId: result.resizeRequestId },
              { endpointId: FACE_RESTORE_ENDPOINT_ID, requestId: result.faceRestoreRequestId }
            ]
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

