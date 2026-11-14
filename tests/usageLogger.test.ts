import { describe, expect, it, vi } from 'vitest'
import { UsageLogger } from '../src/main/services/usageLogger'
import { BatchItem, GenerationConfig, UsageCostInfo, UsageRecord } from '../src/shared/types'

const config = { endpointId: 'fal-ai/flux/dev/image-to-image' } as unknown as GenerationConfig

function createItem(overrides: Partial<BatchItem> = {}): BatchItem {
  return {
    id: 'task-1',
    sourceFilePath: '/tmp/a.png',
    sourceFileName: 'a.png',
    sourcePreviewUrl: 'local-media://image?path=/tmp/a.png',
    status: 'completed',
    progress: 100,
    completedAt: Date.UTC(2026, 0, 2, 3, 4, 5),
    ...overrides
  }
}

function createDeferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe('UsageLogger', () => {
  it('圖片完成時追加一列，費用查得後回填同一列', async () => {
    const records: UsageRecord[] = []
    const updates: Array<{ row: number; cost: UsageCostInfo }> = []

    const logger = new UsageLogger({
      sheets: {
        appendUsageRow: async (record) => {
          records.push(record)
          return 5
        },
        updateCostCell: async (row, cost) => {
          updates.push({ row, cost })
        }
      },
      getCurrentUser: () => ({ email: 'alice@example.com', name: 'Alice' })
    })

    const item = createItem()
    logger.recordImageGenerated(item, config)
    logger.recordCostResolved(item.id, { costUsd: 0.025, currency: 'USD', isEstimated: false })

    await vi.waitFor(() => expect(updates).toHaveLength(1))

    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      userEmail: 'alice@example.com',
      userName: 'Alice',
      eventType: 'image_generated',
      sourceFileName: 'a.png',
      endpointId: config.endpointId,
      imageCount: 1,
      status: 'completed'
    })
    expect(updates[0]).toEqual({
      row: 5,
      cost: { costUsd: 0.025, currency: 'USD', isEstimated: false }
    })
  })

  it('模擬模式的事件為 image_generated_SIM，且不寫入花費欄位', async () => {
    const records: UsageRecord[] = []

    const logger = new UsageLogger({
      sheets: {
        appendUsageRow: async (record) => {
          records.push(record)
          return 7
        },
        updateCostCell: vi.fn(async () => undefined)
      },
      getCurrentUser: () => ({ email: 'sim@example.com', name: 'Sim' })
    })

    // 即使 item 帶有費用欄位，模擬模式也不應寫入花費
    logger.recordImageGenerated(
      createItem({ apiCostUsd: 0.9, apiCostCurrency: 'USD', apiCostIsEstimated: false }),
      config,
      { isSimulation: true }
    )

    await vi.waitFor(() => expect(records).toHaveLength(1))

    expect(records[0]).toMatchObject({
      eventType: 'image_generated_SIM',
      sourceFileName: 'a.png',
      imageCount: 1,
      status: 'completed'
    })
    expect(records[0].costUsd).toBeUndefined()
    expect(records[0].costCurrency).toBeUndefined()
    expect(records[0].costIsEstimated).toBeUndefined()
  })

  it('未指定 isSimulation 時，事件維持 image_generated', async () => {
    const records: UsageRecord[] = []

    const logger = new UsageLogger({
      sheets: {
        appendUsageRow: async (record) => {
          records.push(record)
          return 1
        },
        updateCostCell: vi.fn(async () => undefined)
      },
      getCurrentUser: () => ({ email: 'real@example.com', name: 'Real' })
    })

    logger.recordImageGenerated(createItem({ apiCostUsd: 0.02 }), config)

    await vi.waitFor(() => expect(records).toHaveLength(1))
    expect(records[0]).toMatchObject({ eventType: 'image_generated', costUsd: 0.02 })
  })

  it('費用在追加完成前就到時，會在取得列號後才回填', async () => {
    const deferred = createDeferred<number | null>()
    const updateCostCell = vi.fn(async () => undefined)

    const logger = new UsageLogger({
      sheets: {
        appendUsageRow: () => deferred.promise,
        updateCostCell
      },
      getCurrentUser: () => ({ email: 'bob@example.com', name: 'Bob' })
    })

    const item = createItem()
    logger.recordImageGenerated(item, config)
    logger.recordCostResolved(item.id, { costUsd: 1.5, currency: 'USD', isEstimated: true })

    // 尚未取得列號，不應呼叫回填
    expect(updateCostCell).not.toHaveBeenCalled()

    deferred.resolve(9)

    await vi.waitFor(() =>
      expect(updateCostCell).toHaveBeenCalledWith(9, {
        costUsd: 1.5,
        currency: 'USD',
        isEstimated: true
      })
    )
  })

  it('費用查詢重複回報時只回填一次', async () => {
    const updateCostCell = vi.fn(async () => undefined)

    const logger = new UsageLogger({
      sheets: {
        appendUsageRow: async () => 3,
        updateCostCell
      },
      getCurrentUser: () => ({ email: 'c@example.com', name: 'Carol' })
    })

    const item = createItem()
    logger.recordImageGenerated(item, config)
    logger.recordCostResolved(item.id, { costUsd: 0.1, currency: 'USD', isEstimated: false })
    logger.recordCostResolved(item.id, { costUsd: 0.2, currency: 'USD', isEstimated: false })

    await vi.waitFor(() => expect(updateCostCell).toHaveBeenCalledTimes(1))
    expect(updateCostCell).toHaveBeenCalledWith(3, {
      costUsd: 0.1,
      currency: 'USD',
      isEstimated: false
    })
  })

  it('未登入時不寫入任何記錄', async () => {
    const appendUsageRow = vi.fn(async () => 1)

    const logger = new UsageLogger({
      sheets: { appendUsageRow, updateCostCell: vi.fn(async () => undefined) },
      getCurrentUser: () => null
    })

    logger.recordImageGenerated(createItem(), config)
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(appendUsageRow).not.toHaveBeenCalled()
  })

  it('未設定試算表時安全地略過', async () => {
    const logger = new UsageLogger({ getCurrentUser: () => ({ email: 'd@example.com', name: 'Dan' }) })

    expect(() => {
      logger.recordImageGenerated(createItem(), config)
      logger.recordCostResolved('task-1', { costUsd: 1, currency: 'USD', isEstimated: false })
    }).not.toThrow()
  })

  it('追加失敗時不會拋出未處理錯誤', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const logger = new UsageLogger({
      sheets: {
        appendUsageRow: async () => {
          throw new Error('sheet unavailable')
        },
        updateCostCell: vi.fn(async () => undefined)
      },
      getCurrentUser: () => ({ email: 'e@example.com', name: 'Eve' })
    })

    expect(() => logger.recordImageGenerated(createItem(), config)).not.toThrow()
    await vi.waitFor(() => expect(errorSpy).toHaveBeenCalled())

    errorSpy.mockRestore()
  })

  it('AI 優化提示詞成功時寫入 Prompt word_optimization 一列', async () => {
    const records: UsageRecord[] = []
    const updateCostCell = vi.fn(async () => undefined)

    const logger = new UsageLogger({
      sheets: {
        appendUsageRow: async (record) => {
          records.push(record)
          return 12
        },
        updateCostCell
      },
      getCurrentUser: () => ({ email: 'fay@example.com', name: 'Fay' })
    })

    logger.recordPromptOptimization('  一隻貓\n坐在窗邊  ', { model: 'deepseek-chat' })

    await vi.waitFor(() => expect(records).toHaveLength(1))

    expect(records[0]).toMatchObject({
      userEmail: 'fay@example.com',
      userName: 'Fay',
      eventType: 'Prompt word_optimization',
      // 提示詞會壓成單行後寫入「圖片檔名」欄
      sourceFileName: '一隻貓 坐在窗邊',
      endpointId: 'deepseek-chat',
      status: 'success'
    })
    // 提示詞優化沒有圖片張數，也沒有 fal.ai 費用可回填
    expect(records[0].imageCount).toBeUndefined()
    expect(records[0].costUsd).toBeUndefined()
    expect(updateCostCell).not.toHaveBeenCalled()
  })

  it('提示詞優化：未登入或未設定試算表時不寫入', async () => {
    const appendUsageRow = vi.fn(async () => 1)
    const sheets = { appendUsageRow, updateCostCell: vi.fn(async () => undefined) }

    const loggedOut = new UsageLogger({ sheets, getCurrentUser: () => null })
    const noSheets = new UsageLogger({
      getCurrentUser: () => ({ email: 'g@example.com', name: 'G' })
    })

    loggedOut.recordPromptOptimization('a cat', { model: 'deepseek-chat' })
    noSheets.recordPromptOptimization('a cat', { model: 'deepseek-chat' })
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(appendUsageRow).not.toHaveBeenCalled()
  })

  it('提示詞優化記錄寫入失敗時不會拋出未處理錯誤', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const logger = new UsageLogger({
      sheets: {
        appendUsageRow: async () => {
          throw new Error('sheet unavailable')
        },
        updateCostCell: vi.fn(async () => undefined)
      },
      getCurrentUser: () => ({ email: 'h@example.com', name: 'Henry' })
    })

    expect(() =>
      logger.recordPromptOptimization('a cat', { model: 'deepseek-chat' })
    ).not.toThrow()
    await vi.waitFor(() => expect(errorSpy).toHaveBeenCalled())

    errorSpy.mockRestore()
  })

  it('文字生成圖片：每張成功圖片追加一列 image_generated 記錄', async () => {
    const records: UsageRecord[] = []

    const logger = new UsageLogger({
      sheets: {
        appendUsageRow: async (record) => {
          records.push(record)
          return 9
        },
        updateCostCell: vi.fn(async () => undefined)
      },
      getCurrentUser: () => ({ email: 't2i@example.com', name: 'TextToImage' })
    })

    logger.recordTextToImageGenerated({
      endpointId: 'fal-ai/flux/schnell',
      sourceFileName: 'text2img_1700000000000_001.png',
      costUsd: 0.003,
      costIsEstimated: true,
      status: 'completed'
    })

    await vi.waitFor(() => expect(records).toHaveLength(1))
    expect(records[0]).toMatchObject({
      userEmail: 't2i@example.com',
      userName: 'TextToImage',
      eventType: 'image_generated',
      sourceFileName: 'text2img_1700000000000_001.png',
      endpointId: 'fal-ai/flux/schnell',
      imageCount: 1,
      costUsd: 0.003,
      costCurrency: 'USD',
      costIsEstimated: true,
      status: 'completed'
    })
  })
})
