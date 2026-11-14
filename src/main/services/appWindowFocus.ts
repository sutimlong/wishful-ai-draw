import { app, BrowserWindow } from 'electron'

/**
 * 把應用程式視窗帶回前景。
 *
 * 使用時機：使用者在系統瀏覽器完成 Google 授權、瀏覽器顯示「登入成功」時，
 * 自動切回 App（否則使用者會停在瀏覽器分頁，以為還要手動關閉）。
 *
 * - 視窗被最小化／隱藏時會先還原並顯示。
 * - macOS 只呼叫 `win.focus()` 常無法把整個 App 拉到前景，需搭配 `app.focus({ steal: true })`。
 */
export function focusAppWindows(): void {
  const windows = BrowserWindow.getAllWindows().filter((win) => !win.isDestroyed())
  if (windows.length === 0) return

  const target = windows.find((win) => win.isVisible()) ?? windows[0]
  if (target.isMinimized()) target.restore()
  if (!target.isVisible()) target.show()
  target.focus()

  if (process.platform === 'darwin') {
    app.focus({ steal: true })
  }
}
