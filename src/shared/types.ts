export type TaskStatus =
  | 'idle'
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type FeatureStatus = 'pending' | 'processing' | 'completed' | 'failed'

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
  upscaleStatus?: FeatureStatus
  /** 放大請求的 fal.ai 佇列請求 ID（用於合併計算放大費用） */
  upscaleRequestId?: string
  /** 去背階段狀態 */
  backgroundRemovalStatus?: FeatureStatus
  /** 去背請求的 fal.ai 佇列請求 ID */
  backgroundRemovalRequestId?: string
  /** 縮放階段狀態 */
  resizeStatus?: FeatureStatus
  /** 縮放請求的 fal.ai 佇列請求 ID */
  resizeRequestId?: string
  /** 臉部修復階段狀態 */
  faceRestoreStatus?: FeatureStatus
  /** 臉部修復請求的 fal.ai 佇列請求 ID */
  faceRestoreRequestId?: string
  /** 此張圖片實際產生（或預估）的 fal.ai API 費用（USD） */
  apiCostUsd?: number
  /** 費用幣別（fal 平台目前皆為 USD） */
  apiCostCurrency?: string
  /** true = 預估費用（API Key 無帳務權限或帳務尚未入帳）；false/undefined = 實際扣款金額 */
  apiCostIsEstimated?: boolean
}

/**
 * 模型的計價資訊（整理自 fal.ai 公布的計價資料）。
 *
 * fal 對不同模型採用不同計價單位（每張、每百萬像素、每運算秒、token…），
 * `perImageUsd` 是換算成「生成一張圖片」後的預估金額，`basis` 則保留 fal 原始的計價基準，
 * 讓使用者知道數字怎麼來的。
 */
export interface FalModelPricing {
  /** 生成一張圖片的預估費用（USD）；undefined 表示 fal 未公布可換算的價格 */
  perImageUsd?: number
  /** true = perImageUsd 為換算估算值（例如每百萬像素 × 1024×1024 面積），顯示時會加上 `~` */
  isEstimate?: boolean
  /** fal 公布的計價單位，例如 `images`、`megapixels`、`compute seconds`、`units` */
  unit: string
  /** fal 公布的單位價格（USD）；undefined = 未公布 */
  unitPriceUsd?: number
  /** 計價基準的簡短說明（例如 `$0.03 / MP × 約 1 MP`、`token 用量計價`） */
  basis: string
}

export interface FalVideoDurationSpec {
  /** duration 欄位在 fal.ai OpenAPI schema 的型別 */
  type: 'number' | 'string' | 'seconds_string'
  /** 支援的合法列舉值（若有定義） */
  enum?: (string | number)[]
  min?: number
  max?: number
  default?: string | number
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
  /** 下拉選單的分組（依模型實驗室／來源） */
  group?: string
  /**
   * 文生圖模型 `image_size` 支援的字串列舉值（例如 square / landscape_16_9）。
   * 由 scripts/sync-fal-text-to-image.mjs 依 fal.ai schema 自動產生，送出前依此選擇安全值。
   */
  imageSizeEnum?: string[]
  /**
   * 文生影片模型 `duration` 支援的型別與允許值（由 scripts/sync-fal-text-to-video.mjs 自動產生）
   */
  durationSpec?: FalVideoDurationSpec
  /** 文生影片模型 `aspect_ratio` 支援的列舉值 */
  aspectRatioEnum?: string[]
  /** 文生影片模型 `resolution` 支援的列舉值 */
  resolutionEnum?: string[]
  /** 文生影片模型 `video_size` 支援的列舉值 */
  videoSizeEnum?: string[]
  /** 文生影片模型支援的音效開關欄位名稱 */
  audioField?: 'generate_audio' | 'generate_audio_switch'
  /**
   * 文生圖／文生影片模型支援的「可選參考圖」輸入欄位（例如 `reference_image_url`／`image_url`／`image_urls`）。
   * 未設定表示該模型不支援參考圖。
   */
  referenceImageField?: string
  /** 參考圖欄位是否為陣列（例如 `image_urls`） */
  isArrayReferenceImage?: boolean
  /** 是否必須提供參考圖才能生成（編輯模型若把圖片欄位列為必填） */
  requiresReferenceImage?: boolean
  /** 提示詞要送出的欄位名稱（預設 `prompt`；少數模型使用 `instruction`） */
  promptField?: string
  /** 提示詞是否為必填（未設定視為 true；部分圖生影片模型允許留空） */
  requiresPrompt?: boolean
  /** 圖生影片模型可接收的尾幀／終點圖片欄位（例如 `end_image_url`、`tail_image_url`） */
  endImageField?: string
  /** 圖生影片模型是否必須提供第 2 張圖片作為尾幀（首尾幀過渡模型） */
  requiresEndImage?: boolean
  /**
   * 該模型 OpenAPI schema 不接受的參數名稱，送出 payload 前會自動剔除。
   * 由 scripts/sync-fal-models.mjs 依 fal.ai schema 自動產生。
   */
  unsupportedFields?: string[]
  /**
   * 計價資訊（生成一張圖片的預估金額）。
   * 由 scripts/sync-fal-models.mjs 依 fal.ai 公布價格自動產生；精選模型會沿用同名同步項目的價格。
   */
  pricing?: FalModelPricing
  defaultParams: Record<string, unknown>
}

export interface UpscaleFeatureConfig {
  enabled: boolean
  /** 放大倍率（1~4） */
  factor: number
  /** 創造力（denoise 強度），0~1 */
  creativity: number
  /** 與原圖相似度，0~1 */
  resemblance: number
  guidanceScale: number
  numInferenceSteps: number
  negativePrompt?: string
  seed?: number | null
}

export interface BackgroundRemovalFeatureConfig {
  enabled: boolean
  model: 'General Use (Light)' | 'General Use (Heavy)' | 'Portrait'
  operatingResolution: '1024x1024' | '2048x2048'
  refineForeground: boolean
  outputFormat: 'png' | 'webp' | 'gif'
}

export interface ResizeFeatureConfig {
  enabled: boolean
  width: number
  height: number
  fit: 'cover' | 'contain' | 'fill' | 'inside'
  outputFormat: 'png' | 'jpeg' | 'webp'
}

export interface FaceRestoreFeatureConfig {
  enabled: boolean
  /** 保真度（較高 = 更接近原圖），0~1 */
  fidelity: number
  upscaleFactor: number
  faceUpscale: boolean
  aligned: boolean
  onlyCenterFace: boolean
  seed?: number | null
}

export interface GenerationConfig {
  endpointId: string
  imageInputField: string
  isArrayImageInput: boolean
  /** 是否送出擴散模型參數，未設定時視為 true */
  includeDiffusionParams?: boolean
  /** 目前模型 schema 不接受的參數（由模型目錄提供），送出前會自動剔除 */
  unsupportedFields?: string[]
  prompt: string
  negativePrompt?: string
  strength: number
  numInferenceSteps: number
  guidanceScale: number
  outputFormat: 'png' | 'jpeg' | 'webp'
  seed?: number | null
  customJsonParams?: string
  /** 模型額外參數（僅對應模型會套用） */
  quality?: 'low' | 'medium' | 'high' | 'auto'
  imageSize?: string
  numImages?: number
  safetyTolerance?: string
  scheduler?: string
  /** 後處理功能設定（勾選後會在節點工作流中新增對應節點） */
  upscale: UpscaleFeatureConfig
  backgroundRemoval: BackgroundRemovalFeatureConfig
  resize: ResizeFeatureConfig
  faceRestore: FaceRestoreFeatureConfig
}

export interface AppSettings {
  falApiKey: string
  hasApiKey: boolean
  /** DeepSeek API Key（用於提示詞優化與餘額查詢） */
  deepseekApiKey: string
  hasDeepseekApiKey: boolean
  outputDirectory: string
  concurrency: number
  autoSaveOutput: boolean
  namingPattern: string
  mockMode: boolean
}

/**
 * DeepSeek 提示詞優化結果
 * - ok: true → 成功，prompt 為優化後的英文提示詞
 * - ok: false → 失敗，message 可直接顯示給使用者
 */
export type OptimizePromptResult =
  | { ok: true; prompt: string }
  | { ok: false; message: string }

/** 文字生成圖片支援的畫面比例 */
export type TextToImageAspect = '1:1' | '16:9' | '9:16' | '4:3' | '3:4'

/** 文字生成圖片的請求參數（renderer → main） */
export interface TextToImageRequest {
  endpointId: string
  prompt: string
  aspectId: TextToImageAspect
  numImages: number
  outputFormat: 'png' | 'jpeg'
  seed?: number | null
  /** 參考圖的本機檔案路徑（可多張）；主程序會上傳至 fal.storage 後帶入模型對應欄位 */
  referenceImageFilePaths?: string[]
  /** 參考圖的本機檔案路徑（單張；舊版相容，優先使用 referenceImageFilePaths） */
  referenceImageFilePath?: string
}

/** 對話模式中附加到訊息的圖片 */
export interface TextToImageChatAttachment {
  filePath: string
  fileName: string
  /** 是否提供給 DeepSeek 作為視覺輸入（看圖） */
  forVision: boolean
  /** 是否作為 fal.ai 生成時的參考圖 */
  asReference: boolean
}

/** 對話模式中的一則訊息（renderer → main） */
export interface TextToImageChatMessage {
  role: 'user' | 'assistant'
  content: string
  attachments?: TextToImageChatAttachment[]
}

/** 文字生成圖片「對話模式」的請求參數 */
export interface TextToImageChatRequest {
  messages: TextToImageChatMessage[]
  /** 使用者目前選取的模型；DeepSeek 可依對話需求改用其他模型 */
  endpointId: string
  aspectId: TextToImageAspect
  numImages: number
  outputFormat: 'png' | 'jpeg'
}

/**
 * 文字生成圖片「對話模式」的結果。
 * - action: 'chat' → 只回覆對話，尚未生成
 * - action: 'generate' → DeepSeek 已將任務交接給 fal.ai，並完成指定模型生成
 */
export type TextToImageChatResult =
  | {
      ok: true
      action: 'chat'
      reply: string
      /** DeepSeek 在對話中建議或指定的模型（可由 UI 顯示切換按鈕） */
      suggestedModelId?: string
      /** DeepSeek 推薦的多個模型 id（UI 會在訊息下方為每個推薦模型顯示一鍵切換按鈕） */
      suggestedModelIds?: string[]
      /** true = 使用者明確要求切換模型，UI 應同步更新右側模型選單 */
      applyModelChange?: boolean
      /** DeepSeek 產生的情境化快速回覆，可直接點擊送出 */
      quickReplies?: string[]
    }
  | {
      ok: true
      action: 'generate'
      reply: string
      modelId: string
      modelName: string
      /** DeepSeek 交給 fal.ai 的英文生圖提示詞 */
      prompt: string
      images: TextToImageGeneratedImage[]
      requestId?: string
      /** 本次生成預估費用（USD） */
      costUsd?: number
      costIsEstimated?: boolean
      /** 生成後可點擊的下一步快速回覆 */
      quickReplies?: string[]
    }
  | { ok: false; message: string }

/** 單張文字生成圖片的結果 */
export interface TextToImageGeneratedImage {
  /** 可直接顯示的遠端圖片 URL */
  url: string
  width: number
  height: number
  /** 若有開啟自動存檔，此為本機輸出檔路徑 */
  savedFilePath?: string
}

/** 文字生成圖片的結果 */
export type TextToImageResult =
  | {
      ok: true
      images: TextToImageGeneratedImage[]
      endpointId: string
      requestId?: string
      /** 本次生成預估費用（USD） */
      costUsd?: number
      costIsEstimated?: boolean
    }
  | { ok: false; message: string }

/** 文字生成圖片下載結果（下載到系統「下載」資料夾或使用者指定的位置） */
export type TextToImageDownloadResult =
  | { ok: true; filePath: string }
  | { ok: false; message: string; canceled?: boolean }

/**
 * 應用程式的預設輸出資料夾（main → renderer，TopBar 顯示用）。
 * 各路徑都會在查詢時確保存在。
 */
export interface OutputDirectories {
  /** 影像風格化輸出資料夾：Mac「圖片 / Wishful_Ai_Draw」 */
  stylize: string
  /** 文字生成圖片輸出資料夾：Mac「圖片 / Wishful_Ai_Draw / 文生圖」 */
  textToImage: string
  /** 文字生成影片輸出資料夾：Mac「圖片 / Wishful_Ai_Draw / 文生影片」 */
  textToVideo: string
  /** 圖片生成影片輸出資料夾：Mac「圖片 / Wishful_Ai_Draw / 圖生影片」 */
  imageToVideo: string
}

/** 影片生成支援的畫面比例（文生影片／圖生影片共用） */
export type TextToVideoAspect = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9'

/** 文字生成影片的請求參數（renderer → main） */
export interface TextToVideoRequest {
  endpointId: string
  prompt: string
  aspectId: TextToVideoAspect
  durationSeconds: number
  resolution: string
  generateAudio: boolean
  negativePrompt?: string
  seed?: number | null
  /** 可選參考圖的本機檔案路徑 */
  referenceImageFilePaths?: string[]
  /** 圖片生成影片模式下的來源圖片本機檔案路徑（第 1 張為起點圖，第 2 張可用於尾幀／多圖） */
  imageFilePaths?: string[]
}

/** 圖片生成影片的請求參數 */
export type ImageToVideoRequest = TextToVideoRequest
/** 圖片生成影片「對話模式」的請求參數 */
export type ImageToVideoChatRequest = TextToVideoChatRequest
/** 圖片生成影片的生成結果 */
export type ImageToVideoResult = TextToVideoResult
/** 圖片生成影片「對話模式」的結果 */
export type ImageToVideoChatResult = TextToVideoChatResult
/** 圖片生成影片下載／另存結果 */
export type ImageToVideoDownloadResult = TextToVideoDownloadResult
/** 「圖生影片」資料夾中的一支影片（renderer 顯示用） */
export type ImageToVideoFileEntry = TextToVideoFileEntry
/** 列出「圖生影片」資料夾所有影片的結果 */
export type ImageToVideoListResult = TextToVideoListResult

/** 文字生成影片「對話模式」的請求參數 */
export interface TextToVideoChatRequest {
  messages: TextToImageChatMessage[]
  /** 使用者目前選取的模型；DeepSeek 可依對話需求改用其他模型 */
  endpointId: string
  aspectId: TextToVideoAspect
  durationSeconds: number
  resolution: string
  generateAudio: boolean
}

/** 單支文字生成影片的結果 */
export interface TextToVideoGeneratedVideo {
  /** 可直接顯示的影片 URL（遠端或本機 local-media://） */
  url: string
  width?: number
  height?: number
  duration?: number
  /** 若有開啟自動存檔，此為本機輸出檔路徑 */
  savedFilePath?: string
}

/** 文字生成影片的結果 */
export type TextToVideoResult =
  | {
      ok: true
      videos: TextToVideoGeneratedVideo[]
      endpointId: string
      requestId?: string
      /** 本次生成預估費用（USD） */
      costUsd?: number
      costIsEstimated?: boolean
    }
  | { ok: false; message: string }

/**
 * 文字生成影片「對話模式」的結果。
 * - action: 'chat' → 只回覆對話，尚未生成
 * - action: 'generate' → DeepSeek 已將任務交接給 fal.ai，並完成指定模型生成
 */
export type TextToVideoChatResult =
  | {
      ok: true
      action: 'chat'
      reply: string
      /** DeepSeek 在對話中建議或指定的模型（可由 UI 顯示切換按鈕） */
      suggestedModelId?: string
      /** DeepSeek 推薦的多個模型 id（UI 會在訊息下方為每個推薦模型顯示一鍵切換按鈕） */
      suggestedModelIds?: string[]
      /** true = 使用者明確要求切換模型，UI 應同步更新右側模型選單 */
      applyModelChange?: boolean
      /** DeepSeek 產生的情境化快速回覆，可直接點擊送出 */
      quickReplies?: string[]
    }
  | {
      ok: true
      action: 'generate'
      reply: string
      modelId: string
      modelName: string
      /** DeepSeek 交給 fal.ai 的英文生影片提示詞 */
      prompt: string
      videos: TextToVideoGeneratedVideo[]
      requestId?: string
      /** 本次生成預估費用（USD） */
      costUsd?: number
      costIsEstimated?: boolean
      /** 生成後可點擊的下一步快速回覆 */
      quickReplies?: string[]
    }
  | { ok: false; message: string }

/** 文字生成影片下載／另存結果 */
export type TextToVideoDownloadResult = TextToImageDownloadResult

/** 「文生影片」資料夾中的一支影片（renderer 顯示用） */
export interface TextToVideoFileEntry {
  filePath: string
  /** 可直接播放的本機影片 URL（local-media:// 協定，支援 Range 串流） */
  url: string
  fileName: string
  modifiedAt: number
}

/** 列出「文生影片」資料夾所有影片的結果 */
export type TextToVideoListResult =
  | { ok: true; files: TextToVideoFileEntry[] }
  | { ok: false; message: string }

/** 「文生圖」資料夾中的一張圖片（renderer 顯示用） */
export interface TextToImageFileEntry {
  filePath: string
  /** 可直接顯示的本機圖片 URL（local-media:// 協定） */
  url: string
  fileName: string
  modifiedAt: number
}

/** 列出「文生圖」資料夾所有圖片的結果 */
export type TextToImageListResult =
  | { ok: true; files: TextToImageFileEntry[] }
  | { ok: false; message: string }

/** DeepSeek 帳戶餘額（GET /user/balance） */
export interface DeepSeekBalance {
  /** 目前可用總額（total_balance） */
  totalBalance: number
  /** 幣別代碼，例如 USD / CNY */
  currency: string
  /** 贈送額度 */
  grantedBalance: number
  /** 儲值額度 */
  toppedUpBalance: number
  /** 帳戶是否可用（is_available） */
  isAvailable: boolean
}

/**
 * DeepSeek 餘額查詢結果
 * - ok: false / reason: 'unauthorized' → API Key 無效（401 / 403）
 * - ok: false / reason: 'unavailable' → 網路、5xx 或回應格式不符
 */
export type DeepSeekBalanceResult =
  | { ok: true; balance: DeepSeekBalance }
  | { ok: false; reason: 'unauthorized' | 'unavailable' }

/** fal.ai 帳戶剩餘額度（GET /v1/account/billing?expand=credits） */
export interface FalCreditBalance {
  /** 目前可用額度 */
  currentBalance: number
  /** 幣別代碼，例如 USD */
  currency: string
  /** 帳戶 / 團隊名稱（若 API 有回傳） */
  username?: string
}

/**
 * 額度查詢結果（GET /v1/account/billing?expand=credits）
 * - ok: true → 成功取得餘額
 * - ok: false / reason: 'unauthorized' → API Key 缺少 billing:usage:read 權限（403 / 401）
 * - ok: false / reason: 'unavailable' → 其他失敗（未設定 Key、網路、5xx、回應格式不符）
 */
export type FalCreditBalanceResult =
  | { ok: true; balance: FalCreditBalance }
  | { ok: false; reason: 'unauthorized' | 'unavailable' }

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

/** 產生影片時間軸膠捲縮圖的參數 */
export interface VideoFilmstripOptions {
  filePath: string
  /** 影片總長度（秒），由前端 <video> metadata 提供，避免依賴 ffprobe */
  duration: number
  /** 欲產生的縮圖張數（預設 20，會夾在 8~24 之間） */
  count?: number
}

/** 單張時間軸膠捲縮圖 */
export interface VideoFilmstripThumb {
  /** 此縮圖對應的影片秒數 */
  time: number
  /** 可直接放入 <img src> 的本地媒體 URL */
  imageUrl: string
}

/** 預設模型：GPT Image 2.6 Sunburst（圖生圖端點） */
export const DEFAULT_FAL_MODEL_ID = 'fal-ai/gpt-image-2.6-sunburst/edit'

export const DEFAULT_FAL_PRESETS: FalModelPreset[] = [
  {
    // fal.ai 實際端點 ID 為 fal-ai/gpt-image-2.6-sunburst/edit
    // （網站路徑 /models/openai/gpt-image-2.6/sunburst 不是 API 端點，送 queue.fal.run 會回 404）
    // /edit 為圖生圖端點，必須提供 image_urls（字串陣列）
    id: DEFAULT_FAL_MODEL_ID,
    name: 'GPT Image 2.6 Sunburst (OpenAI)',
    description: 'OpenAI GPT Image 2.6 Sunburst，高品質寫實風格圖片生成與轉換（預設模型）',
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
    id: 'fal-ai/recraft/v3/image-to-image',
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

/**
 * Google 登入後的使用者資訊（來自 Google userinfo 端點）。
 */
export interface GoogleUser {
  /** Google 帳號唯一識別碼（userinfo 的 sub） */
  id: string
  email: string
  name: string
  pictureUrl?: string
}

/** 登入方式：Google OAuth 或序號 */
export type AuthMethod = 'google' | 'serial'

/**
 * 已登入使用者（Google 與序號登入共用）。
 * 序號登入時 `authMethod` 為 `serial`，並以 `serial` 記錄所使用的序號。
 */
export interface AuthUser extends GoogleUser {
  authMethod: AuthMethod
  /** 序號登入使用的序號（僅 authMethod === 'serial' 時有值） */
  serial?: string
  /** 使用者身份（讀自 Google 試算表「工作表3」B 欄，例如「管理員」／「一般使用者」） */
  role?: string
}

/** 序號登入輸入（使用者需自行填寫 Email 與名稱） */
export interface SerialLoginInput {
  serial: string
  email: string
  name: string
}

/** 登入狀態 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

/** 登入狀態與目前使用者 */
export interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  /** 登入或還原工作階段失敗時的錯誤訊息 */
  error?: string
}

/** Google 登入 IPC 回傳結果 */
export type GoogleLoginResult = { ok: true; user: AuthUser } | { ok: false; error: string }

/** 序號登入 IPC 回傳結果 */
export type SerialLoginResult = { ok: true; user: AuthUser } | { ok: false; error: string }

/** 單張圖片生成費用的彙總結果（用於回填雲端試算表） */
export interface UsageCostInfo {
  costUsd: number
  currency: string
  isEstimated: boolean
}

/** 使用記錄事件名稱：正式生成、模擬模式、AI 提示詞優化、文字生成影片 */
export type UsageEventType =
  | 'image_generated'
  | 'image_generated_SIM'
  | 'video_generated'
  | 'Prompt word_optimization'

/**
 * 寫入 Google 雲端試算表的使用記錄。
 * 圖片生成為「每張成功圖片一列」；AI 提示詞優化為「每次優化成功一列」。
 */
export interface UsageRecord {
  /** 完成時間（毫秒 timestamp） */
  timestamp: number
  userEmail: string
  userName: string
  /** 事件名稱：`image_generated`／`image_generated_SIM`／`Prompt word_optimization` */
  eventType: UsageEventType
  /** 圖片檔名；提示詞優化事件改放使用者送出的原始提示詞（已壓成單行） */
  sourceFileName: string
  /** 模型：圖片生成為 fal.ai endpoint ID；提示詞優化為 `deepseek-chat` */
  endpointId: string
  /** 本次事件產生的圖片張數（圖片生成固定 1；提示詞優化不填，試算表留空） */
  imageCount?: number
  /** fal.ai API 費用（USD）；尚未查得時為 undefined */
  costUsd?: number
  costCurrency?: string
  costIsEstimated?: boolean
  status: string
}

