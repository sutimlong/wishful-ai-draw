import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { AppSettings } from '../../shared/types'
import { getSettingsStore } from '../services/store'
import { falCostService } from '../services/falCostService'

export function registerConfigIpc(): void {
  ipcMain.handle(IPC_CHANNELS.CONFIG_GET, () => {
    return getSettingsStore().getSettings()
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_UPDATE, (_event, partial: Partial<AppSettings>) => {
    const updated = getSettingsStore().updateSettings(partial)
    if (partial.falApiKey !== undefined) {
      // 金鑰變更後重新判定「實際帳務金額 vs 預估單價」與單價快取
      falCostService.clearCache()
    }
    return updated
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_VERIFY_KEY, (_event, key: string) => {
    return getSettingsStore().verifyApiKeyFormat(key)
  })
}

