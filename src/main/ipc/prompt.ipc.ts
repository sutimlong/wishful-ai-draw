import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { OptimizePromptResult } from '../../shared/types'
import { DEEPSEEK_MODEL, optimizePrompt } from '../services/deepSeekService'
import { getSettingsStore } from '../services/store'
import { usageLogger } from '../services/usageLoggerWiring'

export function registerPromptIpc(): void {
  // 提示詞優化：金鑰與外呼都留在 main process，renderer 只拿到結果
  ipcMain.handle(
    IPC_CHANNELS.PROMPT_OPTIMIZE,
    async (_event, prompt: string): Promise<OptimizePromptResult> => {
      let optimized: string
      try {
        // 使用使用者在 TopBar／設定中填寫的 DeepSeek Key（未填寫時為內建預設金鑰）
        const { deepseekApiKey } = getSettingsStore().getSettings()
        optimized = await optimizePrompt(prompt, { apiKey: deepseekApiKey })
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : '提示詞優化失敗，請稍後再試'
        }
      }

      // 寫入 Google 使用記錄（事件 Prompt word_optimization）；記錄失敗不影響優化結果
      try {
        usageLogger.recordPromptOptimization(prompt, { model: DEEPSEEK_MODEL })
      } catch (logErr) {
        console.error('寫入提示詞優化使用記錄失敗：', logErr)
      }

      return { ok: true, prompt: optimized }
    }
  )
}
