import { describe, expect, it } from 'vitest'
import {
  buildColumnRange,
  buildSerialProfileRange,
  describeSerialSheetError,
  describeSerialWriteError,
  extractSerialKeys,
  fetchSerialKeysFromSheets,
  findSerialRowNumber,
  recordSerialLoginToSheets,
  resolveSerialSheetSettings,
  SerialKeyError,
  type SerialSheetSettings,
  type SheetsReader
} from '../src/main/services/serialSheet'

describe('extractSerialKeys', () => {
  it('無標題列時第一列即為序號', () => {
    expect(extractSerialKeys([['wad-2026-0001'], [' WAD-2026-0002 ']], false)).toEqual([
      'WAD-2026-0001',
      'WAD-2026-0002'
    ])
  })

  it('hasHeader 為 true 時跳過第一列', () => {
    expect(extractSerialKeys([['序號'], ['WAD-2026-0001']], true)).toEqual(['WAD-2026-0001'])
  })

  it('忽略空白列並去除重複', () => {
    expect(
      extractSerialKeys([[' wad-2026-0001 '], ['WAD-2026-0001'], [''], [null], ['WAD-2026-0002']], false)
    ).toEqual(['WAD-2026-0001', 'WAD-2026-0002'])
  })

  it('空資料回傳空陣列', () => {
    expect(extractSerialKeys(null, false)).toEqual([])
    expect(extractSerialKeys([], false)).toEqual([])
  })
})

describe('resolveSerialSheetSettings', () => {
  it('未設定時使用預設（工作表二、A 欄、無標題列）', () => {
    expect(resolveSerialSheetSettings(null)).toEqual({
      spreadsheetId: '1Gy8ICS8Cz4YEJVnwWehvcclvLsuSYzfbceiYUlhRKgw',
      sheetId: 1195700831,
      sheetTitle: undefined,
      column: 'A',
      hasHeader: false
    })
  })

  it('可覆寫設定並正規化欄位', () => {
    expect(
      resolveSerialSheetSettings({
        spreadsheetId: 'usage-id',
        serialSheet: {
          spreadsheetId: ' serial-id ',
          sheetId: 42,
          sheetTitle: ' 工作表二 ',
          column: ' c ',
          hasHeader: true
        }
      })
    ).toEqual({
      spreadsheetId: 'serial-id',
      sheetId: 42,
      sheetTitle: '工作表二',
      column: 'C',
      hasHeader: true
    })
  })

  it('未填 serialSheet.spreadsheetId 時退回 spreadsheetId', () => {
    expect(resolveSerialSheetSettings({ spreadsheetId: 'usage-id' }).spreadsheetId).toBe('usage-id')
  })
})

describe('buildColumnRange', () => {
  it('組出整欄範圍並轉義工作表名稱', () => {
    expect(buildColumnRange('工作表二', 'a')).toBe("'工作表二'!A:A")
    expect(buildColumnRange("O'Brien", 'b')).toBe("'O''Brien'!B:B")
  })
})

interface FakeOptions {
  sheetsMeta?: Array<{ title?: string; sheetId?: number }>
  values?: unknown[][]
}

interface FakeCalls {
  get: number
  valuesGet: number
  valuesUpdate: number
  lastRange?: string
  lastFields?: string
  updateRange?: string
  updateValues?: unknown[][]
  updateInputOption?: string
}

function createFakeSheets(options: FakeOptions = {}): { sheets: SheetsReader; calls: FakeCalls } {
  const calls: FakeCalls = { get: 0, valuesGet: 0, valuesUpdate: 0 }
  const meta = options.sheetsMeta ?? [
    { title: '工作表一', sheetId: 0 },
    { title: '工作表二', sheetId: 1195700831 }
  ]

  const sheets: SheetsReader = {
    spreadsheets: {
      async get(params): Promise<{
        data: { sheets?: Array<{ properties?: { title?: string | null; sheetId?: number | null } }> }
      }> {
        calls.get += 1
        calls.lastFields = params.fields
        return {
          data: {
            sheets: meta.map((sheet) => ({
              properties: { title: sheet.title, sheetId: sheet.sheetId }
            }))
          }
        }
      },
      values: {
        async get(params): Promise<{ data: { values?: unknown[][] } }> {
          calls.valuesGet += 1
          calls.lastRange = params.range
          return { data: { values: options.values } }
        },
        async update(params): Promise<unknown> {
          calls.valuesUpdate += 1
          calls.updateRange = params.range
          calls.updateValues = params.requestBody.values
          calls.updateInputOption = params.valueInputOption
          return {}
        }
      }
    }
  }

  return { sheets, calls }
}

const baseSettings: SerialSheetSettings = {
  spreadsheetId: 'sheet-id',
  sheetId: 1195700831,
  column: 'A',
  hasHeader: false
}

describe('fetchSerialKeysFromSheets', () => {
  it('依 sheetId 解析工作表名稱並讀取序號', async () => {
    const { sheets, calls } = createFakeSheets({
      values: [['WAD-2026-0001'], ['WAD-2026-0002']]
    })

    await expect(fetchSerialKeysFromSheets(sheets, baseSettings)).resolves.toEqual([
      'WAD-2026-0001',
      'WAD-2026-0002'
    ])
    expect(calls.get).toBe(1)
    expect(calls.lastFields).toContain('sheetId')
    expect(calls.lastRange).toBe("'工作表二'!A:A")
  })

  it('提供 sheetTitle 時不再查詢工作表清單', async () => {
    const { sheets, calls } = createFakeSheets({ values: [['序號'], ['WAD-2026-0001']] })

    await expect(
      fetchSerialKeysFromSheets(sheets, {
        ...baseSettings,
        sheetTitle: '自訂表',
        column: 'B',
        hasHeader: true
      })
    ).resolves.toEqual(['WAD-2026-0001'])
    expect(calls.get).toBe(0)
    expect(calls.lastRange).toBe("'自訂表'!B:B")
  })

  it('找不到指定的 sheetId 時拋出 SerialKeyError', async () => {
    const { sheets } = createFakeSheets({ sheetsMeta: [{ title: '工作表一', sheetId: 0 }] })

    await expect(fetchSerialKeysFromSheets(sheets, baseSettings)).rejects.toBeInstanceOf(SerialKeyError)
  })
})

describe('describeSerialSheetError', () => {
  it('403 提示分享權限', () => {
    expect(describeSerialSheetError({ response: { status: 403 } })).toContain('權限')
  })

  it('404 提示找不到試算表', () => {
    expect(describeSerialSheetError({ response: { status: 404 } })).toContain('找不到')
  })

  it('網路錯誤提示無法連線', () => {
    expect(describeSerialSheetError({ code: 'ENOTFOUND' })).toContain('無法連線')
  })

  it('400 提示讀取範圍不正確', () => {
    expect(
      describeSerialSheetError({
        response: { status: 400, data: { error: { message: 'bad range' } } }
      })
    ).toContain('讀取範圍')
  })
})

describe('findSerialRowNumber', () => {
  const values = [
    ['WAD ID'],
    ['WAD-aB9kLm2PqR7xZv4N'],
    ['WAD-8KpWnE3tY6mHcJ9s'],
    [''],
    [null]
  ]

  it('hasHeader 為 true 時略過標題列，回傳實際列號', () => {
    expect(findSerialRowNumber(values, 'wad-ab9klm2pqr7xzv4n', true)).toBe(2)
    expect(findSerialRowNumber(values, ' WAD-8KpWnE3tY6mHcJ9s ', true)).toBe(3)
  })

  it('hasHeader 為 false 時第一列也納入比對', () => {
    expect(findSerialRowNumber([['WAD-0001'], ['WAD-0002']], 'wad-0002', false)).toBe(2)
  })

  it('不會把標題列誤判為序號', () => {
    expect(findSerialRowNumber(values, 'WAD ID', true)).toBeNull()
  })

  it('找不到或資料為空時回傳 null', () => {
    expect(findSerialRowNumber(values, 'WAD-NOT-EXIST', true)).toBeNull()
    expect(findSerialRowNumber([], 'WAD-0001', false)).toBeNull()
    expect(findSerialRowNumber(null, 'WAD-0001', false)).toBeNull()
    expect(findSerialRowNumber(values, '   ', true)).toBeNull()
  })
})

describe('buildSerialProfileRange', () => {
  it('組出 B～D 欄範圍並轉義工作表名稱', () => {
    expect(buildSerialProfileRange('工作表2', 5)).toBe("'工作表2'!B5:D5")
    expect(buildSerialProfileRange("O'Brien", 12)).toBe("'O''Brien'!B12:D12")
  })
})

describe('recordSerialLoginToSheets', () => {
  const settings: SerialSheetSettings = {
    spreadsheetId: 'sheet-id',
    sheetId: 1195700831,
    column: 'A',
    hasHeader: true
  }

  it('找到序號後覆寫該列的 B～D 欄', async () => {
    const { sheets, calls } = createFakeSheets({
      values: [['WAD ID', '使用者名稱', '電子郵件', '創建時間'], ['WAD-0001'], ['WAD-0002']]
    })

    await expect(
      recordSerialLoginToSheets(sheets, settings, {
        serial: 'wad-0002',
        name: '王小明',
        email: 'ming@example.com',
        loginTime: '2026-11-14 12:00:00'
      })
    ).resolves.toBe(true)

    expect(calls.updateRange).toBe("'工作表二'!B3:D3")
    expect(calls.updateValues).toEqual([['王小明', 'ming@example.com', '2026-11-14 12:00:00']])
    expect(calls.updateInputOption).toBe('USER_ENTERED')
  })

  it('序號不在清單中時不寫入任何資料', async () => {
    const { sheets, calls } = createFakeSheets({ values: [['WAD ID'], ['WAD-0001']] })

    await expect(
      recordSerialLoginToSheets(sheets, settings, {
        serial: 'WAD-9999',
        name: '王小明',
        email: 'ming@example.com',
        loginTime: '2026-11-14 12:00:00'
      })
    ).resolves.toBe(false)

    expect(calls.valuesUpdate).toBe(0)
  })
})

describe('describeSerialWriteError', () => {
  it('403 提示需要編輯者權限', () => {
    expect(describeSerialWriteError({ response: { status: 403 } })).toContain('編輯者')
  })

  it('網路錯誤提示無法連線', () => {
    expect(describeSerialWriteError({ code: 'ETIMEDOUT' })).toContain('無法連線')
  })
})
