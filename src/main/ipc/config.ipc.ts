import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { AppSettings } from '../../shared/types'
import { getSettingsStore } from '../services/store'
import { falCostService } from '../services/falCostService'
import { fetchDeepSeekBalance } from '../services/deepSeekService'

export function registerConfigIpc(): void {
  ipcMain.handle(IPC_CHANNELS.CONFIG_GET, () => {
    return getSettingsStore().getSettings()
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_UPDATE, (_event, partial: Partial<AppSettings>) => {
    const updated = getSettingsStore().updateSettings(partial)
    if (partial.falApiKey !== undefined) {
      // 金鑰變更後重新判定「實際帳務金額 vs 歷史均價預估」與費用預估快取
      falCostService.clearCache()
    }
    return updated
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_VERIFY_KEY, (_event, key: string) => {
    return getSettingsStore().verifyApiKeyFormat(key)
  })

  // 查詢 fal.ai 帳戶目前剩餘額度（需 billing:usage:read 權限）
  ipcMain.handle(IPC_CHANNELS.ACCOUNT_BILLING, async () => {
    const { falApiKey } = getSettingsStore().getSettings()
    return falCostService.getAccountCredits(falApiKey)
  })

  // 查詢 DeepSeek 帳戶目前餘額（TopBar 顯示用）
  ipcMain.handle(IPC_CHANNELS.DEEPSEEK_BALANCE, async () => {
    const { deepseekApiKey } = getSettingsStore().getSettings()
    return fetchDeepSeekBalance({ apiKey: deepseekApiKey })
  })
}

