import { app, safeStorage } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { AppSettings } from '../../shared/types'
import { clampConcurrency } from '../../shared/concurrency'
import { DEFAULT_DEEPSEEK_API_KEY } from './deepSeekService'
import { ensureOutputDirectories, getOutputRootDirectory } from './outputDirectories'

/**
 * 預設內建的 fal.ai API Key。
 * 當使用者尚未於設定中填入自己的 Key 時，會自動套用此 Key，
 * 讓 App 開箱即可直接進行真實的 fal.ai 圖片生成。
 * 使用者若在設定中儲存了自訂 Key，將優先採用使用者儲存的 Key。
 * 注意：此 Key 會被打包進應用程式產物中，僅適合個人/內部使用。
 */
export const DEFAULT_FAL_API_KEY =
  'fal_sk_5ad4131fb4914abdaa423486c2b18bff:0bb932aed4ce1d4dd1acd80f19677e8b'

/** 預設輸出資料夾：Mac「圖片 / Wishful_Ai_Draw」（由 outputDirectories 統一管理） */
function getDefaultOutputDirectory(): string {
  return getOutputRootDirectory()
}

interface PersistedSettings {
  encryptedApiKey?: string
  plainApiKey?: string
  encryptedDeepseekApiKey?: string
  plainDeepseekApiKey?: string
  outputDirectory: string
  concurrency: number
  autoSaveOutput: boolean
  namingPattern: string
}

class SettingsStore {
  private filePath: string
  private data: PersistedSettings
  /**
   * 模擬測試模式**刻意不寫入設定檔**，每次啟動 App 一律為關閉。
   *
   * 若把上次的開啟狀態保存下來，使用者測試完忘了關閉，下次開啟就會在不知情的
   * 情況下繼續模擬（不消耗真實 API 點數、也不產生真實圖片），容易誤判結果。
   * 因此這個開關只存在於本次執行期間，需要時再由使用者手動開啟。
   */
  private mockMode = false

  constructor() {
    const userDataDir = app.getPath('userData')
    const defaultOutputDir = getDefaultOutputDirectory()
    // 第一次啟動（或資料夾被刪除）時，建立「圖片 / Wishful_Ai_Draw / 文生圖」
    ensureOutputDirectories()

    this.filePath = join(userDataDir, 'wishful-settings.json')
    this.data = {
      outputDirectory: defaultOutputDir,
      concurrency: 2,
      autoSaveOutput: true,
      namingPattern: '{original_name}_ai_{timestamp}'
    }
    this.load()
  }

  private load(): void {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        const parsed = JSON.parse(raw) as Partial<PersistedSettings> & { mockMode?: unknown }
        // 舊版曾把 mockMode 存進設定檔，這裡直接丟棄，確保啟動時一律關閉
        delete parsed.mockMode
        this.data = { ...this.data, ...parsed }
        // 併發數一律限制在 1 ~ 40（fal.ai 自助方案上限）
        this.data.concurrency = clampConcurrency(this.data.concurrency)

        // 遷移舊的輸出資料夾：Wishful_AI_Output → Wishful_Ai_Draw
        const legacyDir = join(app.getPath('pictures'), 'Wishful_AI_Output')
        if (this.data.outputDirectory === legacyDir) {
          this.data.outputDirectory = getDefaultOutputDirectory()
          this.save()
        } else if (!this.data.outputDirectory || !this.data.outputDirectory.trim()) {
          this.data.outputDirectory = getDefaultOutputDirectory()
          this.save()
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  private save(): void {
    try {
      const dir = app.getPath('userData')
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }

  public getApiKey(): string {
    let storedKey = ''
    try {
      if (this.data.encryptedApiKey && safeStorage.isEncryptionAvailable()) {
        const buffer = Buffer.from(this.data.encryptedApiKey, 'base64')
        storedKey = safeStorage.decryptString(buffer)
      } else {
        storedKey = this.data.plainApiKey || ''
      }
    } catch {
      storedKey = this.data.plainApiKey || ''
    }
    // 使用者未設定 Key 時，自動套用內建的預設 fal.ai API Key
    return storedKey.trim() || DEFAULT_FAL_API_KEY
  }

  private setApiKey(apiKey: string): void {
    const trimmed = apiKey.trim()
    // 若內容等同內建預設 Key（例如使用者在設定視窗直接按儲存而未修改），
    // 視為「未自訂 Key」並清空儲存值，確保 App 永遠採用程式碼中最新的
    // DEFAULT_FAL_API_KEY，避免舊的預設 Key 被加密保存後蓋掉新預設值。
    if (!trimmed || trimmed === DEFAULT_FAL_API_KEY) {
      delete this.data.encryptedApiKey
      delete this.data.plainApiKey
      return
    }
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(trimmed)
        this.data.encryptedApiKey = encrypted.toString('base64')
        delete this.data.plainApiKey
      } else {
        this.data.plainApiKey = trimmed
      }
    } catch {
      this.data.plainApiKey = trimmed
    }
  }

  public getDeepSeekApiKey(): string {
    let storedKey = ''
    try {
      if (this.data.encryptedDeepseekApiKey && safeStorage.isEncryptionAvailable()) {
        const buffer = Buffer.from(this.data.encryptedDeepseekApiKey, 'base64')
        storedKey = safeStorage.decryptString(buffer)
      } else {
        storedKey = this.data.plainDeepseekApiKey || ''
      }
    } catch {
      storedKey = this.data.plainDeepseekApiKey || ''
    }
    // 使用者未設定 Key 時，自動套用內建的預設 DeepSeek API Key
    return storedKey.trim() || DEFAULT_DEEPSEEK_API_KEY
  }

  private setDeepSeekApiKey(apiKey: string): void {
    const trimmed = apiKey.trim()
    // 與預設 Key 相同時視為「未自訂」，確保日後更新程式碼中的預設 Key 能立即生效
    if (!trimmed || trimmed === DEFAULT_DEEPSEEK_API_KEY) {
      delete this.data.encryptedDeepseekApiKey
      delete this.data.plainDeepseekApiKey
      return
    }
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(trimmed)
        this.data.encryptedDeepseekApiKey = encrypted.toString('base64')
        delete this.data.plainDeepseekApiKey
      } else {
        this.data.plainDeepseekApiKey = trimmed
      }
    } catch {
      this.data.plainDeepseekApiKey = trimmed
    }
  }

  public getSettings(): AppSettings {
    const apiKey = this.getApiKey()
    const deepseekApiKey = this.getDeepSeekApiKey()
    return {
      falApiKey: apiKey,
      hasApiKey: apiKey.length > 0,
      deepseekApiKey,
      hasDeepseekApiKey: deepseekApiKey.length > 0,
      outputDirectory: this.data.outputDirectory,
      concurrency: this.data.concurrency,
      autoSaveOutput: this.data.autoSaveOutput,
      namingPattern: this.data.namingPattern,
      mockMode: this.mockMode
    }
  }

  public updateSettings(partial: Partial<AppSettings>): AppSettings {
    if (typeof partial.falApiKey === 'string') {
      this.setApiKey(partial.falApiKey)
    }
    if (typeof partial.deepseekApiKey === 'string') {
      this.setDeepSeekApiKey(partial.deepseekApiKey)
    }
    if (typeof partial.outputDirectory === 'string' && partial.outputDirectory.trim()) {
      this.data.outputDirectory = partial.outputDirectory.trim()
    }
    if (typeof partial.concurrency === 'number') {
      this.data.concurrency = clampConcurrency(partial.concurrency)
    }
    if (typeof partial.autoSaveOutput === 'boolean') {
      this.data.autoSaveOutput = partial.autoSaveOutput
    }
    if (typeof partial.namingPattern === 'string' && partial.namingPattern.trim()) {
      this.data.namingPattern = partial.namingPattern.trim()
    }
    if (typeof partial.mockMode === 'boolean') {
      // 只套用到本次執行期間，不寫入設定檔（下次啟動仍為關閉）
      this.mockMode = partial.mockMode
    }
    this.save()
    return this.getSettings()
  }

  public verifyApiKeyFormat(key: string): { valid: boolean; message: string } {
    const trimmed = key.trim()
    if (!trimmed) {
      return { valid: false, message: 'API Key 不能為空' }
    }
    // fal.ai keys typically follow a UUID:secret or token format (>16 chars)
    if (trimmed.length < 12) {
      return { valid: false, message: 'API Key 長度過短，請確認是否為完整的 fal.ai Key' }
    }
    return { valid: true, message: 'API Key 格式有效' }
  }
}

let storeInstance: SettingsStore | null = null

export function getSettingsStore(): SettingsStore {
  if (!storeInstance) {
    storeInstance = new SettingsStore()
  }
  return storeInstance
}

