import { BrowserWindow, ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { SerialLoginInput } from '../../shared/types'
import { googleAuthService } from '../services/googleAuthService'
import { focusAppWindows } from '../services/appWindowFocus'

function broadcastToWindows(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload)
    }
  }
}

export function registerAuthIpc(): void {
  // 查詢登入狀態（首次呼叫時會嘗試以已保存的 refresh token 還原登入）
  ipcMain.handle(IPC_CHANNELS.AUTH_GET_STATE, async () => {
    return googleAuthService.ensureRestored()
  })

  // 開啟 Google 登入流程
  ipcMain.handle(IPC_CHANNELS.AUTH_START_LOGIN, async () => {
    const result = await googleAuthService.startLogin()
    // 登入成功後把視窗帶回前景（交換 token 期間使用者可能又切回瀏覽器），
    // renderer 收到結果後會自動由登入畫面切換到主頁面。
    if (result.ok) focusAppWindows()
    broadcastToWindows(IPC_CHANNELS.EVENT_AUTH_CHANGED, googleAuthService.getState())
    return result
  })

  // 以序號登入（向雲端序號清單驗證）
  ipcMain.handle(
    IPC_CHANNELS.AUTH_LOGIN_WITH_SERIAL,
    async (_event, input: SerialLoginInput) => {
      const result = await googleAuthService.loginWithSerial(input)
      broadcastToWindows(IPC_CHANNELS.EVENT_AUTH_CHANGED, googleAuthService.getState())
      return result
    }
  )

  // 登出
  ipcMain.handle(IPC_CHANNELS.AUTH_LOGOUT, async () => {
    const state = await googleAuthService.logout()
    broadcastToWindows(IPC_CHANNELS.EVENT_AUTH_CHANGED, state)
    return state
  })
}
