import { describe, expect, it } from 'vitest'
import {
  buildSerialAuthUser,
  formatSerialUserName,
  normalizeSerial,
  resolveUsageIdentity,
  validateSerialInput,
  validateSerialLogin
} from '../src/main/services/serialAuth'

describe('normalizeSerial', () => {
  it('去除空白並轉大寫', () => {
    expect(normalizeSerial('  wad-2026-0001 ')).toBe('WAD-2026-0001')
    expect(normalizeSerial('WAD 2026 0001')).toBe('WAD20260001')
  })
})

describe('validateSerialInput', () => {
  it('通過時回傳正規化序號與去空白後的 Email／名稱', () => {
    expect(
      validateSerialInput({
        serial: ' wad-2026-0001 ',
        email: ' alice@example.com ',
        name: ' Alice '
      })
    ).toEqual({ ok: true, serial: 'WAD-2026-0001', email: 'alice@example.com', name: 'Alice' })
  })

  it('未填序號時回傳錯誤', () => {
    expect(validateSerialInput({ serial: '  ', email: 'a@b.com', name: 'A' })).toEqual({
      ok: false,
      error: '請輸入序號。'
    })
  })

  it('Email 格式錯誤時回傳錯誤', () => {
    expect(
      validateSerialInput({ serial: 'WAD-2026-0001', email: 'not-an-email', name: 'A' })
    ).toEqual({ ok: false, error: 'Email 格式不正確，請重新確認。' })
  })
})

const validKeys = ['WAD-2026-0001', 'WAD-2026-0002']

describe('validateSerialLogin', () => {
  it('序號存在時通過，並回傳正規化後序號', () => {
    expect(
      validateSerialLogin(
        { serial: ' wad-2026-0001 ', email: ' alice@example.com ', name: ' Alice ' },
        validKeys
      )
    ).toEqual({ ok: true, serial: 'WAD-2026-0001' })
  })

  it('未填序號時回傳錯誤', () => {
    expect(validateSerialLogin({ serial: '  ', email: 'a@b.com', name: 'A' }, validKeys)).toEqual({
      ok: false,
      error: '請輸入序號。'
    })
  })

  it('未填 Email 或格式錯誤時回傳錯誤', () => {
    expect(
      validateSerialLogin({ serial: 'WAD-2026-0001', email: '', name: 'A' }, validKeys)
    ).toEqual({ ok: false, error: '請輸入 Email。' })

    expect(
      validateSerialLogin({ serial: 'WAD-2026-0001', email: 'not-an-email', name: 'A' }, validKeys)
    ).toEqual({ ok: false, error: 'Email 格式不正確，請重新確認。' })
  })

  it('未填名稱時回傳錯誤', () => {
    expect(
      validateSerialLogin({ serial: 'WAD-2026-0001', email: 'a@b.com', name: '   ' }, validKeys)
    ).toEqual({ ok: false, error: '請輸入名稱。' })
  })

  it('序號清單為空時提示尚未設定', () => {
    expect(
      validateSerialLogin({ serial: 'WAD-2026-0001', email: 'a@b.com', name: 'A' }, [])
    ).toEqual({
      ok: false,
      error: '序號清單目前為空，請聯絡管理員。'
    })
  })

  it('序號不在清單時回傳無效', () => {
    expect(
      validateSerialLogin({ serial: 'WAD-9999-9999', email: 'a@b.com', name: 'A' }, validKeys)
    ).toEqual({ ok: false, error: '序號無效，請確認後重新輸入。' })
  })
})

describe('buildSerialAuthUser', () => {
  it('建立序號登入使用者（去除前後空白，身份一律為一般使用者）', () => {
    expect(
      buildSerialAuthUser({ email: ' alice@example.com ', name: ' Alice ' }, 'WAD-2026-0001')
    ).toEqual({
      id: 'serial:WAD-2026-0001',
      email: 'alice@example.com',
      name: 'Alice',
      authMethod: 'serial',
      serial: 'WAD-2026-0001',
      role: '一般使用者'
    })
  })
})

describe('formatSerialUserName', () => {
  it('名稱後綴序號', () => {
    expect(formatSerialUserName('王小明', 'WAD-2026-0001')).toBe('王小明（WAD-2026-0001）')
  })
})

describe('resolveUsageIdentity', () => {
  it('序號登入者名稱加上序號', () => {
    expect(
      resolveUsageIdentity({ email: 'a@b.com', name: '王小明', serial: 'WAD-2026-0001' })
    ).toEqual({ email: 'a@b.com', name: '王小明（WAD-2026-0001）' })
  })

  it('Google 登入者名稱不加序號', () => {
    expect(resolveUsageIdentity({ email: 'g@b.com', name: 'Google User' })).toEqual({
      email: 'g@b.com',
      name: 'Google User'
    })
  })

  it('未登入時回傳 null', () => {
    expect(resolveUsageIdentity(null)).toBeNull()
  })
})
