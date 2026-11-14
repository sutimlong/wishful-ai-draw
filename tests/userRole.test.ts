import { describe, expect, it } from 'vitest'
import {
  ADMIN_ROLE_LABEL,
  DEFAULT_USER_ROLE_LABEL,
  isAdminRole,
  normalizeRoleLabel
} from '../src/shared/userRole'
import { extractRoles } from '../src/main/services/userRoleService'

describe('使用者身份判斷', () => {
  it('管理員的各種寫法都能辨識', () => {
    expect(isAdminRole(ADMIN_ROLE_LABEL)).toBe(true)
    expect(isAdminRole('admin')).toBe(true)
    expect(isAdminRole(' Admin ')).toBe(true)
    expect(isAdminRole('Administrator')).toBe(true)
  })

  it('一般使用者或空白不算管理員', () => {
    expect(isAdminRole(DEFAULT_USER_ROLE_LABEL)).toBe(false)
    expect(isAdminRole('')).toBe(false)
    expect(isAdminRole(undefined)).toBe(false)
    expect(isAdminRole(null)).toBe(false)
  })

  it('空白身份會顯示為一般使用者', () => {
    expect(normalizeRoleLabel('')).toBe(DEFAULT_USER_ROLE_LABEL)
    expect(normalizeRoleLabel('  ')).toBe(DEFAULT_USER_ROLE_LABEL)
    expect(normalizeRoleLabel('管理員')).toBe('管理員')
  })
})

describe('讀取工作表3 的 Email → 身份對照', () => {
  it('略過標題列，Email 不分大小寫並去除空白', () => {
    const roles = extractRoles(
      [
        ['Email', '身份'],
        ['alice@example.com', '管理員'],
        [' Bob@Example.com ', '一般使用者'],
        ['', '管理員'],
        ['carol@example.com', '']
      ],
      true
    )

    expect(roles.get('alice@example.com')).toBe('管理員')
    expect(roles.get('bob@example.com')).toBe('一般使用者')
    expect(roles.has('')).toBe(false)
    expect(roles.has('carol@example.com')).toBe(false)
    expect(roles.size).toBe(2)
  })

  it('沒有標題列時從第一列開始讀取', () => {
    const roles = extractRoles([['dave@example.com', '管理員']], false)
    expect(roles.get('dave@example.com')).toBe('管理員')
  })

  it('空資料時回傳空對照表', () => {
    expect(extractRoles(undefined, true).size).toBe(0)
    expect(extractRoles([], true).size).toBe(0)
  })
})
