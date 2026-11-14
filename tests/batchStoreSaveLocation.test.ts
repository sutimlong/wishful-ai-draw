import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppSettings, BatchItem, GenerationConfig, TaskStatus } from '../src/shared/types'

/**
 * 驗證「每次按下開始批量生成後，先選擇儲存位置，並將生成圖片存到該位置」的流程：
 * 1. 有未處理項目時，必須先跳出資料夾選擇對話框（IPC: file:select-output-dir）
 * 2. 使用者取消選擇 → 不啟動批量生成、不改動設定
 * 3. 使用者選擇資料夾 → 以該路徑更新 outputDirectory 並強制開啟 autoSaveOutput，再啟動批量生成
 */

const electronAPI = {
  selectOutputDirectory: vi.fn(),
  updateSettings: vi.fn(),
  startBatch: vi.fn()
}

;(globalThis as unknown as Record<string, unknown>).window = { electronAPI }

function makeItem(id: string, status: TaskStatus = 'idle'): BatchItem {
  return {
    id,
    sourceFilePath: `/tmp/${id}.png`,
    sourceFileName: `${id}.png`,
    sourcePreviewUrl: `local-media://image?path=%2Ftmp%2F${id}.png`,
    status,
    progress: 0
  }
}

const BASE_SETTINGS: AppSettings = {
  falApiKey: 'fal_sk_test_key',
  hasApiKey: true,
  deepseekApiKey: 'sk-deepseek-test',
  hasDeepseekApiKey: true,
  outputDirectory: '/Users/me/Pictures/Wishful_AI_Output',
  concurrency: 2,
  autoSaveOutput: true,
  namingPattern: '{original_name}_ai_{timestamp}',
  mockMode: false
}

const GENERATION_CONFIG: GenerationConfig = {
  endpointId: 'fal-ai/gpt-image-2.6-sunburst/edit',
  imageInputField: 'image_urls',
  isArrayImageInput: true,
  includeDiffusionParams: false,
  prompt: 'a cinematic photo',
  strength: 0.6,
  numInferenceSteps: 28,
  guidanceScale: 3.5,
  outputFormat: 'png',
  upscale: { enabled: false, factor: 2, creativity: 0.35, resemblance: 0.6, guidanceScale: 4, numInferenceSteps: 18 },
  backgroundRemoval: { enabled: false, model: 'General Use (Light)', operatingResolution: '1024x1024', refineForeground: true, outputFormat: 'png' },
  resize: { enabled: false, width: 1024, height: 1024, fit: 'contain', outputFormat: 'png' },
  faceRestore: { enabled: false, fidelity: 0.5, upscaleFactor: 2, faceUpscale: true, aligned: false, onlyCenterFace: false }
}

async function loadStore(items: BatchItem[]) {
  vi.resetModules()
  const mod = await import('../src/renderer/src/store/useBatchStore')
  mod.useBatchStore.setState({
    items: items.map((item) => ({ ...item })),
    appSettings: { ...BASE_SETTINGS },
    generationConfig: { ...GENERATION_CONFIG },
    isSettingsOpen: false
  })
  return mod.useBatchStore
}

describe('useBatchStore.startBatch - 儲存位置選擇流程', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    electronAPI.updateSettings.mockImplementation(async (partial: Partial<AppSettings>) => ({
      ...BASE_SETTINGS,
      ...partial
    }))
    electronAPI.startBatch.mockResolvedValue({ accepted: true, count: 1 })
  })

  it('使用者取消選擇資料夾時，不啟動批量生成也不變更設定', async () => {
    electronAPI.selectOutputDirectory.mockResolvedValue(null)
    const store = await loadStore([makeItem('item-1')])

    await store.getState().startBatch()

    expect(electronAPI.selectOutputDirectory).toHaveBeenCalledTimes(1)
    expect(electronAPI.updateSettings).not.toHaveBeenCalled()
    expect(electronAPI.startBatch).not.toHaveBeenCalled()
  })

  it('選擇資料夾後以該路徑更新輸出目錄、強制開啟自動儲存並啟動批量生成', async () => {
    const chosenDir = '/Volumes/Ext/AI_Batch'
    electronAPI.selectOutputDirectory.mockResolvedValue(chosenDir)
    const store = await loadStore([makeItem('item-1'), makeItem('item-2')])

    await store.getState().startBatch()

    expect(electronAPI.updateSettings).toHaveBeenCalledWith({
      outputDirectory: chosenDir,
      autoSaveOutput: true
    })

    expect(electronAPI.startBatch).toHaveBeenCalledTimes(1)
    const payload = electronAPI.startBatch.mock.calls[0][0]
    expect(payload.items.map((item: BatchItem) => item.id)).toEqual(['item-1', 'item-2'])
    expect(payload.config).toEqual(GENERATION_CONFIG)

    expect(store.getState().appSettings?.outputDirectory).toBe(chosenDir)
    expect(store.getState().appSettings?.autoSaveOutput).toBe(true)
  })

  it('資料夾選擇對話框會以目前的輸出目錄作為預設路徑', async () => {
    electronAPI.selectOutputDirectory.mockResolvedValue('/Volumes/Ext/AI_Batch')
    const store = await loadStore([makeItem('item-1')])

    await store.getState().startBatch()

    expect(electronAPI.selectOutputDirectory).toHaveBeenCalledWith(BASE_SETTINGS.outputDirectory)
  })

  it('沒有待處理項目時不會跳出資料夾選擇對話框', async () => {
    electronAPI.selectOutputDirectory.mockResolvedValue('/Volumes/Ext/AI_Batch')
    const store = await loadStore([makeItem('item-1', 'completed')])

    await store.getState().startBatch()

    expect(electronAPI.selectOutputDirectory).not.toHaveBeenCalled()
    expect(electronAPI.startBatch).not.toHaveBeenCalled()
  })

  it('尚未設定 API Key 且非模擬模式時，先開啟設定視窗而不進入資料夾選擇', async () => {
    const store = await loadStore([makeItem('item-1')])
    store.setState({ appSettings: { ...BASE_SETTINGS, hasApiKey: false, falApiKey: '' } })

    await store.getState().startBatch()

    expect(store.getState().isSettingsOpen).toBe(true)
    expect(electronAPI.selectOutputDirectory).not.toHaveBeenCalled()
    expect(electronAPI.startBatch).not.toHaveBeenCalled()
  })
})
