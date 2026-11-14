import { app, shell, BrowserWindow, protocol, nativeImage, screen } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerConfigIpc } from './ipc/config.ipc'
import { registerFileIpc } from './ipc/file.ipc'
import { registerBatchIpc } from './ipc/batch.ipc'
import { registerVideoIpc } from './ipc/video.ipc'
import { registerAuthIpc } from './ipc/auth.ipc'
import { registerPromptIpc } from './ipc/prompt.ipc'
import { registerTextToImageIpc, ensureTextToImageDirectories } from './ipc/textToImage.ipc'
import { registerLocalMediaProtocol } from './services/localMediaProtocol'

/** 取得應用程式圖示路徑（支援開發者模式 npm run dev / preview 與正式打包環境） */
function getAppIconPath(): string | undefined {
  const candidates = [
    join(app.getAppPath(), 'build/icon.png'),
    join(app.getAppPath(), 'resources/icon.png'),
    join(__dirname, '../../build/icon.png'),
    join(__dirname, '../../resources/icon.png'),
    join(process.resourcesPath, 'icon.png')
  ]
  return candidates.find((p) => existsSync(p))
}

// Register custom protocol as privileged for loading local images securely in <img>
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-media',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      bypassCSP: true,
      stream: true
    }
  }
])

function createWindow(): BrowserWindow {
  // 預設以「佔滿整個螢幕」的方式開啟（使用主螢幕可用工作區尺寸，並在顯示時最大化）
  const { width: workWidth, height: workHeight } = screen.getPrimaryDisplay().workAreaSize
  const iconPath = getAppIconPath()
  const windowIcon = iconPath ? nativeImage.createFromPath(iconPath) : undefined

  const mainWindow = new BrowserWindow({
    width: workWidth,
    height: workHeight,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#09090b',
    title: 'Wishful AI Draw',
    icon: windowIcon && !windowIcon.isEmpty() ? windowIcon : iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.wishful.aidraw')

  // 設定 macOS Dock 圖示（確保開發者應用程式與正式版皆顯示一致的應用程式圖示）
  if (process.platform === 'darwin' && app.dock) {
    const dockIconPath = getAppIconPath()
    if (dockIconPath) {
      const dockImage = nativeImage.createFromPath(dockIconPath)
      if (!dockImage.isEmpty()) {
        app.dock.setIcon(dockImage)
      }
    }
  }

  // Handle local-media://image?path=/absolute/path/to/file.png(&thumb=1)
  registerLocalMediaProtocol()

  // 每次啟動都確保「圖片 / Wishful_Ai_Draw / 文生圖」資料夾結構存在
  ensureTextToImageDirectories()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Register IPC handlers
  registerConfigIpc()
  registerFileIpc()
  registerBatchIpc()
  registerVideoIpc()
  registerAuthIpc()
  registerPromptIpc()
  registerTextToImageIpc()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

