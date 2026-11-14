import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppSettings, DeepSeekBalanceResult } from '../src/shared/types'

/**
 * 驗證頂部「DeepSeek 餘額」徽章的狀態流：
 * - ok: true → deepseekBalanceStatus = 'ready'，並帶入餘額
 * - reason: 'unauthorized'（401 / 403，金鑰無效）→ 'unauthorized'
 * - reason: 'unavailable'（網路 / 5xx / 格式錯誤）→ 'error'
 * - 未設定金鑰 → 'idle'，且不呼叫 IPC
 * - 更新金鑰後會自動重新查詢
 */

const electronAPI = {
  getDeepSeekBalance: vi.fn(),
  updateSettings: vi.fn()
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

const SAMPLE_BALANCE: DeepSeekBalanceResult = {
  ok: true,
  balance: {
    totalBalance: 1.1,
    currency: 'USD',
    grantedBalance: 0,
    toppedUpBalance: 1.1,
    isAvailable: true
  }
}

async function loadStore(hasDeepseekApiKey = true) {
  vi.resetModules()
  const mod = await import('../src/renderer/src/store/useBatchStore')
  mod.useBatchStore.setState({
    appSettings: { ...BASE_SETTINGS, hasDeepseekApiKey },
    deepseekBalance: null,
    deepseekBalanceStatus: 'idle'
  })
  return mod.useBatchStore
}

describe('useBatchStore.refreshDeepSeekBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('成功取得餘額時狀態為 ready 並寫入餘額', async () => {
    electronAPI.getDeepSeekBalance.mockResolvedValue(SAMPLE_BALANCE)
    const store = await loadStore()

    await store.getState().refreshDeepSeekBalance()

    expect(store.getState().deepseekBalanceStatus).toBe('ready')
    expect(store.getState().deepseekBalance).toEqual(SAMPLE_BALANCE.balance)
  })

  it('金鑰無效（unauthorized）時狀態為 unauthorized', async () => {
    electronAPI.getDeepSeekBalance.mockResolvedValue({
      ok: false,
      reason: 'unauthorized'
    } satisfies DeepSeekBalanceResult)
    const store = await loadStore()

    await store.getState().refreshDeepSeekBalance()

    expect(store.getState().deepseekBalanceStatus).toBe('unauthorized')
    expect(store.getState().deepseekBalance).toBeNull()
  })

  it('其他失敗（unavailable）時狀態為 error', async () => {
    electronAPI.getDeepSeekBalance.mockResolvedValue({
      ok: false,
      reason: 'unavailable'
    } satisfies DeepSeekBalanceResult)
    const store = await loadStore()

    await store.getState().refreshDeepSeekBalance()

    expect(store.getState().deepseekBalanceStatus).toBe('error')
    expect(store.getState().deepseekBalance).toBeNull()
  })

  it('IPC 拋出例外時狀態為 error', async () => {
    electronAPI.getDeepSeekBalance.mockRejectedValue(new Error('ipc failed'))
    const store = await loadStore()

    await store.getState().refreshDeepSeekBalance()

    expect(store.getState().deepseekBalanceStatus).toBe('error')
    expect(store.getState().deepseekBalance).toBeNull()
  })

  it('未設定 DeepSeek 金鑰時狀態為 idle 且不呼叫 IPC', async () => {
    const store = await loadStore(false)

    await store.getState().refreshDeepSeekBalance()

    expect(store.getState().deepseekBalanceStatus).toBe('idle')
    expect(electronAPI.getDeepSeekBalance).not.toHaveBeenCalled()
  })

  it('更新 DeepSeek 金鑰後會自動重新查詢餘額', async () => {
    electronAPI.getDeepSeekBalance.mockResolvedValue(SAMPLE_BALANCE)
    electronAPI.updateSettings.mockResolvedValue({
      ...BASE_SETTINGS,
      deepseekApiKey: 'sk-new-key'
    })
    const store = await loadStore()

    await store.getState().updateAppSettings({ deepseekApiKey: 'sk-new-key' })
    // refreshDeepSeekBalance 以 void 啟動，讓出一個 tick 等待狀態更新
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(electronAPI.updateSettings).toHaveBeenCalledWith({ deepseekApiKey: 'sk-new-key' })
    expect(electronAPI.getDeepSeekBalance).toHaveBeenCalledTimes(1)
    expect(store.getState().deepseekBalanceStatus).toBe('ready')
  })

  it('更新非金鑰設定時不會重新查詢餘額', async () => {
    electronAPI.updateSettings.mockResolvedValue({ ...BASE_SETTINGS, mockMode: true })
    const store = await loadStore()

    await store.getState().updateAppSettings({ mockMode: true })

    expect(electronAPI.getDeepSeekBalance).not.toHaveBeenCalled()
  })
})
