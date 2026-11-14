import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const root = mkdtempSync(join(tmpdir(), 'wishful-store-'))
const userDataDir = join(root, 'userData')
const picturesDir = join(root, 'pictures')
process.env['TEST_STORE_ROOT'] = root

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => {
      const base = process.env['TEST_STORE_ROOT'] as string
      return name === 'userData' ? `${base}/userData` : `${base}/pictures`
    }
  },
  safeStorage: {
    isEncryptionAvailable: () => false
  }
}))

const { getSettingsStore } = await import('../src/main/services/store')

const settingsPath = join(userDataDir, 'wishful-settings.json')

function readSettingsFile(): Record<string, unknown> {
  return JSON.parse(readFileSync(settingsPath, 'utf-8')) as Record<string, unknown>
}

/** 重新載入模組以模擬「重新啟動 App」（單例會一併重建） */
async function createStore(): Promise<ReturnType<typeof getSettingsStore>> {
  vi.resetModules()
  const mod = await import('../src/main/services/store')
  return mod.getSettingsStore()
}

function seedSettingsFile(content: Record<string, unknown>): void {
  mkdirSync(userDataDir, { recursive: true })
  writeFileSync(settingsPath, JSON.stringify(content, null, 2), 'utf-8')
}

describe('SettingsStore 的模擬測試模式', () => {
  beforeEach(() => {
    rmSync(userDataDir, { recursive: true, force: true })
  })

  afterAll(() => {
    rmSync(root, { recursive: true, force: true })
    delete process.env['TEST_STORE_ROOT']
  })

  it('全新啟動時預設為關閉', async () => {
    const store = await createStore()
    expect(store.getSettings().mockMode).toBe(false)
  })

  it('舊設定檔記錄 mockMode: true 時，啟動仍為關閉（其餘設定照常還原）', async () => {
    seedSettingsFile({
      outputDirectory: join(picturesDir, 'Wishful_AI_Output'),
      concurrency: 3,
      autoSaveOutput: true,
      namingPattern: '{original_name}_ai_{timestamp}',
      mockMode: true
    })

    const settings = (await createStore()).getSettings()
    expect(settings.mockMode).toBe(false)
    expect(settings.concurrency).toBe(3)
  })

  it('本次執行期間可開啟，且不會把 mockMode 寫入設定檔', async () => {
    const store = await createStore()
    expect(store.updateSettings({ mockMode: true }).mockMode).toBe(true)
    expect(readSettingsFile()).not.toHaveProperty('mockMode')
  })

  it('重新啟動後回復為關閉', async () => {
    const store = await createStore()
    store.updateSettings({ mockMode: true })

    const restarted = await createStore()
    expect(restarted.getSettings().mockMode).toBe(false)
  })
})
