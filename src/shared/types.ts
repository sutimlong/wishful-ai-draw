export type TaskStatus =
  | 'idle'
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type UpscaleStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface BatchItem {
  id: string
  sourceFilePath: string
  sourceFileName: string
  sourcePreviewUrl: string
  customPrompt?: string
  status: TaskStatus
  progress: number
  queuePosition?: number
  logs?: string[]
  remoteInputUrl?: string
  outputImageUrl?: string
  savedFilePath?: string
  savedPreviewUrl?: string
  errorMessage?: string
  startedAt?: number
  completedAt?: number
  /** fal.ai 佇列請求 ID，用於查詢該筆請求的帳務費用 */
  requestId?: string
  /** 放大階段狀態（實際放大管線用） */
  upscaleStatus?: UpscaleStatus
  /** 放大請求的 fal.ai 佇列請求 ID（用於合併計算放大費用） */
  upscaleRequestId?: string
  /** 此張圖片實際產生（或預估）的 fal.ai API 費用（USD） */
  apiCostUsd?: number
  /** 費用幣別（fal 平台目前皆為 USD） */
  apiCostCurrency?: string
  /** true = 預估單價（API Key 無帳務權限或帳務尚未入帳）；false/undefined = 實際扣款金額 */
  apiCostIsEstimated?: boolean
}

export interface FalModelPreset {
  id: string
  name: string
  description: string
  imageInputField: string
  isArrayImageInput?: boolean
  /**
   * 是否支援擴散模型參數 (strength / num_inference_steps / guidance_scale / negative_prompt)。
   * OpenAI GPT Image 系列等模型為 false，payload 將只送出原生支援的參數。
   * 未設定時視為 true。
   */
  includeDiffusionParams?: boolean
  defaultParams: Record<string, unknown>
}

export interface GenerationConfig {
  endpointId: string
  imageInputField: string
  isArrayImageInput: boolean
  /** 是否送出擴散模型參數，未設定時視為 true */
  includeDiffusionParams?: boolean
  prompt: string
  negativePrompt?: string
  strength: number
  numInferenceSteps: number
  guidanceScale: number
  outputFormat: 'png' | 'jpeg' | 'webp'
  seed?: number | null
  customJsonParams?: string
  /** 是否在生成完成後放大圖片（目前階段先於節點工作流顯示） */
  upscaleEnabled: boolean
  /** 放大倍率（2 或 4） */
  upscaleFactor: number
}

export interface AppSettings {
  falApiKey: string
  hasApiKey: boolean
  outputDirectory: string
  concurrency: number
  autoSaveOutput: boolean
  namingPattern: string
  mockMode: boolean
}

export interface BatchQueueStatus {
  isRunning: boolean
  isPaused: boolean
  activeCount: number
  completedCount: number
  failedCount: number
  totalCount: number
}

export interface VideoExtractOptions {
  filePath: string
  startTime: number
  endTime: number
  fps?: number
}

export interface VideoExtractProgress {
  filePath: string
  percent: number
  currentFps?: number
  timemark?: string
  statusText?: string
}

export interface SelectedVideoInfo {
  filePath: string
  fileName: string
  previewUrl: string
}

export const DEFAULT_FAL_PRESETS: FalModelPreset[] = [
  {
    // fal.ai 實際端點 ID 為 fal-ai/gpt-image-2.6-sunburst/edit
    // （網站路徑 /models/openai/gpt-image-2.6/sunburst 不是 API 端點，送 queue.fal.run 會回 404）
    // /edit 為圖生圖端點，必須提供 image_urls（字串陣列）
    id: 'fal-ai/gpt-image-2.6-sunburst/edit',
    name: 'GPT Image 2.6 Sunburst (OpenAI)',
    description: 'OpenAI GPT Image 2.6 Sunburst，高品質寫實風格圖片生成與轉換',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    defaultParams: {}
  },
  {
    id: 'fal-ai/gpt-image-2.6-flare/edit',
    name: 'GPT Image 2.6 Flare (OpenAI)',
    description: 'OpenAI GPT Image 2.6 Flare，創意風格化視覺轉換',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux/dev/image-to-image',
    name: 'FLUX.1 [dev] Image-to-Image',
    description: '高品質圖片轉圖片生成，適合風格轉換與細節重繪',
    imageInputField: 'image_url',
    defaultParams: {
      strength: 0.75,
      num_inference_steps: 28,
      guidance_scale: 3.5
    }
  },
  {
    id: 'fal-ai/flux-pro/kontext',
    name: 'FLUX.1 Kontext [pro]',
    description: '基於上下文與指令的精準圖片編輯與局部修改模型',
    imageInputField: 'image_url',
    defaultParams: {
      guidance_scale: 3.5,
      num_inference_steps: 28
    }
  },
  {
    id: 'fal-ai/recraft-v3/image-to-image',
    name: 'Recraft V3 Image-to-Image',
    description: '適合插畫、向量設計與商業視覺重繪',
    imageInputField: 'image_url',
    defaultParams: {
      strength: 0.7
    }
  },
  {
    id: 'fal-ai/clarity-upscaler',
    name: 'Clarity Upscaler (AI 高清放大)',
    description: '批量將低解析度圖片進行 AI 超解析度放大與細節增強',
    imageInputField: 'image_url',
    defaultParams: {
      upscale_factor: 2,
      creativity: 0.35
    }
  }
]

