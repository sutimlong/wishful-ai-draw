import { BrowserWindow, dialog, ipcMain } from 'electron'
import { basename } from 'path'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import {
  SelectedVideoInfo,
  VideoExtractOptions,
  VideoExtractProgress
} from '../../shared/types'
import { toLocalMediaUrl } from './file.ipc'
import { extractFramesFromVideo } from '../services/videoService'

function broadcastVideoProgress(progress: VideoExtractProgress): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.EVENT_VIDEO_PROGRESS, progress)
    }
  }
}

export function registerVideoIpc(): void {
  ipcMain.handle(IPC_CHANNELS.VIDEO_SELECT_FILE, async (): Promise<SelectedVideoInfo | null> => {
    const result = await dialog.showOpenDialog({
      title: '選擇要剪裁並擷取序列圖的影片',
      properties: ['openFile'],
      filters: [
        {
          name: 'Videos',
          extensions: ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v']
        }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    return {
      filePath,
      fileName: basename(filePath),
      previewUrl: toLocalMediaUrl(filePath)
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.VIDEO_EXTRACT_FRAMES,
    async (_event, options: VideoExtractOptions): Promise<string[]> => {
      return extractFramesFromVideo(options, (progress) => {
        broadcastVideoProgress(progress)
      })
    }
  )
}

