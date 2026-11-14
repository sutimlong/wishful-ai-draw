import { UsageLogger } from './usageLogger'
import { googleSheetsService } from './googleSheetsService'
import { googleAuthService } from './googleAuthService'
import { resolveUsageIdentity } from './serialAuth'

/**
 * 全域使用記錄器：將每張完成圖片的記錄寫入開發者 Google 雲端硬碟試算表。
 * 以目前登入的使用者作為記錄對象；未登入時自動略過。
 * 序號登入者的名稱會後綴序號（例：王小明（WAD-2026-0001）），方便在試算表辨識。
 */
export const usageLogger = new UsageLogger({
  sheets: googleSheetsService,
  getCurrentUser: () => resolveUsageIdentity(googleAuthService.getCurrentUser())
})
