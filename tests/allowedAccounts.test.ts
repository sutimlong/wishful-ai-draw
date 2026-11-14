import { describe, expect, it, vi } from 'vitest'
import type { SheetsReader } from '../src/main/services/serialSheet'

vi.mock('electron', () => ({
  app: { getAppPath: () => process.cwd() }
}))

const {
  AllowedAccountsError,
  DEFAULT_ALLOWED_SHEET_ID,
  DEFAULT_ALLOWED_SPREADSHEET_ID,
  describeAllowedAccountsError,
  extractAllowedEmails,
  fetchAllowedEmails,
  isEmailAllowedInList,
  normalizeEmail,
  resolveAllowedAccountsSettings
} = await import('../src/main/services/allowedAccounts')

/** 建立假的 Sheets 客戶端，讓測試不需真的呼叫 Google API */
function createFakeSheets(options: {
  sheets?: Array<{ title: string; sheetId: number }>
  values?: unknown[][]
  metaError?: unknown
  valuesError?: unknown
}): {
  sheets: SheetsReader
  getMeta: ReturnType<typeof vi.fn>
  getValues: ReturnType<typeof vi.fn>
} {
  const getMeta = vi.fn(async () => {
    if (options.metaError) throw options.metaError
    return {
      data: {
        sheets: (options.sheets ?? []).map((sheet) => ({ properties: sheet }))
      }
    }
  })

  const getValues = vi.fn(async () => {
    if (options.valuesError) throw options.valuesError
    return { data: { values: options.values ?? [] } }
  })

  const sheets = {
    spreadsheets: {
      get: getMeta,
      values: { get: getValues, update: vi.fn() }
    }
  } as unknown as SheetsReader

  return { sheets, getMeta, getValues }
}

describe('normalizeEmail', () => {
  it('去除前後空白並轉小寫', () => {
    expect(normalizeEmail('  SutimLong@Gmail.com ')).toBe('sutimlong@gmail.com')
  })

  it('空字串回傳空字串', () => {
    expect(normalizeEmail('')).toBe('')
    expect(normalizeEmail('   ')).toBe('')
  })
})

describe('resolveAllowedAccountsSettings', () => {
  it('未設定時使用預設（工作表3、A 欄、有標題列）', () => {
    expect(resolveAllowedAccountsSettings(null)).toEqual({
      spreadsheetId: DEFAULT_ALLOWED_SPREADSHEET_ID,
      sheetId: DEFAULT_ALLOWED_SHEET_ID,
      sheetTitle: undefined,
      column: 'A',
      hasHeader: true
    })
  })

  it('可覆寫設定並正規化欄位', () => {
    expect(
      resolveAllowedAccountsSettings({
        spreadsheetId: 'usage-id',
        allowedAccounts: {
          spreadsheetId: ' allow-id ',
          sheetId: 42,
          sheetTitle: ' 授權清單 ',
          column: ' c ',
          hasHeader: false
        }
      })
    ).toEqual({
      spreadsheetId: 'allow-id',
      sheetId: 42,
      sheetTitle: '授權清單',
      column: 'C',
      hasHeader: false
    })
  })

  it('未填 spreadsheetId 時退回使用頂層 spreadsheetId', () => {
    expect(
      resolveAllowedAccountsSettings({ spreadsheetId: 'usage-id', allowedAccounts: {} })
        .spreadsheetId
    ).toBe('usage-id')
  })

  it('hasHeader 未設定時預設為 true', () => {
    expect(resolveAllowedAccountsSettings({ allowedAccounts: {} }).hasHeader).toBe(true)
  })
})

describe('extractAllowedEmails', () => {
  it('hasHeader 為 true 時跳過第一列標題', () => {
    expect(extractAllowedEmails([['授權的Gmail帳號'], ['sutimlong@gmail.com']], true)).toEqual([
      'sutimlong@gmail.com'
    ])
  })

  it('忽略空白列、去除重複並轉小寫', () => {
    expect(
      extractAllowedEmails(
        [[' SutimLong@Gmail.com '], ['sutimlong@gmail.com'], [''], [null], ['other@gmail.com']],
        false
      )
    ).toEqual(['sutimlong@gmail.com', 'other@gmail.com'])
  })

  it('空資料回傳空陣列', () => {
    expect(extractAllowedEmails(null, true)).toEqual([])
    expect(extractAllowedEmails([], true)).toEqual([])
    expect(extractAllowedEmails([['授權的Gmail帳號']], true)).toEqual([])
  })
})

describe('isEmailAllowedInList', () => {
  it('比對時忽略大小寫與前後空白', () => {
    expect(isEmailAllowedInList(' SutimLong@Gmail.com ', ['sutimlong@gmail.com'])).toBe(true)
  })

  it('不在清單內回傳 false', () => {
    expect(isEmailAllowedInList('nobody@gmail.com', ['sutimlong@gmail.com'])).toBe(false)
  })

  it('空 Email 一律回傳 false', () => {
    expect(isEmailAllowedInList('', ['sutimlong@gmail.com'])).toBe(false)
    expect(isEmailAllowedInList('   ', ['sutimlong@gmail.com'])).toBe(false)
  })
})

describe('fetchAllowedEmails', () => {
  it('依 gid 找到工作表並讀取指定欄位（跳過標題列）', async () => {
    const { sheets, getMeta, getValues } = createFakeSheets({
      sheets: [
        { title: '工作表1', sheetId: 0 },
        { title: '工作表3', sheetId: DEFAULT_ALLOWED_SHEET_ID }
      ],
      values: [['授權的Gmail帳號'], ['sutimlong@gmail.com'], ['SutimLong@Gmail.com']]
    })

    await expect(
      fetchAllowedEmails(sheets, {
        spreadsheetId: 'sheet-id',
        sheetId: DEFAULT_ALLOWED_SHEET_ID,
        column: 'A',
        hasHeader: true
      })
    ).resolves.toEqual(['sutimlong@gmail.com'])

    expect(getMeta).toHaveBeenCalledWith({
      spreadsheetId: 'sheet-id',
      fields: 'sheets(properties(title,sheetId))'
    })
    expect(getValues).toHaveBeenCalledWith({
      spreadsheetId: 'sheet-id',
      range: "'工作表3'!A:A"
    })
  })

  it('指定 sheetTitle 時不再查詢工作表清單', async () => {
    const { sheets, getMeta, getValues } = createFakeSheets({
      values: [['sutimlong@gmail.com']]
    })

    await fetchAllowedEmails(sheets, {
      spreadsheetId: 'sheet-id',
      sheetTitle: '授權清單',
      column: 'B',
      hasHeader: false
    })

    expect(getMeta).not.toHaveBeenCalled()
    expect(getValues).toHaveBeenCalledWith({
      spreadsheetId: 'sheet-id',
      range: "'授權清單'!B:B"
    })
  })

  it('找不到指定 gid 時丟出 AllowedAccountsError', async () => {
    const { sheets } = createFakeSheets({ sheets: [{ title: '工作表1', sheetId: 0 }] })

    await expect(
      fetchAllowedEmails(sheets, {
        spreadsheetId: 'sheet-id',
        sheetId: DEFAULT_ALLOWED_SHEET_ID,
        column: 'A',
        hasHeader: true
      })
    ).rejects.toBeInstanceOf(AllowedAccountsError)
  })
})

describe('describeAllowedAccountsError', () => {
  it('403 顯示權限不足說明', () => {
    expect(describeAllowedAccountsError({ response: { status: 403 } })).toContain('權限')
  })

  it('404 顯示找不到試算表說明', () => {
    expect(describeAllowedAccountsError({ response: { status: 404 } })).toContain('找不到')
  })

  it('網路錯誤顯示連線失敗說明', () => {
    expect(describeAllowedAccountsError({ code: 'ETIMEDOUT' })).toContain('無法連線')
  })
})
