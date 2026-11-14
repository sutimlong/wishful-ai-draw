import type { GoogleCredentialsConfig } from './googleConfig'
import { normalizeSerial } from './serialAuth'

/** 預設序號試算表（與使用記錄分開，可依需求改由設定檔覆寫） */
export const DEFAULT_SERIAL_SPREADSHEET_ID = '1Gy8ICS8Cz4YEJVnwWehvcclvLsuSYzfbceiYUlhRKgw'
/** 預設工作表：工作表二（Google Sheet 網址中的 gid） */
export const DEFAULT_SERIAL_SHEET_ID = 1195700831
/** 預設序號欄位 */
export const DEFAULT_SERIAL_COLUMN = 'A'

/** 序號讀取設定（由 `google-credentials.json` 的 `serialSheet` 解析而來） */
export interface SerialSheetSettings {
  spreadsheetId: string
  /** 工作表 gid；未填時使用預設值 */
  sheetId?: number
  /** 工作表名稱；填寫後優先使用（不再以 gid 對照） */
  sheetTitle?: string
  /** 序號所在欄（A、B…） */
  column: string
  /** 第 1 列是否為標題列（true 時跳過不參與比對） */
  hasHeader: boolean
}

/**
 * 僅宣告會用到的 Sheets API 介面。
 * 以最小介面接收依賴，讓測試可注入假物件，不必真的呼叫 Google API。
 */
export interface SheetsReader {
  spreadsheets: {
    get(params: {
      spreadsheetId: string
      fields?: string
    }): Promise<{
      data: {
        sheets?: Array<{ properties?: { title?: string | null; sheetId?: number | null } }>
      }
    }>
    values: {
      get(params: { spreadsheetId: string; range: string }): Promise<{
        data: { values?: unknown[][] }
      }>
      /** 寫入指定範圍（回填序號登入者資料時使用） */
      update(params: {
        spreadsheetId: string
        range: string
        valueInputOption?: 'RAW' | 'USER_ENTERED'
        requestBody: { values: unknown[][] }
      }): Promise<unknown>
    }
  }
}

/** 序號驗證／讀取過程中的可預期錯誤（訊息可直接顯示給使用者） */
export class SerialKeyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SerialKeyError'
  }
}

/** 只保留欄名字母並轉大寫；無效時退回預設 A 欄 */
export function normalizeColumn(column?: string): string {
  const cleaned = (column ?? '').replace(/[^A-Za-z]/g, '').toUpperCase()
  return cleaned || DEFAULT_SERIAL_COLUMN
}

/** 由憑證設定解析出實際的序號試算表目標 */
export function resolveSerialSheetSettings(
  cfg: GoogleCredentialsConfig | null
): SerialSheetSettings {
  const serial = cfg?.serialSheet
  const spreadsheetId =
    serial?.spreadsheetId?.trim() || cfg?.spreadsheetId?.trim() || DEFAULT_SERIAL_SPREADSHEET_ID

  return {
    spreadsheetId,
    sheetId: serial?.sheetId ?? DEFAULT_SERIAL_SHEET_ID,
    sheetTitle: serial?.sheetTitle?.trim() || undefined,
    column: normalizeColumn(serial?.column),
    hasHeader: serial?.hasHeader ?? false
  }
}

/** 組出整欄的 A1 範圍（工作表名稱一律加單引號，避免空白或特殊字元出錯） */
export function buildColumnRange(title: string, column: string): string {
  const escaped = String(title).replace(/'/g, "''")
  const col = normalizeColumn(column)
  return `'${escaped}'!${col}:${col}`
}

/**
 * 從 `values.get` 回傳的二維陣列擷取序號。
 * 只取第一欄；序號會去除空白並轉大寫、重複者只保留一筆。
 */
export function extractSerialKeys(
  values: readonly (readonly unknown[])[] | undefined | null,
  hasHeader: boolean
): string[] {
  if (!values || values.length === 0) return []

  const rows = hasHeader ? values.slice(1) : values
  const keys = new Set<string>()
  for (const row of rows) {
    if (!Array.isArray(row)) continue
    const cell = row[0]
    if (cell === undefined || cell === null) continue
    const normalized = normalizeSerial(String(cell))
    if (normalized) keys.add(normalized)
  }
  return [...keys]
}

/** 依 `sheetTitle` 或 `sheetId` 找出實際的工作表名稱 */
export async function resolveSerialSheetTitle(
  sheets: SheetsReader,
  settings: SerialSheetSettings
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
    throw new SerialKeyError(
      '找不到序號工作表，請確認 serialSheet.sheetId（或 sheetTitle）設定是否正確。'
    )
  }
  return title
}

/** 讀取序號清單（透過注入的 Sheets 客戶端，方便測試） */
export async function fetchSerialKeysFromSheets(
  sheets: SheetsReader,
  settings: SerialSheetSettings
): Promise<string[]> {
  const title = await resolveSerialSheetTitle(sheets, settings)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: settings.spreadsheetId,
    range: buildColumnRange(title, settings.column)
  })
  return extractSerialKeys(response.data.values, settings.hasHeader)
}

/** 序號登入者資料回填的欄位：B＝名字、C＝Email、D＝登入時間 */
export const SERIAL_PROFILE_COLUMNS = { name: 'B', email: 'C', time: 'D' } as const

/**
 * 在序號欄資料中找出指定序號的列號（1-based）。
 * - `hasHeader` 為 true 時從第 2 列開始找
 * - 比對時忽略大小寫與空白（與 `normalizeSerial` 一致）
 * - 找不到時回傳 null
 */
export function findSerialRowNumber(
  values: readonly (readonly unknown[])[] | undefined | null,
  serial: string,
  hasHeader: boolean
): number | null {
  if (!values || values.length === 0) return null
  const target = normalizeSerial(serial)
  if (!target) return null

  for (let index = hasHeader ? 1 : 0; index < values.length; index += 1) {
    const row = values[index]
    if (!Array.isArray(row)) continue
    const cell = row[0]
    if (cell === undefined || cell === null) continue
    if (normalizeSerial(String(cell)) === target) return index + 1
  }
  return null
}

/** 組出回填登入資料的範圍（序號所在列的 B～D 欄） */
export function buildSerialProfileRange(title: string, rowNumber: number): string {
  const escaped = String(title).replace(/'/g, "''")
  const { name, time } = SERIAL_PROFILE_COLUMNS
  return `'${escaped}'!${name}${rowNumber}:${time}${rowNumber}`
}

/** 要回填到序號列的登入者資料 */
export interface SerialLoginProfile {
  serial: string
  name: string
  email: string
  /** 已格式化的登入時間（例如台灣時間 `YYYY-MM-DD HH:mm:ss`） */
  loginTime: string
}

/**
 * 將序號登入者的名字、Email、登入時間寫入序號所在列的 B～D 欄。
 * 每次登入都會覆寫；找不到序號時回傳 false 且不寫入任何資料。
 */
export async function recordSerialLoginToSheets(
  sheets: SheetsReader,
  settings: SerialSheetSettings,
  profile: SerialLoginProfile
): Promise<boolean> {
  const title = await resolveSerialSheetTitle(sheets, settings)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: settings.spreadsheetId,
    range: buildColumnRange(title, settings.column)
  })
  const rowNumber = findSerialRowNumber(response.data.values, profile.serial, settings.hasHeader)
  if (rowNumber === null) return false

  await sheets.spreadsheets.values.update({
    spreadsheetId: settings.spreadsheetId,
    range: buildSerialProfileRange(title, rowNumber),
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[profile.name, profile.email, profile.loginTime]] }
  })
  return true
}

/** 將 Sheets API 錯誤轉成可顯示給使用者的訊息 */
export function describeSerialSheetError(err: unknown): string {
  const status = (err as { response?: { status?: number } })?.response?.status
  const code = (err as { code?: number | string })?.code
  const detail =
    (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
      ?.message || (err instanceof Error ? err.message : String(err))

  if (status === 403 || /permission|forbidden/i.test(detail)) {
    return '序號驗證失敗：服務帳戶沒有試算表權限，請將序號試算表分享給服務帳戶（讀取需「檢視者」，回填登入資料需「編輯者」）。'
  }
  if (status === 404 || /not found/i.test(detail)) {
    return '序號驗證失敗：找不到序號試算表或工作表，請確認 serialSheet 設定。'
  }
  if (status === 400) {
    return `序號驗證失敗：讀取範圍不正確（${detail}）。`
  }
  if (
    code === 'ENOTFOUND' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'EAI_AGAIN' ||
    /fetch failed|network|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/i.test(detail)
  ) {
    return '無法連線至序號驗證服務，請確認網路後重試。'
  }
  return `序號驗證失敗：${detail}`
}

/** 將回填登入資料的錯誤轉成可讀訊息（僅用於 console 診斷） */
export function describeSerialWriteError(err: unknown): string {
  const status = (err as { response?: { status?: number } })?.response?.status
  const code = (err as { code?: number | string })?.code
  const detail =
    (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
      ?.message || (err instanceof Error ? err.message : String(err))

  if (status === 403 || /permission|forbidden/i.test(detail)) {
    return '回填登入資料失敗：服務帳戶沒有寫入權限，請將序號試算表分享給服務帳戶並設為「編輯者」。'
  }
  if (status === 404 || /not found/i.test(detail)) {
    return '回填登入資料失敗：找不到序號試算表或工作表，請確認 serialSheet 設定。'
  }
  if (status === 400) {
    return `回填登入資料失敗：寫入範圍不正確（${detail}）。`
  }
  if (
    code === 'ENOTFOUND' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'EAI_AGAIN' ||
    /fetch failed|network|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/i.test(detail)
  ) {
    return '無法連線至 Google 試算表，請確認網路後重試。'
  }
  return `回填登入資料失敗：${detail}`
}