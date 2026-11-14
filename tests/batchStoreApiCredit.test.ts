import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppSettings, FalCreditBalanceResult } from '../src/shared/types'

/**
 * 驗證頂部「fal.ai 剩餘額度」徽章的狀態流：
 * - ok: true → apiCreditStatus = 'ready'，並帶入餘額
 * - reason: 'unauthorized'（403 / 401，Key 無 billing:usage:read 權限）→ 'unauthorized'
 * - reason: 'unavailable'（網路 / 5xx / 格式錯誤）→ 'error'
 * - 未設定 API Key → 'idle'，且不呼叫 IPC
 */

const electronAPI = {
  getApiCreditBalance: vi.fn()
}

;(globalThis as unknown as Record<string, unknown>).window = { electronAPI }

const BASE_SETTINGS: AppSettings = {
  falApiKey: 'fal_sk_test_key',
  hasApiKey: true,
  deepseekApiKey: 'sk-deepseek-test',
  hasDeepseekApiKey: true,
  outputDirectory: '/Users/me/Pictures/Wishful_AI_Output',
  concurrency: 2,
  autoSaveOutput: true,
  namingPattern: '{original_name}_ai_{timestamp}',
  mockMode: false
}

async function loadStore(hasApiKey = true) {
  vi.resetModules()
  const mod = await import('../src/renderer/src/store/useBatchStore')
  mod.useBatchStore.setState({
    appSettings: { ...BASE_SETTINGS, hasApiKey },
    apiCreditBalance: null,
    apiCreditStatus: 'idle'
  })
  return mod.useBatchStore
}

describe('useBatchStore.refreshApiCreditBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('成功取得餘額時狀態為 ready 並寫入餘額', async () => {
    const result: FalCreditBalanceResult = {
      ok: true,
      balance: { currentBalance: 24.5, currency: 'USD', username: 'wishful-team' }
    }
    electronAPI.getApiCreditBalance.mockResolvedValue(result)
    const store = await loadStore()

    await store.getState().refreshApiCreditBalance()

    expect(store.getState().apiCreditStatus).toBe('ready')
    expect(store.getState().apiCreditBalance).toEqual(result.ok ? result.balance : null)
  })

  it('Key 缺少 billing:usage:read 權限（unauthorized）時狀態為 unauthorized', async () => {
    electronAPI.getApiCreditBalance.mockResolvedValue({
      ok: false,
      reason: 'unauthorized'
    } satisfies FalCreditBalanceResult)
    const store = await loadStore()

    await store.getState().refreshApiCreditBalance()

    expect(store.getState().apiCreditStatus).toBe('unauthorized')
    expect(store.getState().apiCreditBalance).toBeNull()
  })

  it('其他失敗（unavailable）時狀態為 error', async () => {
    electronAPI.getApiCreditBalance.mockResolvedValue({
      ok: false,
      reason: 'unavailable'
    } satisfies FalCreditBalanceResult)
    const store = await loadStore()

    await store.getState().refreshApiCreditBalance()

    expect(store.getState().apiCreditStatus).toBe('error')
    expect(store.getState().apiCreditBalance).toBeNull()
  })

  it('IPC 拋出例外時狀態為 error', async () => {
    electronAPI.getApiCreditBalance.mockRejectedValue(new Error('ipc failed'))
    const store = await loadStore()

    await store.getState().refreshApiCreditBalance()

    expect(store.getState().apiCreditStatus).toBe('error')
    expect(store.getState().apiCreditBalance).toBeNull()
  })

  it('未設定 API Key 時狀態為 idle 且不呼叫 IPC', async () => {
    const store = await loadStore(false)

    await store.getState().refreshApiCreditBalance()

    expect(store.getState().apiCreditStatus).toBe('idle')
    expect(electronAPI.getApiCreditBalance).not.toHaveBeenCalled()
  })
})
