import { BrowserWindow, ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { BatchItem, BatchQueueStatus, GenerationConfig } from '../../shared/types'
import { getSettingsStore } from '../services/store'
import { BatchQueueEngine } from '../services/batchQueueEngine'

let engineInstance: BatchQueueEngine | null = null

function broadcastToWindows(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload)
    }
  }
}

export function getBatchQueueEngine(): BatchQueueEngine {
  if (!engineInstance) {
    engineInstance = new BatchQueueEngine({
      getSettings: () => getSettingsStore().getSettings(),
      onItemUpdated: (item: BatchItem) => {
        broadcastToWindows(IPC_CHANNELS.EVENT_BATCH_ITEM_UPDATED, item)
      },
      onQueueStatusChanged: (status: BatchQueueStatus) => {
        broadcastToWindows(IPC_CHANNELS.EVENT_BATCH_QUEUE_STATUS, status)
      }
    })
  }
  return engineInstance
}

export function registerBatchIpc(): void {
  ipcMain.handle(
    IPC_CHANNELS.BATCH_START,
    async (_event, payload: { items: BatchItem[]; config: GenerationConfig }) => {
      const engine = getBatchQueueEngine()
      engine.startBatch(payload.items, payload.config)
      return {
        accepted: true,
        count: payload.items.length
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.BATCH_PAUSE, async () => {
    getBatchQueueEngine().pause()
    return { paused: true }
  })

  ipcMain.handle(IPC_CHANNELS.BATCH_RESUME, async () => {
    getBatchQueueEngine().resume()
    return { paused: false }
  })

  ipcMain.handle(IPC_CHANNELS.BATCH_CANCEL_ITEM, async (_event, itemId: string) => {
    getBatchQueueEngine().cancelItem(itemId)
    return { cancelledId: itemId }
  })

  ipcMain.handle(IPC_CHANNELS.BATCH_CANCEL_ALL, async () => {
    getBatchQueueEngine().cancelAll()
    return { cancelledAll: true }
  })

  ipcMain.handle(IPC_CHANNELS.BATCH_SET_CONCURRENCY, async (_event, concurrency: number) => {
    const updated = getSettingsStore().updateSettings({ concurrency })
    getBatchQueueEngine().setConcurrency(updated.concurrency)
    return { concurrency: updated.concurrency }
  })
}
