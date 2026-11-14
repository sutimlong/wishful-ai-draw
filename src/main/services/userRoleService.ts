import { google } from 'googleapis'
import { loadGoogleCredentials } from './googleConfig'
import {
  normalizeEmail,
  resolveAllowedAccountsSettings,
  resolveAllowedSheetTitle
} from './allowedAccounts'
import type { SheetsReader } from './serialSheet'

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
/** 單次 Sheets API 請求逾時，避免登入流程卡住 */
const SHEETS_TIMEOUT_MS = 15 * 1000
/** 身份清單快取時間；登入時會強制重讀 */
const ROLE_CACHE_TTL_MS = 60 * 1000

/** 身份所在的欄位（工作表3 的 B 欄） */
export const ROLE_COLUMN = 'B'

export class UserRoleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserRoleError'
  }
}

/**
 * 從 `values.get` 回傳的二維陣列擷取「Email → 身份」對照表。
 * A 欄為 Email、B 欄為身份（工作表3）。
 */
export function extractRoles(
  values: readonly (readonly unknown[])[] | undefined | null,
  hasHeader: boolean
): Map<string, string> {
  const roles = new Map<string, string>()
  if (!values || values.length === 0) return roles

  const rows = hasHeader ? values.slice(1) : values
  for (const row of rows) {
    if (!Array.isArray(row)) continue
    const email = normalizeEmail(String(row[0] ?? ''))
    if (!email) continue
    const role = String(row[1] ?? '').trim()
    if (role) roles.set(email, role)
  }
  return roles
}

/** 組出 A:B 的 A1 標記範圍（工作表名稱加單引號，避免空白或特殊字元出錯） */
function toRoleRange(sheetTitle: string): string {
  return `'${sheetTitle.replace(/'/g, "''")}'!A:${ROLE_COLUMN}`
}

/** 判斷設定值是否仍為範例佔位內容 */
function isPlaceholder(value?: string): boolean {
  if (!value) return true
  return /^YOUR_|REPLACE_WITH_|YOUR_DESKTOP_APP_|YOUR_SPREADSHEET_ID|your-.*@your-project-id/i.test(
    value
  )
}

/**
 * 使用者身份服務。
 *
 * 以 Google Service Account 讀取「工作表3」的 A、B 欄（Email、身份），
 * 讓登入後的使用者可以顯示自己的身份（管理員 / 一般使用者）。
 * 讀取失敗時安全地回傳 undefined，不影響登入流程。
 */
export class UserRoleService {
  private cache: { roles: Map<string, string>; fetchedAt: number } | null = null
  private inFlight: Promise<Map<string, string>> | null = null
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
      throw new UserRoleError('尚未設定 Google Service Account，無法讀取使用者身份。')
    }
    if (isPlaceholder(serviceAccount.client_email) || isPlaceholder(serviceAccount.private_key)) {
      throw new UserRoleError('Google Service Account 憑證仍是範例值，無法讀取使用者身份。')
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

  private async load(): Promise<Map<string, string>> {
    const settings = resolveAllowedAccountsSettings(loadGoogleCredentials())
    if (!settings.spreadsheetId || isPlaceholder(settings.spreadsheetId)) {
      throw new UserRoleError('尚未設定身份試算表 ID。')
    }

    const sheets = this.ensureSheets()
    const title = await resolveAllowedSheetTitle(sheets, settings)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: settings.spreadsheetId,
      range: toRoleRange(title)
    })
    return extractRoles(response.data.values, settings.hasHeader)
  }

  /** 取得完整「Email → 身份」對照表（`force` 為 true 時略過快取） */
  public async getRoles(force = false): Promise<Map<string, string>> {
    if (!force && this.cache && Date.now() - this.cache.fetchedAt < ROLE_CACHE_TTL_MS) {
      return this.cache.roles
    }

    if (!this.inFlight) {
      this.inFlight = this.load()
    }

    try {
      const roles = await this.inFlight
      this.cache = { roles, fetchedAt: Date.now() }
      return roles
    } finally {
      this.inFlight = null
    }
  }

  /**
   * 依 Email 取得身份；讀取失敗或查無資料時回傳 undefined。
   * 登入流程使用 `force = true`，確保管理員更新試算表後可立即生效。
   */
  public async getRole(email: string, force = false): Promise<string | undefined> {
    const normalized = normalizeEmail(email)
    if (!normalized) return undefined
    try {
      const roles = await this.getRoles(force)
      return roles.get(normalized)
    } catch {
      return undefined
    }
  }
}

export const userRoleService = new UserRoleService()
