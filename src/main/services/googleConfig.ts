import { app } from 'electron'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

/** 序號登入驗證用的 Google 試算表設定 */
export interface SerialSheetConfig {
  /** 序號試算表 ID；未填時退回使用 `spreadsheetId`，再退回內建預設值 */
  spreadsheetId?: string
  /** 工作表 gid（Google Sheet 網址中的 `gid=` 數字）；未填時預設工作表二 */
  sheetId?: number
  /** 工作表名稱；填寫後優先使用（可取代以 gid 對照） */
  sheetTitle?: string
  /** 序號所在欄（A、B…），預設 A */
  column?: string
  /** 第 1 列是否為標題列（true 時跳過不參與比對），預設 false */
  hasHeader?: boolean
}

/** 授權 Gmail 清單設定（Google 登入防護網）：只有清單內的帳號可以登入 */
export interface AllowedAccountsConfig {
  /** 授權清單試算表 ID；未填時退回使用 `spreadsheetId`，再退回內建預設值 */
  spreadsheetId?: string
  /** 工作表 gid（Google Sheet 網址中的 `gid=` 數字）；未填時預設工作表3 */
  sheetId?: number
  /** 工作表名稱；填寫後優先使用（可取代以 gid 對照） */
  sheetTitle?: string
  /** 授權 Gmail 所在欄（A、B…），預設 A */
  column?: string
  /** 第 1 列是否為標題列（true 時跳過不參與比對），預設 true */
  hasHeader?: boolean
}

/** Google Service Account 金鑰內容（由 GCP 下載的 JSON） */
export interface GoogleServiceAccountCredentials {
  type?: string
  project_id?: string
  private_key_id?: string
  private_key?: string
  client_email?: string
  client_id?: string
  [key: string]: unknown
}

/**
 * `resources/google-credentials.json` 的結構。
 *
 * - oauthClientId：Google Cloud「OAuth 用戶端 ID（Desktop app）」的 Client ID。
 *   使用者登入時使用（PKCE，不需 client secret）。
 * - oauthClientSecret：若你的 OAuth 用戶端需要 secret 才可交換 token，才需填寫。
 * - driveFolderId：你（開發者）雲端硬碟中「已分享給 Service Account（編輯者）」的資料夾 ID，
 *   使用記錄試算表會建立在此資料夾內。
 * - spreadsheetName：使用記錄試算表名稱（不存在時會自動建立）。
 * - serviceAccount：Google Service Account 金鑰 JSON（完整內容）。
 */
export interface GoogleCredentialsConfig {
  oauthClientId?: string
  oauthClientSecret?: string
  driveFolderId?: string
  /**
   * 既有的使用記錄試算表 ID（建議填寫）。
   * 若提供，App 會直接寫入此試算表；未提供時才會在 `driveFolderId` 內自動建立。
   * 建議由你本人手動建立試算表並分享給 Service Account（編輯者），
   * 以避免 Service Account 無儲存空間配額的限制。
   */
  spreadsheetId?: string
  spreadsheetName?: string
  /**
   * 序號登入驗證用的試算表。
   * 序號放在指定工作表的第一欄（預設 A 欄），登入時由 Service Account 線上讀取比對；
   * 未設定時使用內建的預設試算表（工作表二）。
   */
  serialSheet?: SerialSheetConfig
  /**
   * Google 帳號授權（登入防護網）設定。
   * 只有列在此試算表指定欄位的 Gmail 帳號才能以 Google 登入；
   * 未設定時使用內建預設（工作表3）。
   */
  allowedAccounts?: AllowedAccountsConfig
  serviceAccount?: GoogleServiceAccountCredentials
}

let cachedConfig: GoogleCredentialsConfig | null = null
let hasLoaded = false

/** 可能的憑證檔位置（開發環境與正式打包環境皆涵蓋） */
function getCredentialsPathCandidates(): string[] {
  const candidates: string[] = []
  const envPath = process.env['GOOGLE_CREDENTIALS_FILE']
  if (envPath) candidates.push(envPath)
  candidates.push(
    join(app.getAppPath(), 'resources/google-credentials.json'),
    join(__dirname, '../../resources/google-credentials.json')
  )

  // 正式打包時 resources/** 會被 asarUnpack 到 app.asar.unpacked
  const resourcesPath = process.resourcesPath
  if (resourcesPath) {
    candidates.push(
      join(resourcesPath, 'app.asar.unpacked/resources/google-credentials.json'),
      join(resourcesPath, 'google-credentials.json'),
      join(resourcesPath, 'resources/google-credentials.json')
    )
  }

  return candidates
}

/**
 * 讀取 Google 憑證設定。找不到或格式錯誤時回傳 null（App 仍可運作，僅停用雲端記錄）。
 * 結果會快取，避免每次記錄都讀檔。
 */
export function loadGoogleCredentials(): GoogleCredentialsConfig | null {
  if (hasLoaded) return cachedConfig
  hasLoaded = true

  for (const filePath of getCredentialsPathCandidates()) {
    try {
      if (!existsSync(filePath)) continue
      const parsed = JSON.parse(readFileSync(filePath, 'utf-8')) as GoogleCredentialsConfig
      cachedConfig = parsed
      return cachedConfig
    } catch (err) {
      console.error('讀取 Google 憑證設定失敗：', filePath, err)
    }
  }

  cachedConfig = null
  return cachedConfig
}

/** 測試或變更設定後可清除快取 */
export function resetGoogleCredentialsCache(): void {
  cachedConfig = null
  hasLoaded = false
}
