import { google } from 'googleapis'
import { loadGoogleCredentials } from './googleConfig'
import {
  describeSerialSheetError,
  describeSerialWriteError,
  fetchSerialKeysFromSheets,
  recordSerialLoginToSheets,
  resolveSerialSheetSettings,
  SerialKeyError,
  type SerialSheetSettings,
  type SheetsReader
} from './serialSheet'
import { formatTaiwanTime } from './taiwanTime'

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
/** 單次 Sheets API 請求逾時，避免網路異常時登入畫面一直卡在驗證中 */
const SHEETS_TIMEOUT_MS = 15 * 1000
/** 序號清單快取時間；登入時會強制重讀，這裡主要用於還原工作階段 */
const SERIAL_CACHE_TTL_MS = 60 * 1000

/** 判斷設定值是否仍為範例佔位內容（避免直接拿範例憑證去呼叫 Google API） */
function isPlaceholder(value?: string): boolean {
  if (!value) return true
  return /^YOUR_|REPLACE_WITH_|YOUR_DESKTOP_APP_|YOUR_SPREADSHEET_ID|your-.*@your-project-id/i.test(
    value
  )
}

/**
 * 雲端序號驗證服務。
 *
 * 以 Google Service Account 讀取指定試算表（預設「工作表二」）的序號欄，
 * 供序號登入時比對。成功結果會短暫快取，避免短時間內重複請求 Sheets API；
 * 讀取失敗不快取，使用者修正設定或網路後可立即重試。
 */
export class SerialKeyService {
  private cache: { keys: string[]; fetchedAt: number } | null = null
  private inFlight: Promise<string[]> | null = null
  private sheets: SheetsReader | null = null

  /** 清除快取與已建立的客戶端（例如管理員更新序號清單後想立即重讀） */
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
      throw new SerialKeyError(
        '尚未完成 Google Service Account 設定，無法線上驗證序號（請參考 resources/GOOGLE_SETUP.md）。'
      )
    }
    if (
      isPlaceholder(serviceAccount.client_email) ||
      isPlaceholder(serviceAccount.private_key)
    ) {
      throw new SerialKeyError(
        'Google Service Account 憑證仍是範例值，無法線上驗證序號。' +
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

  private async load(): Promise<string[]> {
    const cfg = loadGoogleCredentials()
    const settings: SerialSheetSettings = resolveSerialSheetSettings(cfg)

    if (!settings.spreadsheetId || isPlaceholder(settings.spreadsheetId)) {
      throw new SerialKeyError('尚未設定序號試算表 ID（serialSheet.spreadsheetId）。')
    }

    const sheets = this.ensureSheets()
    try {
      return await fetchSerialKeysFromSheets(sheets, settings)
    } catch (err) {
      if (err instanceof SerialKeyError) throw err
      throw new SerialKeyError(describeSerialSheetError(err))
    }
  }

  /**
   * 取得目前有效的序號清單。
   * @param force 為 true 時略過快取，強制重新向雲端讀取（登入時使用）。
   */
  public async getSerialKeys(force = false): Promise<string[]> {
    if (!force && this.cache && Date.now() - this.cache.fetchedAt < SERIAL_CACHE_TTL_MS) {
      return this.cache.keys
    }

    if (!this.inFlight) {
      this.inFlight = this.load()
    }

    try {
      const keys = await this.inFlight
      this.cache = { keys, fetchedAt: Date.now() }
      return keys
    } finally {
      this.inFlight = null
    }
  }

  /**
   * 回填序號登入者的名字、Email 與登入時間到該序號所在列（B～D 欄）。
   *
   * 採 best-effort：失敗只記錄警告，不影響登入結果；
   * 每次登入都會覆寫，因此 D 欄會是最後一次登入時間。
   */
  public async recordSerialLogin(
    serial: string,
    name: string,
    email: string,
    timestamp = Date.now()
  ): Promise<void> {
    try {
      const cfg = loadGoogleCredentials()
      const settings: SerialSheetSettings = resolveSerialSheetSettings(cfg)
      if (!settings.spreadsheetId || isPlaceholder(settings.spreadsheetId)) return

      const sheets = this.ensureSheets()
      const written = await recordSerialLoginToSheets(sheets, settings, {
        serial,
        name,
        email,
        loginTime: formatTaiwanTime(timestamp)
      })
      if (!written) {
        console.warn('回填序號登入資料略過：序號不在試算表清單中', serial)
      }
    } catch (err) {
      const message = describeSerialWriteError(err)
      console.warn(message, err)
    }
  }
}

export const serialKeyService = new SerialKeyService()
