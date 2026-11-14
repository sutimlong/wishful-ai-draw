import { google } from 'googleapis'
import type { GoogleCredentialsConfig } from './googleConfig'
import { loadGoogleCredentials } from './googleConfig'
import { buildColumnRange, type SheetsReader } from './serialSheet'

/** 預設授權帳號試算表（與使用記錄／序號清單同一份試算表） */
export const DEFAULT_ALLOWED_SPREADSHEET_ID = '1Gy8ICS8Cz4YEJVnwWehvcclvLsuSYzfbceiYUlhRKgw'
/** 預設工作表：工作表3（Google Sheet 網址中的 gid） */
export const DEFAULT_ALLOWED_SHEET_ID = 740235806
/** 預設授權 Gmail 欄位 */
export const DEFAULT_ALLOWED_COLUMN = 'A'

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
/** 單次 Sheets API 請求逾時，避免登入畫面卡住 */
const SHEETS_TIMEOUT_MS = 15 * 1000
/** 授權清單快取時間；登入時會強制重讀 */
const ALLOWED_CACHE_TTL_MS = 60 * 1000

/** 授權 Gmail 清單的讀取設定（由 `google-credentials.json` 的 `allowedAccounts` 解析而來） */
export interface AllowedAccountsSettings {
  spreadsheetId: string
  /** 工作表 gid；未填時使用預設工作表3 */
  sheetId?: number
  /** 工作表名稱；填寫後優先使用（不再以 gid 對照） */
  sheetTitle?: string
  /** 授權 Gmail 所在欄（A、B…） */
  column: string
  /** 第 1 列是否為標題列（true 時跳過不參與比對） */
  hasHeader: boolean
}

/** 讀取授權清單過程中的可預期錯誤（訊息可直接顯示給使用者） */
export class AllowedAccountsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AllowedAccountsError'
  }
}

/** Email 正規化：去除前後空白並轉小寫（Email 不分大小寫） */
export function normalizeEmail(raw: string): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
}

/** 只保留欄名字母並轉大寫；無效時退回預設 A 欄 */
function normalizeColumn(column?: string): string {
  const cleaned = (column ?? '').replace(/[^A-Za-z]/g, '').toUpperCase()
  return cleaned || DEFAULT_ALLOWED_COLUMN
}

/** 由憑證設定解析出實際的授權帳號試算表目標 */
export function resolveAllowedAccountsSettings(
  cfg: GoogleCredentialsConfig | null
): AllowedAccountsSettings {
  const allowed = cfg?.allowedAccounts
  const spreadsheetId =
    allowed?.spreadsheetId?.trim() || cfg?.spreadsheetId?.trim() || DEFAULT_ALLOWED_SPREADSHEET_ID

  return {
    spreadsheetId,
    sheetId: allowed?.sheetId ?? DEFAULT_ALLOWED_SHEET_ID,
    sheetTitle: allowed?.sheetTitle?.trim() || undefined,
    column: normalizeColumn(allowed?.column),
    hasHeader: allowed?.hasHeader ?? true
  }
}

/** 判斷 Email 是否在授權清單內（忽略大小寫與前後空白） */
export function isEmailAllowedInList(email: string, allowed: Iterable<string>): boolean {
  const normalized = normalizeEmail(email)
  if (!normalized) return false
  for (const item of allowed) {
    if (normalizeEmail(item) === normalized) return true
  }
  return false
}

/** 從 `values.get` 回傳的二維陣列擷取授權 Gmail（只取第一欄、去重、轉小寫） */
export function extractAllowedEmails(
  values: readonly (readonly unknown[])[] | undefined | null,
  hasHeader: boolean
): string[] {
  if (!values || values.length === 0) return []

  const rows = hasHeader ? values.slice(1) : values
  const emails = new Set<string>()
  for (const row of rows) {
    if (!Array.isArray(row)) continue
    const cell = row[0]
    if (cell === undefined || cell === null) continue
    const normalized = normalizeEmail(String(cell))
    if (normalized) emails.add(normalized)
  }
  return [...emails]
}

/** 依 `sheetTitle` 或 `sheetId` 找出實際的工作表名稱 */
export async function resolveAllowedSheetTitle(
  sheets: SheetsReader,
  settings: AllowedAccountsSettings
): Promise<string> {
  if (settings.sheetTitle) return settings.sheetTitle

  const meta = await sheets.spreadsheets.get({
    spreadsheetId: settings.spreadsheetId,
    fields: 'sheets(properties(title,sheetId))'
  })
  const sheetsMeta = meta.data.sheets ?? []
  const matched =
    settings.sheetId !== undefined
      ? sheetsMeta.find((sheet) => sheet.properties?.sheetId === settings.sheetId)
      : sheetsMeta[0]

  const title = matched?.properties?.title?.trim()
  if (!title) {
    throw new AllowedAccountsError(
      '找不到授權帳號工作表，請確認 allowedAccounts.sheetId（或 sheetTitle）設定是否正確。'
    )
  }
  return title
}

/** 讀取授權 Gmail 清單（透過注入的 Sheets 客戶端，方便測試） */
export async function fetchAllowedEmails(
  sheets: SheetsReader,
  settings: AllowedAccountsSettings
): Promise<string[]> {
  const title = await resolveAllowedSheetTitle(sheets, settings)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: settings.spreadsheetId,
    range: buildColumnRange(title, settings.column)
  })
  return extractAllowedEmails(response.data.values, settings.hasHeader)
}

/** 將 Sheets API 錯誤轉成可讀訊息 */
export function describeAllowedAccountsError(err: unknown): string {
  const status = (err as { response?: { status?: number } })?.response?.status
  const code = (err as { code?: number | string })?.code
  const detail =
    (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
      ?.message || (err instanceof Error ? err.message : String(err))

  if (status === 403 || /permission|forbidden/i.test(detail)) {
    return '無法驗證帳號授權：服務帳戶沒有授權清單試算表權限，請分享給服務帳戶（至少「檢視者」）。'
  }
  if (status === 404 || /not found/i.test(detail)) {
    return '無法驗證帳號授權：找不到授權帳號試算表或工作表，請確認 allowedAccounts 設定。'
  }
  if (status === 400) {
    return `無法驗證帳號授權：讀取範圍不正確（${detail}）。`
  }
  if (
    code === 'ENOTFOUND' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'EAI_AGAIN' ||
    /fetch failed|network|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/i.test(detail)
  ) {
    return '無法連線至帳號授權服務，請確認網路後重試。'
  }
  return `無法驗證帳號授權：${detail}`
}

/** 判斷設定值是否仍為範例佔位內容（避免直接拿範例憑證去呼叫 Google API） */
function isPlaceholder(value?: string): boolean {
  if (!value) return true
  return /^YOUR_|REPLACE_WITH_|YOUR_DESKTOP_APP_|YOUR_SPREADSHEET_ID|your-.*@your-project-id/i.test(
    value
  )
}

/**
 * 授權 Gmail 帳號服務（Google 登入防護網）。
 *
 * 以 Google Service Account 讀取指定試算表（預設「工作表3」）的授權 Gmail 欄位，
 * Google 登入成功後比對 Email 是否在清單內，不在清單者一律拒絕登入。
 * 成功結果會短暫快取，避免短時間內重複請求 Sheets API；讀取失敗則不快取。
 */
export class AllowedAccountsService {
  private cache: { emails: Set<string>; fetchedAt: number } | null = null
  private inFlight: Promise<Set<string>> | null = null
  private sheets: SheetsReader | null = null

  /** 清除快取與已建立的客戶端（登入前或管理員更新清單後可強制重讀） */
  public resetCache(): void {
    this.cache = null
    this.inFlight = null
    this.sheets = null
  }

  private ensureSheets(): SheetsReader {
    if (this.sheets) return this.sheets

    const cfg = loadGoogleCredentials()
    const serviceAccount = cfg?.serviceAccount
    if (!serviceAccount?.client_email || !serviceAccount.private_key) {
      throw new AllowedAccountsError(
        '尚未完成 Google Service Account 設定，無法驗證帳號授權（請參考 resources/GOOGLE_SETUP.md）。'
      )
    }
    if (isPlaceholder(serviceAccount.client_email) || isPlaceholder(serviceAccount.private_key)) {
      throw new AllowedAccountsError(
        'Google Service Account 憑證仍是範例值，無法驗證帳號授權。' +
          '請執行 node scripts/import-service-account.cjs <金鑰.json> 匯入真實金鑰' +
          '（詳見 resources/GOOGLE_SETUP.md）。'
      )
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key
      },
      scopes: [SHEETS_SCOPE]
    })

    this.sheets = google.sheets({
      version: 'v4',
      auth,
      timeout: SHEETS_TIMEOUT_MS
    }) as unknown as SheetsReader
    return this.sheets
  }

  private async load(): Promise<Set<string>> {
    const cfg = loadGoogleCredentials()
    const settings = resolveAllowedAccountsSettings(cfg)

    if (!settings.spreadsheetId || isPlaceholder(settings.spreadsheetId)) {
      throw new AllowedAccountsError('尚未設定授權帳號試算表 ID（allowedAccounts.spreadsheetId）。')
    }

    const sheets = this.ensureSheets()
    try {
      return new Set(await fetchAllowedEmails(sheets, settings))
    } catch (err) {
      if (err instanceof AllowedAccountsError) throw err
      throw new AllowedAccountsError(describeAllowedAccountsError(err))
    }
  }

  /** 取得授權 Gmail 清單；`force` 為 true 時略過快取（登入時使用） */
  public async getAllowedEmails(force = false): Promise<Set<string>> {
    if (!force && this.cache && Date.now() - this.cache.fetchedAt < ALLOWED_CACHE_TTL_MS) {
      return this.cache.emails
    }

    if (!this.inFlight) {
      this.inFlight = this.load()
    }

    try {
      const emails = await this.inFlight
      this.cache = { emails, fetchedAt: Date.now() }
      return emails
    } finally {
      this.inFlight = null
    }
  }

  /**
   * 判斷 Email 是否在授權清單內。
   * 讀取失敗時會丟出 `AllowedAccountsError`（呼叫端需自行決定要阻擋或保留登入）。
   */
  public async isEmailAllowed(email: string, force = false): Promise<boolean> {
    const emails = await this.getAllowedEmails(force)
    return isEmailAllowedInList(email, emails)
  }
}

export const allowedAccountsService = new AllowedAccountsService()
