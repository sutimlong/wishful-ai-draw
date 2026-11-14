import type { AuthUser, SerialLoginInput } from '../../shared/types'
import { DEFAULT_USER_ROLE_LABEL } from '../../shared/userRole'

/** 序號正規化：忽略所有空白並轉為大寫，讓輸入 `wad-2026-0001` 也能通過 */
export function normalizeSerial(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase()
}

/** 寬鬆的 Email 格式檢查（僅阻擋明顯錯誤，實際仍以使用者輸入為準） */
export const SERIAL_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type SerialInputValidation =
  | { ok: true; serial: string; email: string; name: string }
  | { ok: false; error: string }

/** 驗證序號登入的輸入格式（不檢查序號是否存在，序號需再向雲端清單比對） */
export function validateSerialInput(input: SerialLoginInput): SerialInputValidation {
  const serial = normalizeSerial(input.serial ?? '')
  const email = (input.email ?? '').trim()
  const name = (input.name ?? '').trim()

  if (!serial) return { ok: false, error: '請輸入序號。' }
  if (!email) return { ok: false, error: '請輸入 Email。' }
  if (!SERIAL_EMAIL_PATTERN.test(email)) {
    return { ok: false, error: 'Email 格式不正確，請重新確認。' }
  }
  if (!name) return { ok: false, error: '請輸入名稱。' }
  return { ok: true, serial, email, name }
}

export type SerialValidation = { ok: true; serial: string } | { ok: false; error: string }

/**
 * 驗證序號登入輸入，並比對雲端序號清單。
 * 授權規則：序號只要存在於清單即視為有效，可重複使用。
 */
export function validateSerialLogin(
  input: SerialLoginInput,
  validKeys: readonly string[]
): SerialValidation {
  const check = validateSerialInput(input)
  if (!check.ok) return check
  if (validKeys.length === 0) {
    return { ok: false, error: '序號清單目前為空，請聯絡管理員。' }
  }
  if (!validKeys.includes(check.serial)) {
    return { ok: false, error: '序號無效，請確認後重新輸入。' }
  }
  return { ok: true, serial: check.serial }
}

/** 以驗證後的輸入建立序號登入使用者（序號登入一律為一般使用者） */
export function buildSerialAuthUser(
  input: Pick<SerialLoginInput, 'email' | 'name'>,
  serial: string
): AuthUser {
  return {
    id: `serial:${serial}`,
    email: input.email.trim(),
    name: input.name.trim(),
    authMethod: 'serial',
    serial,
    role: DEFAULT_USER_ROLE_LABEL
  }
}

/** 序號登入者在試算表「使用者名稱」欄的顯示格式：名稱（序號） */
export function formatSerialUserName(name: string, serial: string): string {
  return `${name}（${serial}）`
}

/**
 * 解析要寫入試算表的使用者身分。
 * 序號登入者會在名稱後綴上序號，方便在試算表辨識是哪一組序號產生的記錄。
 */
export function resolveUsageIdentity(
  user: Pick<AuthUser, 'email' | 'name' | 'serial'> | null
): { email: string; name: string } | null {
  if (!user) return null
  return {
    email: user.email,
    name: user.serial ? formatSerialUserName(user.name, user.serial) : user.name
  }
}
