import { dialog, ipcMain, shell } from 'electron'
import { existsSync, readdirSync, statSync } from 'fs'
import { basename, extname, join } from 'path'
import { randomUUID } from 'crypto'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { BatchItem } from '../../shared/types'
import { ensureOutputDirectories, getOutputRootDirectory } from '../services/outputDirectories'

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

export function toLocalMediaUrl(filePath: string): string {
  return `local-media://image?path=${encodeURIComponent(filePath)}`
}

export function createBatchItemFromPath(filePath: string): BatchItem {
  return {
    id: randomUUID(),
    sourceFilePath: filePath,
    sourceFileName: basename(filePath),
    sourcePreviewUrl: toLocalMediaUrl(filePath),
    status: 'idle',
    progress: 0
  }
}

function collectImagesFromPath(targetPath: string): string[] {
  const results: string[] = []
  if (!existsSync(targetPath)) return results

  try {
    const stat = statSync(targetPath)
    if (stat.isFile()) {
      const ext = extname(targetPath).toLowerCase()
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        results.push(targetPath)
      }
    } else if (stat.isDirectory()) {
      const entries = readdirSync(targetPath, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue
        const fullPath = join(targetPath, entry.name)
        if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase()
          if (SUPPORTED_EXTENSIONS.has(ext)) {
            results.push(fullPath)
          }
        }
      }
    }
  } catch (err) {
    console.error('Error scanning path:', targetPath, err)
  }

  return results
}

export function registerFileIpc(): void {
  ipcMain.handle(IPC_CHANNELS.FILE_SELECT_IMAGES, async () => {
    const result = await dialog.showOpenDialog({
      title: '選擇要批量處理的圖片',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return []
    }

    return result.filePaths.map(createBatchItemFromPath)
  })

  // 選擇參考圖（文字生成圖片頁面使用；可一次選多張）
  ipcMain.handle(IPC_CHANNELS.FILE_SELECT_REFERENCE_IMAGES, async () => {
    const result = await dialog.showOpenDialog({
      title: '選擇參考圖（可多選）',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return []
    }

    return result.filePaths.map(createBatchItemFromPath)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      title: '選擇包含圖片的資料夾',
      properties: ['openDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return []
    }

    const folderPath = result.filePaths[0]
    const imagePaths = collectImagesFromPath(folderPath)
    return imagePaths.map(createBatchItemFromPath)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_SCAN_PATHS, (_event, paths: string[]) => {
    const allImages: string[] = []
    for (const p of paths) {
      allImages.push(...collectImagesFromPath(p))
    }
    const uniquePaths = Array.from(new Set(allImages))
    return uniquePaths.map(createBatchItemFromPath)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_SELECT_OUTPUT_DIR, async (_event, defaultPath?: string) => {
    // 確保「圖片 / Wishful_Ai_Draw / 文生圖」存在後，再以它作為對話框的預設位置
    ensureOutputDirectories()
    const preferredPath =
      defaultPath && existsSync(defaultPath) ? defaultPath : getOutputRootDirectory()

    const result = await dialog.showOpenDialog({
      title: '選擇 AI 生成圖片的儲存位置',
      buttonLabel: '儲存到此資料夾',
      defaultPath: preferredPath,
      properties: ['openDirectory', 'createDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })

  // 取得（並確保存在）應用程式的預設輸出資料夾，TopBar 顯示用
  ipcMain.handle(IPC_CHANNELS.FILE_GET_OUTPUT_DIRECTORIES, () => {
    return ensureOutputDirectories()
  })

  ipcMain.handle(IPC_CHANNELS.FILE_OPEN_PATH, async (_event, targetPath: string) => {
    if (!targetPath || !existsSync(targetPath)) {
      return false
    }
    const stat = statSync(targetPath)
    if (stat.isFile()) {
      shell.showItemInFolder(targetPath)
    } else {
      await shell.openPath(targetPath)
    }
    return true
  })
}

