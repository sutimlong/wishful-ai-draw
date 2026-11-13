import { describe, expect, it } from 'vitest'
import { BatchQueueEngine } from '../src/main/services/batchQueueEngine'
import {
  AppSettings,
  BatchItem,
  BatchQueueStatus,
  GenerationConfig
} from '../src/shared/types'

const mockSettings: AppSettings = {
  falApiKey: 'test-key-1234567890',
  hasApiKey: true,
  outputDirectory: '/tmp/out',
  concurrency: 2,
  autoSaveOutput: false,
  namingPattern: '{original_name}_ai',
  mockMode: true
}

const mockConfig: GenerationConfig = {
  endpointId: 'fal-ai/flux/dev/image-to-image',
  imageInputField: 'image_url',
  isArrayImageInput: false,
  prompt: 'test prompt',
  strength: 0.75,
  numInferenceSteps: 20,
  guidanceScale: 3.5,
  outputFormat: 'png',
  upscaleEnabled: false,
  upscaleFactor: 2
}

function createItems(count: number): BatchItem[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `task-${idx + 1}`,
    sourceFilePath: `/tmp/img-${idx + 1}.png`,
    sourceFileName: `img-${idx + 1}.png`,
    sourcePreviewUrl: `local-media://image?path=/tmp/img-${idx + 1}.png`,
    status: 'idle',
    progress: 0
  }))
}

describe('BatchQueueEngine', () => {
  it('strictly enforces concurrency limit across batch tasks', async () => {
    let currentActive = 0
    let maxObservedActive = 0
    const updatedItems = new Map<string, BatchItem>()

    await new Promise<void>((resolve) => {
      const engine = new BatchQueueEngine({
        getSettings: () => ({ ...mockSettings, concurrency: 2 }),
        onItemUpdated: (item) => {
          updatedItems.set(item.id, item)
          const doneCount = Array.from(updatedItems.values()).filter(
            (i) => i.status === 'completed'
          ).length
          if (doneCount === 6) {
            resolve()
          }
        },
        onQueueStatusChanged: (_status: BatchQueueStatus) => {},
        customRunner: async (item) => {
          currentActive++
          maxObservedActive = Math.max(maxObservedActive, currentActive)
          await new Promise((r) => setTimeout(r, 35))
          currentActive--
          return {
            remoteInputUrl: `https://fal.media/${item.id}`,
            outputImageUrl: `https://fal.media/out-${item.id}.png`
          }
        }
      })

      engine.startBatch(createItems(6), mockConfig)
    })

    expect(maxObservedActive).toBe(2)
    expect(updatedItems.size).toBe(6)
    for (const item of updatedItems.values()) {
      expect(item.status).toBe('completed')
      expect(item.progress).toBe(100)
    }
  })

  it('retries transient errors with exponential backoff and succeeds, but fails immediately on 401', async () => {
    const attemptsByItem = new Map<string, number>()
    const finalItems = new Map<string, BatchItem>()

    await new Promise<void>((resolve) => {
      const engine = new BatchQueueEngine({
        getSettings: () => ({ ...mockSettings, concurrency: 2 }),
        retryBaseDelayMs: 15,
        onItemUpdated: (item) => {
          finalItems.set(item.id, item)
          const finished = Array.from(finalItems.values()).filter(
            (i) => i.status === 'completed' || i.status === 'failed'
          )
          if (finished.length === 2) {
            resolve()
          }
        },
        onQueueStatusChanged: () => {},
        customRunner: async (item) => {
          const prev = attemptsByItem.get(item.id) || 0
          const current = prev + 1
          attemptsByItem.set(item.id, current)

          if (item.id === 'task-1') {
            // Transient failure twice, succeeds on 3rd try
            if (current < 3) {
              throw new Error('503 Service Temporarily Unavailable')
            }
            return {
              remoteInputUrl: 'https://fal.media/in1.png',
              outputImageUrl: 'https://fal.media/out1.png'
            }
          } else {
            // Fatal 401 error: should NOT retry
            const authErr = new Error('401 Unauthorized: Invalid API Key')
            ;(authErr as { status?: number }).status = 401
            throw authErr
          }
        }
      })

      engine.startBatch(createItems(2), mockConfig)
    })

    expect(attemptsByItem.get('task-1')).toBe(3)
    expect(finalItems.get('task-1')?.status).toBe('completed')

    expect(attemptsByItem.get('task-2')).toBe(1)
    expect(finalItems.get('task-2')?.status).toBe('failed')
  })

  it('supports pause, resume, and cancelAll', async () => {
    const updatedItems = new Map<string, BatchItem>()

    const engine = new BatchQueueEngine({
      getSettings: () => ({ ...mockSettings, concurrency: 1 }),
      onItemUpdated: (item) => {
        updatedItems.set(item.id, item)
      },
      onQueueStatusChanged: () => {},
      customRunner: async (item, _cfg, _settings, _onProgress, signal) => {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 60)
          signal.addEventListener(
            'abort',
            () => {
              clearTimeout(timer)
              reject(new Error('Task Cancelled'))
            },
            { once: true }
          )
        })
        return {
          remoteInputUrl: `https://fal.media/${item.id}`,
          outputImageUrl: `https://fal.media/out-${item.id}.png`
        }
      }
    })

    engine.startBatch(createItems(4), mockConfig)
    engine.pause()
    engine.cancelAll()

    const statuses = Array.from(updatedItems.values()).map((i) => i.status)
    expect(statuses.every((s) => s === 'cancelled')).toBe(true)
  })

  it('同時上傳批次內所有圖片，並在完成後回填每張圖的 API 費用', async () => {
    let activeUploads = 0
    let maxActiveUploads = 0
    const sequence: string[] = []
    const updatedItems = new Map<string, BatchItem>()

    await new Promise<void>((resolve) => {
      const engine = new BatchQueueEngine({
        getSettings: () => ({ ...mockSettings, mockMode: false, concurrency: 1 }),
        onItemUpdated: (item) => {
          updatedItems.set(item.id, item)
          const done = Array.from(updatedItems.values()).filter(
            (i) => i.status === 'completed' && typeof i.apiCostUsd === 'number'
          )
          if (done.length === 6) {
            resolve()
          }
        },
        onQueueStatusChanged: () => {},
        customUploader: async (item) => {
          activeUploads++
          maxActiveUploads = Math.max(maxActiveUploads, activeUploads)
          await new Promise((r) => setTimeout(r, 20))
          activeUploads--
          sequence.push(`upload:${item.id}`)
          return `https://fal.media/${item.id}.png`
        },
        customRunner: async (item) => {
          sequence.push(`gen:${item.id}`)
          await new Promise((r) => setTimeout(r, 10))
          return {
            remoteInputUrl: `https://fal.media/${item.id}.png`,
            outputImageUrl: `https://fal.media/out-${item.id}.png`,
            requestId: `req-${item.id}`
          }
        },
        costResolver: async () => ({
          costUsd: 0.5,
          currency: 'USD',
          isEstimated: true,
          source: 'pricing_estimate'
        })
      })

      engine.startBatch(createItems(6), mockConfig)
    })

    // 所有圖片同時上傳（不受生成併發數 1 限制）
    expect(maxActiveUploads).toBe(6)

    for (let idx = 1; idx <= 6; idx++) {
      const item = updatedItems.get(`task-${idx}`)
      expect(item?.status).toBe('completed')
      expect(item?.remoteInputUrl).toBe(`https://fal.media/task-${idx}.png`)
      expect(item?.requestId).toBe(`req-task-${idx}`)
      expect(item?.apiCostUsd).toBe(0.5)
      expect(item?.apiCostCurrency).toBe('USD')
      expect(item?.apiCostIsEstimated).toBe(true)

      // 每張圖都必須先完成上傳才進入生成
      expect(sequence.indexOf(`upload:task-${idx}`)).toBeGreaterThanOrEqual(0)
      expect(sequence.indexOf(`upload:task-${idx}`)).toBeLessThan(
        sequence.indexOf(`gen:task-${idx}`)
      )
    }
  })

  it('上傳失敗的圖片直接標記失敗，不會進入生成佇列', async () => {
    const updatedItems = new Map<string, BatchItem>()
    const startedGenerationIds: string[] = []

    await new Promise<void>((resolve) => {
      const engine = new BatchQueueEngine({
        getSettings: () => ({ ...mockSettings, mockMode: false }),
        onItemUpdated: (item) => {
          updatedItems.set(item.id, item)
          const finished = Array.from(updatedItems.values()).filter(
            (i) => i.status === 'completed' || i.status === 'failed'
          )
          if (finished.length === 2) {
            resolve()
          }
        },
        onQueueStatusChanged: () => {},
        customUploader: async (item) => {
          if (item.id === 'task-1') {
            throw new Error('fal.storage 連線逾時')
          }
          return `https://fal.media/${item.id}.png`
        },
        customRunner: async (item) => {
          startedGenerationIds.push(item.id)
          return {
            remoteInputUrl: `https://fal.media/${item.id}.png`,
            outputImageUrl: `https://fal.media/out-${item.id}.png`
          }
        },
        costResolver: async () => null
      })

      engine.startBatch(createItems(2), mockConfig)
    })

    const failedItem = updatedItems.get('task-1')
    expect(failedItem?.status).toBe('failed')
    expect(failedItem?.errorMessage).toContain('圖片上傳失敗')
    expect(failedItem?.errorMessage).toContain('fal.storage 連線逾時')

    expect(updatedItems.get('task-2')?.status).toBe('completed')
    expect(startedGenerationIds).toEqual(['task-2'])
  })
})

