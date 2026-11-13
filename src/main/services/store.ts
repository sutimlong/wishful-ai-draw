import { app, safeStorage } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { AppSettings } from '../../shared/types'

/**
 * 預設內建的 fal.ai API Key。
 * 當使用者尚未於設定中填入自己的 Key 時，會自動套用此 Key，
 * 讓 App 開箱即可直接進行真實的 fal.ai 圖片生成。
 * 使用者若在設定中儲存了自訂 Key，將優先採用使用者儲存的 Key。
 * 注意：此 Key 會被打包進應用程式產物中，僅適合個人/內部使用。
 */
export const DEFAULT_FAL_API_KEY =
  'fal_sk_6a47b0890e88403f8cb7ba5b18eefc7b:a9a16f9105248753deb1dabe10eb091e'

interface PersistedSettings {
  encryptedApiKey?: string
  plainApiKey?: string
  outputDirectory: string
  concurrency: number
  autoSaveOutput: boolean
  namingPattern: string
  mockMode: boolean
}

class SettingsStore {
  private filePath: string
  private data: PersistedSettings

  constructor() {
    const userDataDir = app.getPath('userData')
    const defaultOutputDir = join(app.getPath('pictures'), 'Wishful_AI_Output')
    if (!existsSync(defaultOutputDir)) {
      try {
        mkdirSync(defaultOutputDir, { recursive: true })
      } catch {
        // Ignore if cannot create immediately
      }
    }

    this.filePath = join(userDataDir, 'wishful-settings.json')
    this.data = {
      outputDirectory: defaultOutputDir,
      concurrency: 2,
      autoSaveOutput: true,
      namingPattern: '{original_name}_ai_{timestamp}',
      mockMode: false
    }
    this.load()
  }

  private load(): void {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        const parsed = JSON.parse(raw) as Partial<PersistedSettings>
        this.data = { ...this.data, ...parsed }
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
    if (!trimmed) {
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

  public getSettings(): AppSettings {
    const apiKey = this.getApiKey()
    return {
      falApiKey: apiKey,
      hasApiKey: apiKey.length > 0,
      outputDirectory: this.data.outputDirectory,
      concurrency: this.data.concurrency,
      autoSaveOutput: this.data.autoSaveOutput,
      namingPattern: this.data.namingPattern,
      mockMode: this.data.mockMode
    }
  }

  public updateSettings(partial: Partial<AppSettings>): AppSettings {
    if (typeof partial.falApiKey === 'string') {
      this.setApiKey(partial.falApiKey)
    }
    if (typeof partial.outputDirectory === 'string' && partial.outputDirectory.trim()) {
      this.data.outputDirectory = partial.outputDirectory.trim()
    }
    if (typeof partial.concurrency === 'number') {
      this.data.concurrency = Math.max(1, Math.min(10, Math.round(partial.concurrency)))
    }
    if (typeof partial.autoSaveOutput === 'boolean') {
      this.data.autoSaveOutput = partial.autoSaveOutput
    }
    if (typeof partial.namingPattern === 'string' && partial.namingPattern.trim()) {
      this.data.namingPattern = partial.namingPattern.trim()
    }
    if (typeof partial.mockMode === 'boolean') {
      this.data.mockMode = partial.mockMode
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

