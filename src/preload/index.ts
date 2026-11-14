import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-channels'
import {
  AppSettings,
  AuthState,
  BatchItem,
  BatchQueueStatus,
  DeepSeekBalanceResult,
  FalCreditBalanceResult,
  GenerationConfig,
  GoogleLoginResult,
  OptimizePromptResult,
  SelectedVideoInfo,
  SerialLoginInput,
  SerialLoginResult,
  TextToImageRequest,
  TextToImageResult,
  TextToImageDownloadResult,
  TextToImageListResult,
  VideoExtractOptions,
  VideoExtractProgress,
  VideoFilmstripOptions,
  VideoFilmstripThumb
} from '../shared/types'

export const electronAPI = {
  // Configuration & API Key
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET),
  updateSettings: (partial: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke(IPC_CHANNELS.CONFIG_UPDATE, partial),
  verifyApiKeyFormat: (key: string): Promise<{ valid: boolean; message: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.CONFIG_VERIFY_KEY, key),
  getApiCreditBalance: (): Promise<FalCreditBalanceResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.ACCOUNT_BILLING),

  // DeepSeek 提示詞優化（金鑰僅存在於 main process）
  optimizePrompt: (prompt: string): Promise<OptimizePromptResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROMPT_OPTIMIZE, prompt),

  // 文字生成圖片（fal.ai 文生圖模型）
  generateTextToImage: (request: TextToImageRequest): Promise<TextToImageResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.TEXT_TO_IMAGE_GENERATE, request),
  downloadTextToImage: (
    payload: { url: string; outputFormat: 'png' | 'jpeg' }
  ): Promise<TextToImageDownloadResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.TEXT_TO_IMAGE_DOWNLOAD, payload),
  listTextToImageOutputs: (): Promise<TextToImageListResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.TEXT_TO_IMAGE_LIST_OUTPUTS),
  copyTextToImageToDownloads: (filePath: string): Promise<TextToImageDownloadResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.TEXT_TO_IMAGE_COPY_TO_DOWNLOADS, filePath),
  saveTextToImageAs: (filePath: string): Promise<TextToImageDownloadResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.TEXT_TO_IMAGE_SAVE_AS, filePath),

  // DeepSeek 目前餘額（TopBar 顯示）
  getDeepSeekBalance: (): Promise<DeepSeekBalanceResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.DEEPSEEK_BALANCE),

  // 登入（強制登入才能使用 App）：Google OAuth 或序號
  getAuthState: (): Promise<AuthState> => ipcRenderer.invoke(IPC_CHANNELS.AUTH_GET_STATE),
  startGoogleLogin: (): Promise<GoogleLoginResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_START_LOGIN),
  loginWithSerial: (input: SerialLoginInput): Promise<SerialLoginResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGIN_WITH_SERIAL, input),
  logout: (): Promise<AuthState> => ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGOUT),
  onAuthChanged: (callback: (state: AuthState) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: AuthState): void => callback(state)
    ipcRenderer.on(IPC_CHANNELS.EVENT_AUTH_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_AUTH_CHANGED, handler)
  },

  // Local Files & Directories
  selectImages: (): Promise<BatchItem[]> => ipcRenderer.invoke(IPC_CHANNELS.FILE_SELECT_IMAGES),
  selectReferenceImage: (): Promise<BatchItem | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SELECT_REFERENCE_IMAGE),
  selectFolderToImport: (): Promise<BatchItem[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SELECT_FOLDER),
  scanDroppedPaths: (paths: string[]): Promise<BatchItem[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SCAN_PATHS, paths),
  selectOutputDirectory: (defaultPath?: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SELECT_OUTPUT_DIR, defaultPath),
  openPathInExplorer: (targetPath: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN_PATH, targetPath),
  getPathForFile: (file: File): string => webUtils.getPathForFile(file),

  // Batch Queue Controls
  startBatch: (payload: {
    items: BatchItem[]
    config: GenerationConfig
  }): Promise<{ accepted: boolean; count: number }> =>
    ipcRenderer.invoke(IPC_CHANNELS.BATCH_START, payload),
  pauseBatch: (): Promise<{ paused: boolean }> => ipcRenderer.invoke(IPC_CHANNELS.BATCH_PAUSE),
  resumeBatch: (): Promise<{ paused: boolean }> => ipcRenderer.invoke(IPC_CHANNELS.BATCH_RESUME),
  cancelBatchItem: (itemId: string): Promise<{ cancelledId: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.BATCH_CANCEL_ITEM, itemId),
  cancelAllBatch: (): Promise<{ cancelledAll: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.BATCH_CANCEL_ALL),
  setConcurrency: (concurrency: number): Promise<{ concurrency: number }> =>
    ipcRenderer.invoke(IPC_CHANNELS.BATCH_SET_CONCURRENCY, concurrency),

  // Event Listeners from Main Process
  onBatchItemUpdated: (callback: (item: BatchItem) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, item: BatchItem): void => callback(item)
    ipcRenderer.on(IPC_CHANNELS.EVENT_BATCH_ITEM_UPDATED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_BATCH_ITEM_UPDATED, handler)
  },
  onBatchQueueStatus: (callback: (status: BatchQueueStatus) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, status: BatchQueueStatus): void =>
      callback(status)
    ipcRenderer.on(IPC_CHANNELS.EVENT_BATCH_QUEUE_STATUS, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_BATCH_QUEUE_STATUS, handler)
  },

  // Video Import & Frame Extraction (8fps FFmpeg)
  selectVideo: (): Promise<SelectedVideoInfo | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.VIDEO_SELECT_FILE),
  extractVideoFrames: (options: VideoExtractOptions): Promise<string[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.VIDEO_EXTRACT_FRAMES, options),
  generateVideoFilmstrip: (options: VideoFilmstripOptions): Promise<VideoFilmstripThumb[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.VIDEO_GENERATE_FILMSTRIP, options),
  onVideoProgress: (callback: (progress: VideoExtractProgress) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: VideoExtractProgress): void =>
      callback(progress)
    ipcRenderer.on(IPC_CHANNELS.EVENT_VIDEO_PROGRESS, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_VIDEO_PROGRESS, handler)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error('Failed to expose electronAPI:', error)
  }
} else {
  // @ts-ignore (fallback if contextIsolation disabled)
  window.electronAPI = electronAPI
}

