import { describe, expect, it, vi } from 'vitest'

const { appFocus, windows } = vi.hoisted(() => ({
  appFocus: vi.fn(),
  windows: [] as Array<{
    isDestroyed: () => boolean
    isVisible: () => boolean
    isMinimized: () => boolean
    restore: () => void
    show: () => void
    focus: () => void
  }>
}))

vi.mock('electron', () => ({
  app: { focus: appFocus },
  BrowserWindow: { getAllWindows: () => windows }
}))

import { focusAppWindows } from '../src/main/services/appWindowFocus'

function createWindow(
  overrides: Partial<{
    destroyed: boolean
    visible: boolean
    minimized: boolean
  }> = {}
) {
  const win = {
    isDestroyed: vi.fn(() => overrides.destroyed ?? false),
    isVisible: vi.fn(() => overrides.visible ?? true),
    isMinimized: vi.fn(() => overrides.minimized ?? false),
    restore: vi.fn(),
    show: vi.fn(),
    focus: vi.fn()
  }
  return win
}

describe('focusAppWindows', () => {
  it('把可見視窗帶回前景（macOS 另外呼叫 app.focus 搶回焦點）', () => {
    const win = createWindow()
    windows.splice(0, windows.length, win)
    appFocus.mockReset()

    focusAppWindows()

    expect(win.focus).toHaveBeenCalledTimes(1)
    expect(win.restore).not.toHaveBeenCalled()
    expect(win.show).not.toHaveBeenCalled()
    if (process.platform === 'darwin') {
      expect(appFocus).toHaveBeenCalledWith({ steal: true })
    } else {
      expect(appFocus).not.toHaveBeenCalled()
    }
  })

  it('視窗最小化或隱藏時會先還原並顯示', () => {
    const win = createWindow({ minimized: true, visible: false })
    windows.splice(0, windows.length, win)

    focusAppWindows()

    expect(win.restore).toHaveBeenCalledTimes(1)
    expect(win.show).toHaveBeenCalledTimes(1)
    expect(win.focus).toHaveBeenCalledTimes(1)
  })

  it('忽略已銷毀的視窗，找不到視窗時不拋錯', () => {
    const destroyed = createWindow({ destroyed: true })
    windows.splice(0, windows.length, destroyed)

    expect(() => focusAppWindows()).not.toThrow()
    expect(destroyed.focus).not.toHaveBeenCalled()

    windows.splice(0, windows.length)
    expect(() => focusAppWindows()).not.toThrow()
  })
})
