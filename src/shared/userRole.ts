/** 管理員身份在試算表中的標記文字 */
export const ADMIN_ROLE_LABEL = '管理員'
/** 一般使用者身份的預設顯示文字 */
export const DEFAULT_USER_ROLE_LABEL = '一般使用者'

/**
 * 判斷身份是否為管理員。
 * 允許試算表填寫「管理員 / admin / administrator」等寫法（忽略大小寫與空白）。
 */
export function isAdminRole(role?: string | null): boolean {
  const normalized = String(role ?? '')
    .replace(/\s+/g, '')
    .toLowerCase()
  return (
    normalized === '管理員' ||
    normalized === 'admin' ||
    normalized === 'administrator' ||
    normalized === '管理者'
  )
}

/** 正規化身份顯示文字：空白時退回「一般使用者」 */
export function normalizeRoleLabel(role?: string | null): string {
  const trimmed = String(role ?? '').trim()
  return trimmed || DEFAULT_USER_ROLE_LABEL
}
