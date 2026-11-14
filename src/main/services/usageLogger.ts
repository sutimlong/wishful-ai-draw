import { BatchItem, GenerationConfig, UsageCostInfo, UsageRecord } from '../../shared/types'

/** 使用記錄事件名稱：正式生成 */
export const USAGE_EVENT_IMAGE_GENERATED = 'image_generated'
/** 使用記錄事件名稱：模擬模式（不產生 fal.ai 費用） */
export const USAGE_EVENT_IMAGE_GENERATED_SIM = 'image_generated_SIM'
/** 使用記錄事件名稱：AI 優化提示詞（DeepSeek） */
export const USAGE_EVENT_PROMPT_OPTIMIZATION = 'Prompt word_optimization'

/** `recordImageGenerated` 的額外選項 */
export interface RecordImageGeneratedOptions {
  /** 模擬模式：事件名稱改為 `image_generated_SIM`，且不寫入花費欄位 */
  isSimulation?: boolean
}

/** `recordPromptOptimization` 的選項 */
export interface RecordPromptOptimizationOptions {
  /** 使用的模型名稱，例如 `deepseek-chat` */
  model: string
  /** 事件狀態，預設 `success` */
  status?: string
}

/** 寫入 Google 試算表的介面（由 googleSheetsService 實作） */
export interface UsageSheetsAdapter {
  /** 追加一列使用記錄，成功時回傳該列在試算表中的列號（1-based） */
  appendUsageRow: (record: UsageRecord) => Promise<number | null>
  /** 依列號回填花費額度與費用類型 */
  updateCostCell: (rowNumber: number, cost: UsageCostInfo) => Promise<void>
}

export interface UsageLoggerDeps {
  /** 試算表寫入器（未設定時代表雲端記錄停用） */
  sheets?: UsageSheetsAdapter
  /** 取得目前登入的 Google 使用者（未登入時回傳 null） */
  getCurrentUser: () => { email: string; name: string } | null
}

interface PendingEntry {
  /** 該列在試算表中的列號（追加完成後才有值） */
  rowNumber?: number
  /** 已查得的費用（可能比追加完成更早到） */
  cost?: UsageCostInfo
  /** 費用是否已寫入（避免重複更新） */
  costWritten?: boolean
}

/**
 * 把提示詞壓成單行：試算表每列只有一個儲存格放提示詞，
 * 保留文字內容但把換行與連續空白換成單一空格，避免列高爆掉。
 */
function toSingleLine(text: string): string {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 使用記錄器：
 * - 每張圖片「生成完成」時追加一列到 Google 雲端試算表。
 * - 每次 AI 優化提示詞成功時追加一列（事件 `Prompt word_optimization`）。
 * - 費用（額度）以非阻塞方式查詢，查得後回填同一列，避免拆成兩列。
 *
 * 此類別刻意不直接 import Electron，方便單元測試以 mock adapter 驗證流程。
 */
export class UsageLogger {
  private deps: UsageLoggerDeps
  private pending = new Map<string, PendingEntry>()

  constructor(deps: UsageLoggerDeps) {
    this.deps = deps
  }

  /** 圖片生成完成時呼叫：追加一列記錄（模擬模式為「image_generated_SIM」） */
  public recordImageGenerated(
    item: BatchItem,
    config: GenerationConfig,
    options: RecordImageGeneratedOptions = {}
  ): void {
    const sheets = this.deps.sheets
    if (!sheets) return
    const user = this.deps.getCurrentUser()
    if (!user) return

    const isSimulation = options.isSimulation === true
    // 模擬模式不會產生 fal.ai 費用，花費欄位一律留空
    const costFields: Pick<UsageRecord, 'costUsd' | 'costCurrency' | 'costIsEstimated'> = isSimulation
      ? {}
      : {
          costUsd: item.apiCostUsd,
          costCurrency: item.apiCostCurrency,
          costIsEstimated: item.apiCostIsEstimated
        }

    const record: UsageRecord = {
      timestamp: item.completedAt ?? Date.now(),
      userEmail: user.email,
      userName: user.name,
      eventType: isSimulation ? USAGE_EVENT_IMAGE_GENERATED_SIM : USAGE_EVENT_IMAGE_GENERATED,
      sourceFileName: item.sourceFileName,
      endpointId: config.endpointId,
      imageCount: 1,
      ...costFields,
      status: item.status
    }

    // 沿用既有 entry（費用可能已先到）
    const entry: PendingEntry = this.pending.get(item.id) ?? {}
    this.pending.set(item.id, entry)

    void sheets
      .appendUsageRow(record)
      .then((rowNumber) => {
        if (rowNumber === null) {
          this.pending.delete(item.id)
          return undefined
        }
        entry.rowNumber = rowNumber
        if (entry.cost && !entry.costWritten) {
          entry.costWritten = true
          return sheets.updateCostCell(rowNumber, entry.cost).finally(() => {
            this.pending.delete(item.id)
          })
        }
        return undefined
      })
      .catch((err) => {
        console.error('寫入 Google 使用記錄失敗：', err)
      })
  }

  /**
   * AI 優化提示詞成功時呼叫：追加一列記錄（事件 `Prompt word_optimization`）。
   *
   * 提示詞優化沒有圖片檔名，因此：
   * - E 欄（圖片檔名）放使用者送出的原始提示詞（換行／多餘空白壓成單行）
   * - F 欄（模型）放使用的模型名稱（例如 `deepseek-chat`）
   * - G 欄（產生張數）與 H、I 欄（花費）留空
   * - J 欄（狀態）預設 `success`
   */
  public recordPromptOptimization(
    originalPrompt: string,
    options: RecordPromptOptimizationOptions
  ): void {
    const sheets = this.deps.sheets
    if (!sheets) return
    const user = this.deps.getCurrentUser()
    if (!user) return

    const record: UsageRecord = {
      timestamp: Date.now(),
      userEmail: user.email,
      userName: user.name,
      eventType: USAGE_EVENT_PROMPT_OPTIMIZATION,
      sourceFileName: toSingleLine(originalPrompt),
      endpointId: options.model,
      status: options.status ?? 'success'
    }

    void sheets
      .appendUsageRow(record)
      .catch((err) => {
        console.error('寫入 Google 提示詞優化記錄失敗：', err)
      })
  }

  /** 文字生成圖片完成時呼叫：每張成功圖片追加一列（事件 `image_generated`） */
  public recordTextToImageGenerated(input: {
    endpointId: string
    sourceFileName: string
    costUsd?: number
    costIsEstimated?: boolean
    status?: string
  }): void {
    const sheets = this.deps.sheets
    if (!sheets) return
    const user = this.deps.getCurrentUser()
    if (!user) return

    const record: UsageRecord = {
      timestamp: Date.now(),
      userEmail: user.email,
      userName: user.name,
      eventType: USAGE_EVENT_IMAGE_GENERATED,
      sourceFileName: input.sourceFileName,
      endpointId: input.endpointId,
      imageCount: 1,
      costUsd: input.costUsd,
      costCurrency: typeof input.costUsd === 'number' ? 'USD' : undefined,
      costIsEstimated: input.costIsEstimated,
      status: input.status ?? 'completed'
    }

    void sheets
      .appendUsageRow(record)
      .catch((err) => {
        console.error('寫入 Google 文字生成圖片記錄失敗：', err)
      })
  }

  /** 費用查詢完成時呼叫：回填該圖片對應列的花費額度 */
  public recordCostResolved(itemId: string, cost: UsageCostInfo): void {
    const sheets = this.deps.sheets
    if (!sheets) return

    const entry: PendingEntry = this.pending.get(itemId) ?? {}

    // 同一張圖片只採用第一次查得的費用（重複回報時忽略，避免覆寫已寫入的數值）
    if (entry.cost) return

    this.pending.set(itemId, entry)
    entry.cost = cost

    if (entry.rowNumber !== undefined && !entry.costWritten) {
      entry.costWritten = true
      void sheets
        .updateCostCell(entry.rowNumber, cost)
        .catch((err) => {
          console.error('回填 Google 使用記錄費用失敗：', err)
        })
        .finally(() => {
          this.pending.delete(itemId)
        })
    }
  }

  /** 清除暫存狀態（測試用） */
  public reset(): void {
    this.pending.clear()
  }
}
