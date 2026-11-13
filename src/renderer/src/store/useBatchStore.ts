import { create } from 'zustand'
import {
  AppSettings,
  BatchItem,
  BatchQueueStatus,
  DEFAULT_FAL_PRESETS,
  GenerationConfig,
  SelectedVideoInfo,
  TaskStatus
} from '@shared/types'

export type FilterTab = 'all' | 'idle' | 'active' | 'completed' | 'failed'

interface BatchState {
  items: BatchItem[]
  selectedItemId: string | null
  selectedItemIds: string[]
  filterTab: FilterTab
  isSettingsOpen: boolean
  isVideoTrimmerOpen: boolean
  activeVideo: SelectedVideoInfo | null
  appSettings: AppSettings | null
  generationConfig: GenerationConfig
  queueStatus: BatchQueueStatus

  // Initialization
  initStore: () => Promise< () => void >

  // Item management
  addItems: (newItems: BatchItem[]) => void
  addTasks: (filePaths: string[]) => Promise<BatchItem[]>
  removeItem: (id: string) => void
  clearCompleted: () => void
  clearAll: () => void
  selectItem: (id: string | null) => void
  toggleItemSelected: (id: string) => void
  setItemSelected: (id: string, selected: boolean) => void
  setSelectedItemIds: (ids: string[]) => void
  clearSelection: () => void
  removeItems: (ids: string[]) => Promise<void>
  setFilterTab: (tab: FilterTab) => void
  updateItemCustomPrompt: (id: string, customPrompt: string) => void
  updateItemState: (updatedItem: BatchItem) => void

  // Settings & Model Config
  setSettingsOpen: (open: boolean) => void
  updateAppSettings: (partial: Partial<AppSettings>) => Promise<AppSettings>
  updateGenerationConfig: (partial: Partial<GenerationConfig>) => void
  applyModelPreset: (presetId: string) => void

  // File & Video Import Actions
  importImagesDialog: () => Promise<void>
  importFolderDialog: () => Promise<void>
  importDroppedFiles: (files: FileList | File[]) => Promise<void>
  openVideoDialog: () => Promise<void>
  setVideoTrimmerOpen: (open: boolean, video?: SelectedVideoInfo | null) => void

  // Batch Execution Actions
  startBatch: () => Promise<void>
  pauseBatch: () => Promise<void>
  resumeBatch: () => Promise<void>
  cancelItem: (id: string) => Promise<void>
  cancelAll: () => Promise<void>
  retryFailed: () => Promise<void>
  retrySingleItem: (id: string) => Promise<void>
  setConcurrency: (concurrency: number) => Promise<void>
}

const defaultPreset = DEFAULT_FAL_PRESETS[0]

export const useBatchStore = create<BatchState>((set, get) => ({
  items: [],
  selectedItemId: null,
  selectedItemIds: [],
  filterTab: 'all',
  isSettingsOpen: false,
  isVideoTrimmerOpen: false,
  activeVideo: null,
  appSettings: null,
  generationConfig: {
    endpointId: defaultPreset.id,
    imageInputField: defaultPreset.imageInputField,
    isArrayImageInput: Boolean(defaultPreset.isArrayImageInput),
    includeDiffusionParams: defaultPreset.includeDiffusionParams !== false,
    prompt:
      'Hand-drawn rough graphite and charcoal pencil sketch animation of hands moving, rotoscoped frame-by-frame with a distinct boiling line effect where every single frame has different, jittering pencil strokes. Raw unpolished cross-hatching, visible smudges, stray sketchy outlines, coarse textured sketchbook paper grain, expressive imperfect hand-drawn aesthetic.',
    negativePrompt: 'blurry, low quality, distorted, watermark',
    strength: Number(defaultPreset.defaultParams.strength ?? 0.75),
    numInferenceSteps: Number(defaultPreset.defaultParams.num_inference_steps ?? 28),
    guidanceScale: Number(defaultPreset.defaultParams.guidance_scale ?? 3.5),
    outputFormat: 'png',
    seed: null,
    customJsonParams: '',
    upscaleEnabled: false,
    upscaleFactor: 2
  },
  queueStatus: {
    isRunning: false,
    isPaused: false,
    activeCount: 0,
    completedCount: 0,
    failedCount: 0,
    totalCount: 0
  },

  initStore: async () => {
    const settings = await window.electronAPI.getSettings()
    set({ appSettings: settings })

    const unsubItem = window.electronAPI.onBatchItemUpdated((updatedItem) => {
      get().updateItemState(updatedItem)
    })

    const unsubQueue = window.electronAPI.onBatchQueueStatus((status) => {
      set({ queueStatus: status })
    })

    return () => {
      unsubItem()
      unsubQueue()
    }
  },

  addItems: (newItems) => {
    set((state) => {
      const existingPaths = new Set(state.items.map((i) => i.sourceFilePath))
      const deduplicated = newItems.filter((i) => !existingPaths.has(i.sourceFilePath))
      const merged = [...state.items, ...deduplicated]
      return {
        items: merged,
        selectedItemId: state.selectedItemId ?? (merged[0]?.id || null)
      }
    })
  },

  addTasks: async (filePaths) => {
    if (!filePaths || filePaths.length === 0) return []
    const scannedItems = await window.electronAPI.scanDroppedPaths(filePaths)
    if (scannedItems.length > 0) {
      get().addItems(scannedItems)
      set({ selectedItemId: scannedItems[0].id })
    }
    return scannedItems
  },

  removeItem: (id) => {
    set((state) => {
      const filtered = state.items.filter((item) => item.id !== id)
      const nextSelected =
        state.selectedItemId === id ? (filtered[0]?.id ?? null) : state.selectedItemId
      return {
        items: filtered,
        selectedItemId: nextSelected,
        selectedItemIds: state.selectedItemIds.filter((selectedId) => selectedId !== id)
      }
    })
  },

  clearCompleted: () => {
    set((state) => {
      const filtered = state.items.filter((item) => item.status !== 'completed')
      const nextSelected = filtered.some((i) => i.id === state.selectedItemId)
        ? state.selectedItemId
        : (filtered[0]?.id ?? null)
      const remainingIds = new Set(filtered.map((i) => i.id))
      return {
        items: filtered,
        selectedItemId: nextSelected,
        selectedItemIds: state.selectedItemIds.filter((id) => remainingIds.has(id))
      }
    })
  },

  clearAll: () => {
    set({ items: [], selectedItemId: null, selectedItemIds: [] })
  },

  selectItem: (id) => set({ selectedItemId: id }),

  toggleItemSelected: (id) =>
    set((state) => {
      const selected = state.selectedItemIds.includes(id)
      return {
        selectedItemIds: selected
          ? state.selectedItemIds.filter((selectedId) => selectedId !== id)
          : [...state.selectedItemIds, id]
      }
    }),

  setItemSelected: (id, selected) =>
    set((state) => {
      const alreadySelected = state.selectedItemIds.includes(id)
      if (selected && !alreadySelected) {
        return { selectedItemIds: [...state.selectedItemIds, id] }
      }
      if (!selected && alreadySelected) {
        return { selectedItemIds: state.selectedItemIds.filter((selectedId) => selectedId !== id) }
      }
      return {}
    }),

  setSelectedItemIds: (ids) => set({ selectedItemIds: ids }),

  clearSelection: () => set({ selectedItemIds: [] }),

  removeItems: async (ids) => {
    if (ids.length === 0) return
    const idSet = new Set(ids)

    // 進行中的任務須先通知 main 端中止，避免移除後 main 仍在生成（看不到卻仍扣費）
    const activeItems = get().items.filter(
      (item) =>
        idSet.has(item.id) &&
        (item.status === 'uploading' || item.status === 'queued' || item.status === 'processing')
    )
    if (activeItems.length > 0) {
      await Promise.all(activeItems.map((item) => window.electronAPI.cancelBatchItem(item.id)))
    }

    set((state) => {
      const remaining = state.items.filter((item) => !idSet.has(item.id))
      const singleWasRemoved = state.selectedItemId ? idSet.has(state.selectedItemId) : false
      return {
        items: remaining,
        selectedItemId: singleWasRemoved ? (remaining[0]?.id ?? null) : state.selectedItemId,
        selectedItemIds: state.selectedItemIds.filter((selectedId) => !idSet.has(selectedId))
      }
    })
  },

  setFilterTab: (filterTab) => set({ filterTab }),

  updateItemCustomPrompt: (id, customPrompt) => {
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, customPrompt } : item))
    }))
  },

  updateItemState: (updatedItem) => {
    set((state) => ({
      items: state.items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    }))
  },

  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),

  updateAppSettings: async (partial) => {
    const updated = await window.electronAPI.updateSettings(partial)
    set({ appSettings: updated })
    return updated
  },

  updateGenerationConfig: (partial) => {
    set((state) => ({
      generationConfig: { ...state.generationConfig, ...partial }
    }))
  },

  applyModelPreset: (presetId) => {
    const preset = DEFAULT_FAL_PRESETS.find((p) => p.id === presetId)
    if (!preset) {
      set((state) => ({
        generationConfig: { ...state.generationConfig, endpointId: presetId }
      }))
      return
    }
    set((state) => ({
      generationConfig: {
        ...state.generationConfig,
        endpointId: preset.id,
        imageInputField: preset.imageInputField,
        isArrayImageInput: Boolean(preset.isArrayImageInput),
        includeDiffusionParams: preset.includeDiffusionParams !== false,
        strength:
          typeof preset.defaultParams.strength === 'number'
            ? preset.defaultParams.strength
            : state.generationConfig.strength,
        numInferenceSteps:
          typeof preset.defaultParams.num_inference_steps === 'number'
            ? preset.defaultParams.num_inference_steps
            : state.generationConfig.numInferenceSteps,
        guidanceScale:
          typeof preset.defaultParams.guidance_scale === 'number'
            ? preset.defaultParams.guidance_scale
            : state.generationConfig.guidanceScale
      }
    }))
  },

  importImagesDialog: async () => {
    const items = await window.electronAPI.selectImages()
    if (items.length > 0) {
      get().addItems(items)
    }
  },

  importFolderDialog: async () => {
    const items = await window.electronAPI.selectFolderToImport()
    if (items.length > 0) {
      get().addItems(items)
    }
  },

  importDroppedFiles: async (files) => {
    const paths: string[] = []
    const fileArray = Array.from(files)
    for (const file of fileArray) {
      try {
        const p = window.electronAPI.getPathForFile(file)
        if (p) paths.push(p)
      } catch {
        // fallback if file.path exists
        const legacyPath = (file as unknown as { path?: string }).path
        if (legacyPath) paths.push(legacyPath)
      }
    }
    if (paths.length > 0) {
      const videoExtRegex = /\.(mp4|mov|webm|mkv|avi|m4v)$/i
      const firstVideoPath = paths.find((p) => videoExtRegex.test(p))
      if (firstVideoPath) {
        const fileName = firstVideoPath.split(/[/\\]/).pop() || firstVideoPath
        set({
          activeVideo: {
            filePath: firstVideoPath,
            fileName,
            previewUrl: `local-media://image?path=${encodeURIComponent(firstVideoPath)}`
          },
          isVideoTrimmerOpen: true
        })
      }

      const scannedItems = await window.electronAPI.scanDroppedPaths(paths)
      if (scannedItems.length > 0) {
        get().addItems(scannedItems)
      }
    }
  },

  openVideoDialog: async () => {
    const video = await window.electronAPI.selectVideo()
    if (video) {
      set({
        activeVideo: video,
        isVideoTrimmerOpen: true
      })
    }
  },

  setVideoTrimmerOpen: (open, video) => {
    set((state) => ({
      isVideoTrimmerOpen: open,
      activeVideo: video !== undefined ? video : state.activeVideo
    }))
  },

  startBatch: async () => {
    const { items, generationConfig, appSettings } = get()
    if (!appSettings?.hasApiKey && !appSettings?.mockMode) {
      set({ isSettingsOpen: true })
      return
    }
    const pendingItems = items.filter(
      (i) => i.status === 'idle' || i.status === 'failed' || i.status === 'cancelled'
    )
    if (pendingItems.length === 0) return

    // 每次開始批量生成前，先請使用者選擇本次生成的儲存位置
    const outputDirectory = await window.electronAPI.selectOutputDirectory(
      appSettings?.outputDirectory
    )
    if (!outputDirectory) {
      // 使用者取消選擇資料夾 → 不啟動本次批量生成
      return
    }

    // 更新設定並強制開啟自動儲存，確保所有生成的圖片都寫入所選位置
    const updatedSettings = await window.electronAPI.updateSettings({
      outputDirectory,
      autoSaveOutput: true
    })
    set({ appSettings: updatedSettings })

    await window.electronAPI.startBatch({
      items: pendingItems,
      config: generationConfig
    })
  },

  pauseBatch: async () => {
    await window.electronAPI.pauseBatch()
    set((state) => ({
      queueStatus: { ...state.queueStatus, isPaused: true }
    }))
  },

  resumeBatch: async () => {
    await window.electronAPI.resumeBatch()
    set((state) => ({
      queueStatus: { ...state.queueStatus, isPaused: false }
    }))
  },

  cancelItem: async (id) => {
    await window.electronAPI.cancelBatchItem(id)
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status: 'cancelled' as TaskStatus, progress: 0 } : item
      )
    }))
  },

  cancelAll: async () => {
    await window.electronAPI.cancelAllBatch()
    set((state) => ({
      items: state.items.map((item) =>
        item.status === 'queued' || item.status === 'uploading' || item.status === 'processing'
          ? { ...item, status: 'cancelled' as TaskStatus, progress: 0 }
          : item
      ),
      queueStatus: {
        ...state.queueStatus,
        isRunning: false,
        isPaused: false,
        activeCount: 0
      }
    }))
  },

  retryFailed: async () => {
    const { items, generationConfig } = get()
    const failedItems = items
      .filter((i) => i.status === 'failed' || i.status === 'cancelled')
      .map((i) => ({ ...i, status: 'idle' as TaskStatus, progress: 0, errorMessage: undefined }))

    if (failedItems.length === 0) return

    set((state) => ({
      items: state.items.map((item) =>
        item.status === 'failed' || item.status === 'cancelled'
          ? { ...item, status: 'idle' as TaskStatus, progress: 0, errorMessage: undefined }
          : item
      )
    }))

    await window.electronAPI.startBatch({
      items: failedItems,
      config: generationConfig
    })
  },

  retrySingleItem: async (id) => {
    const { items, generationConfig } = get()
    const target = items.find((i) => i.id === id)
    if (!target) return

    const resetItem: BatchItem = {
      ...target,
      status: 'idle',
      progress: 0,
      errorMessage: undefined
    }

    set((state) => ({
      items: state.items.map((item) => (item.id === id ? resetItem : item))
    }))

    await window.electronAPI.startBatch({
      items: [resetItem],
      config: generationConfig
    })
  },

  setConcurrency: async (concurrency) => {
    await window.electronAPI.setConcurrency(concurrency)
    set((state) => ({
      appSettings: state.appSettings ? { ...state.appSettings, concurrency } : null
    }))
  }
}))

