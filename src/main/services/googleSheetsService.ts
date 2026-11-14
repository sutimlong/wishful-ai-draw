import { google } from 'googleapis'
import type { drive_v3, sheets_v4 } from 'googleapis'
import { loadGoogleCredentials } from './googleConfig'
import { parseRowNumber } from './sheetRange'
import { formatTaiwanTime } from './taiwanTime'
import { UsageCostInfo, UsageRecord } from '../../shared/types'
import type { UsageSheetsAdapter } from './usageLogger'

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive'
const DEFAULT_SPREADSHEET_NAME = 'Wishful AI Draw 使用記錄'
const DEFAULT_SHEET_TITLE = 'Sheet1'

/** 試算表欄位順序（A ~ J） */
const USAGE_HEADERS = [
  '時間',
  '使用者 Email',
  '使用者名稱',
  '事件',
  '圖片檔名',
  '模型',
  '產生張數',
  '花費額度 (USD)',
  '費用類型',
  '狀態'
] as const

function formatCostValue(costUsd?: number): string {
  return typeof costUsd === 'number' && Number.isFinite(costUsd) ? costUsd.toFixed(6) : ''
}

function formatCostType(isEstimated?: boolean): string {
  if (isEstimated === undefined) return ''
  return isEstimated ? '預估' : '實際'
}

/** 產生張數：提示詞優化等非圖片事件沒有張數，留空避免誤記為 0 張 */
function formatImageCount(count?: number): string {
  return typeof count === 'number' && Number.isFinite(count) ? String(count) : ''
}

/** 組出 A1 標記範圍（工作表名稱一律加單引號，避免空白或特殊字元出錯） */
function toSheetRange(sheetTitle: string, range: string): string {
  return `'${sheetTitle.replace(/'/g, "''")}'!${range}`
}

/**
 * 將使用記錄轉為一列（A ~ J）；時間欄一律以台灣時間（UTC+8）寫入。
 * 匯出以便單元測試驗證欄位對齊（提示詞優化事件會留空張數與花費欄）。
 */
export function toRowValues(record: UsageRecord): string[] {
  return [
    formatTaiwanTime(record.timestamp),
    record.userEmail,
    record.userName,
    record.eventType,
    record.sourceFileName,
    record.endpointId,
    formatImageCount(record.imageCount),
    formatCostValue(record.costUsd),
    formatCostType(record.costIsEstimated),
    record.status
  ]
}

/**
 * 以 Google Service Account 將使用記錄寫入開發者雲端硬碟中的試算表。
 *
 * - 第一次寫入時會自動在 `driveFolderId`（需已分享給 Service Account）內
 *   尋找或建立試算表，並補上標題列。
 * - 所有寫入請求會序列化（排隊），避免並發 append 造成列號錯亂。
 * - 未設定憑證時所有方法皆安全地 no-op，不影響圖片生成。
 */
export class GoogleSheetsService implements UsageSheetsAdapter {
  private sheetsClient: sheets_v4.Sheets | null = null
  private driveClient: drive_v3.Drive | null = null
  private spreadsheetId: string | null = null
  private sheetTitle = DEFAULT_SHEET_TITLE
  private queueChain: Promise<void> = Promise.resolve()

  /** 是否有可用的 Google 憑證設定 */
  public isConfigured(): boolean {
    const cfg = loadGoogleCredentials()
    return Boolean(cfg?.serviceAccount?.client_email && cfg?.serviceAccount?.private_key)
  }

  /** 序列化任務，確保試算表寫入依序執行 */
  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queueChain.then(task, task)
    this.queueChain = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  private async ensureClients(): Promise<void> {
    if (this.sheetsClient && this.driveClient && this.spreadsheetId) return

    const cfg = loadGoogleCredentials()
    const serviceAccount = cfg?.serviceAccount
    if (!cfg || !serviceAccount?.client_email || !serviceAccount.private_key) {
      throw new Error('尚未設定 Google Service Account 憑證')
    }
    if (!cfg.driveFolderId && !cfg.spreadsheetId) {
      throw new Error('尚未設定 Google 試算表 ID（spreadsheetId）或雲端硬碟資料夾 ID（driveFolderId）')
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key
      },
      scopes: [SHEETS_SCOPE, DRIVE_SCOPE]
    })

    this.sheetsClient = google.sheets({ version: 'v4', auth })
    this.driveClient = google.drive({ version: 'v3', auth })

    await this.ensureSpreadsheet(cfg.driveFolderId, cfg.spreadsheetName, cfg.spreadsheetId)
  }

  private async ensureSpreadsheet(
    folderId?: string,
    spreadsheetName?: string,
    configuredSpreadsheetId?: string
  ): Promise<void> {
    const drive = this.driveClient
    const sheets = this.sheetsClient
    if (!drive || !sheets) return

    if (configuredSpreadsheetId) {
      // 使用開發者手動建立並分享給 Service Account 的試算表
      this.spreadsheetId = configuredSpreadsheetId
    } else {
      await this.findOrCreateSpreadsheet(drive, folderId, spreadsheetName)
    }

    const spreadsheetId = this.spreadsheetId
    if (!spreadsheetId) {
      throw new Error('無法建立或找到 Google 使用記錄試算表')
    }

    // 取得第一個工作表的標題（預設為 Sheet1）
    try {
      const meta = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets(properties(title))'
      })
      const title = meta.data.sheets?.[0]?.properties?.title
      if (title) this.sheetTitle = title
    } catch {
      this.sheetTitle = DEFAULT_SHEET_TITLE
    }

    await this.ensureHeaderRow()
  }

  /** 在指定資料夾內尋找或建立使用記錄試算表 */
  private async findOrCreateSpreadsheet(
    drive: drive_v3.Drive,
    folderId: string | undefined,
    spreadsheetName?: string
  ): Promise<void> {
    if (!folderId) {
      throw new Error('尚未設定 Google 雲端硬碟資料夾 ID（driveFolderId）')
    }

    const name = spreadsheetName?.trim() || DEFAULT_SPREADSHEET_NAME
    const escapedName = name.replace(/'/g, "\\'")
    const query =
      `name = '${escapedName}' and ` +
      `mimeType = 'application/vnd.google-apps.spreadsheet' and ` +
      `'${folderId}' in parents and trashed = false`

    let spreadsheetId: string | undefined
    try {
      const list = await drive.files.list({
        q: query,
        fields: 'files(id,name)',
        pageSize: 1,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      })
      spreadsheetId = list.data.files?.[0]?.id ?? undefined
    } catch (err) {
      console.error('搜尋 Google 使用記錄試算表失敗：', err)
    }

    if (!spreadsheetId) {
      const created = await drive.files.create({
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.spreadsheet',
          parents: [folderId]
        },
        fields: 'id',
        supportsAllDrives: true
      })
      spreadsheetId = created.data.id ?? undefined
    }

    if (!spreadsheetId) {
      throw new Error('無法建立或找到 Google 使用記錄試算表')
    }

    this.spreadsheetId = spreadsheetId
  }

  private async ensureHeaderRow(): Promise<void> {
    const sheets = this.sheetsClient
    const spreadsheetId = this.spreadsheetId
    if (!sheets || !spreadsheetId) return

    const headerRange = toSheetRange(this.sheetTitle, 'A1:J1')
    try {
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: headerRange
      })
      const firstRow = existing.data.values?.[0]
      if (firstRow && firstRow.length > 0) return

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: headerRange,
        valueInputOption: 'RAW',
        requestBody: { values: [USAGE_HEADERS.slice()] }
      })
    } catch (err) {
      console.error('建立 Google 使用記錄標題列失敗：', err)
    }
  }

  /** 追加一列使用記錄，成功時回傳列號 */
  public appendUsageRow(record: UsageRecord): Promise<number | null> {
    return this.enqueue(async () => {
      try {
        await this.ensureClients()
        const sheets = this.sheetsClient
        const spreadsheetId = this.spreadsheetId
        if (!sheets || !spreadsheetId) return null

        const response = await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: toSheetRange(this.sheetTitle, 'A:J'),
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { values: [toRowValues(record)] }
        })

        return parseRowNumber(response.data.updates?.updatedRange)
      } catch (err) {
        console.error('追加 Google 使用記錄失敗：', err)
        return null
      }
    })
  }

  /** 回填某一列的花費額度（H 欄）與費用類型（I 欄） */
  public updateCostCell(rowNumber: number, cost: UsageCostInfo): Promise<void> {
    return this.enqueue(async () => {
      try {
        await this.ensureClients()
        const sheets = this.sheetsClient
        const spreadsheetId = this.spreadsheetId
        if (!sheets || !spreadsheetId) return

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: toSheetRange(this.sheetTitle, `H${rowNumber}:I${rowNumber}`),
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[formatCostValue(cost.costUsd), formatCostType(cost.isEstimated)]]
          }
        })
      } catch (err) {
        console.error('回填 Google 使用記錄費用失敗：', err)
      }
    })
  }
}

export const googleSheetsService = new GoogleSheetsService()
