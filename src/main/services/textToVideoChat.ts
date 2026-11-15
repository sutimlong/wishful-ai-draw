import { FAL_IMAGE_TO_VIDEO_MODELS } from '../../shared/falImageToVideoModels'
import { formatModelPriceTag } from '../../shared/falPricing'
import {
  DEFAULT_VIDEO_CHAT_QUICK_REPLIES,
  DEFAULT_VIDEO_GENERATE_QUICK_REPLIES
} from '../../shared/chatQuickReplies'
import { FAL_TEXT_TO_VIDEO_MODELS } from '../../shared/falTextToVideoModels'
import type {
  FalModelPreset,
  TextToImageChatMessage,
  TextToVideoChatRequest
} from '../../shared/types'
import type { DeepSeekChatMessage } from './deepSeekService'
import {
  TEXT_TO_IMAGE_CHAT_MAX_VISION_IMAGES,
  buildChatMessagesFromHistory,
  findChatModel,
  parseStructuredChatDecision,
  type TextToImageChatVisionImage
} from './textToImageChat'

/** DeepSeek 回傳的文生影片結構化決策（與文生圖對齊） */
export interface TextToVideoChatDecision {
  action: 'chat' | 'generate'
  reply: string
  prompt: string
  modelId: string
  /** DeepSeek 一次推薦多個模型時的有序 ID 清單 */
  suggestedModelIds?: string[]
  /** 是否使用對話中標記為「參考」的圖片（使用者說不要用時可關閉） */
  useReferenceImages: boolean
  /** 使用者是否明確要求切換模型（true 時 UI 會同步更新模型選單） */
  applyModelChange: boolean
  /** 2～4 個情境化快速回覆，供使用者一鍵送出 */
  quickReplies: string[]
}

function compactDescription(description: string): string {
  const compact = description.replace(/\s+/g, ' ').trim()
  return compact.length > 90 ? `${compact.slice(0, 90)}…` : compact
}

export type VideoChatMode = 'text-to-video' | 'image-to-video'

/** 單一影片生成模型在系統提示詞中的一行摘要 */
export function describeVideoChatModel(
  model: FalModelPreset,
  mode: VideoChatMode = 'text-to-video'
): string {
  const audio = model.audioField ? '支援音效' : '無原生音效'
  const description = compactDescription(model.description)
  if (mode === 'image-to-video') {
    const imageCap = model.isArrayImageInput
      ? '支援多張參考圖'
      : model.requiresEndImage
        ? '必填首幀＋尾幀 2 張圖'
        : model.endImageField
          ? '單張首幀圖（可選第 2 張尾幀）'
          : '單張來源圖片'
    const promptCap = model.requiresPrompt === false ? '提示詞選填' : '需提示詞'
    return `- ${model.id} | ${model.name} | ${model.group ?? '其他'} | ${imageCap} | ${promptCap} | ${audio} | ${formatModelPriceTag(model.pricing)} | ${description}`
  }
  const reference = model.requiresReferenceImage
    ? '必填參考圖'
    : model.referenceImageField
      ? '支援 1 張參考圖'
      : '不支援參考圖'
  return `- ${model.id} | ${model.name} | ${model.group ?? '其他'} | ${reference} | ${audio} | ${formatModelPriceTag(model.pricing)} | ${description}`
}

/** 單一文生影片模型在系統提示詞中的一行摘要 */
export function describeTextToVideoChatModel(model: FalModelPreset): string {
  return describeVideoChatModel(model, 'text-to-video')
}

function countChatImages(messages: TextToImageChatMessage[]): {
  visible: number
  referenceOnly: number
  reference: number
} {
  let visible = 0
  let referenceOnly = 0
  let reference = 0
  const seen = new Set<string>()
  for (const message of messages) {
    for (const attachment of message.attachments ?? []) {
      if (attachment.forVision) visible++
      if (attachment.asReference && !seen.has(attachment.filePath)) {
        seen.add(attachment.filePath)
        reference++
        if (!attachment.forVision) referenceOnly++
      }
    }
  }
  return { visible, referenceOnly, reference }
}

/**
 * 組出影片對話模式的系統提示詞（支援文生影片與圖生影片兩種目錄）。
 */
export function buildVideoChatSystemPrompt(
  request: TextToVideoChatRequest,
  mode: VideoChatMode,
  options: {
    models?: FalModelPreset[]
    selectedModel?: FalModelPreset
  } = {}
): string {
  const isImageToVideo = mode === 'image-to-video'
  const models =
    options.models ?? (isImageToVideo ? FAL_IMAGE_TO_VIDEO_MODELS : FAL_TEXT_TO_VIDEO_MODELS)
  const selectedModel = options.selectedModel
  const counts = countChatImages(request.messages)
  const catalog = models.map((model) => describeVideoChatModel(model, mode)).join('\n')

  return [
    isImageToVideo
      ? '你是 Wishful AI Draw 的 AI 圖生影片創作助理，由 DeepSeek Flash 驅動，支援視覺輸入。'
      : '你是 Wishful AI Draw 的 AI 影片創作助理，由 DeepSeek Flash 驅動，支援視覺輸入。',
    isImageToVideo
      ? '你的任務是與使用者用繁體中文討論如何將來源圖片製作成動態影片、釐清主體動作、運鏡方式、光線變化、節奏與音效，'
      : '你的任務是與使用者用繁體中文討論影片創作、釐清主體動作、運鏡方式、場景光線、節奏與音效，',
    '並在適當的時候把生成影片任務交接給 fal.ai。你可以看到使用者訊息中標記為「看圖」的圖片；',
    isImageToVideo
      ? '標記為「參考」的圖片會作為圖生影片的來源畫面（第 1 張為主圖／首幀，第 2 張為可選尾幀或多圖參考）送給 fal.ai。'
      : '標記為「參考」的圖片會直接提供給 fal.ai 作為生成參考，但不一定會出現在你的視覺輸入中。',
    '',
    '## 對話規則',
    '1. 一律使用繁體中文、自然專業的口吻回覆，reply 請使用純文字，不要 Markdown、不要提到 JSON 或系統提示。',
    '2. 若使用者只是在討論、詢問、比較模型或修改想法，action 設為 "chat"，在 reply 中給出建議或追問；不要擅自生成。若你在回覆中推薦或比較了適合的模型（1～4 個），請務必將推薦模型的 id 依建議順序填入 suggestedModelIds 陣列（並把最優先推薦的填入 modelId），UI 會在訊息下方為每個推薦模型顯示「切換模型」按鈕；若使用者明確要求「改用／切換／指定」某個模型，請將 applyModelChange 設為 true，UI 會立即同步更新模型選單。',
    '3. 只有當使用者明確要求你「現在產生影片」（例如「生成」、「做一段影片」、「開始生成」、「就這個」、「用這個模型做」）時，action 才設為 "generate"；若只是詢問模型、價格、功能、方法或假設性問題（例如「哪個模型適合生成？」），一律使用 "chat"。',
    '4. action 為 "generate" 時：',
    '   - modelId 必須完全等於下方模型清單中的 id。使用者有指定模型時使用該模型；否則依需求挑選最適合的模型。',
    isImageToVideo
      ? '   - 圖生影片必須有至少 1 張標記為「參考」的來源圖片（若所選模型標示必填首幀＋尾幀 2 張圖，則需 2 張）；若尚未提供足額圖片，改用 "chat" 請使用者上傳並開啟「參考」（或推薦單圖模型）。'
      : '   - 若使用者提供生成參考圖，優先選擇支援參考圖的模型；若模型不支援參考圖，改用 "chat" 說明並建議支援參考圖的模型（或詢問是否不使用參考圖）。',
    isImageToVideo
      ? '   - prompt 必須是可直接送給 fal.ai 的英文動態與運鏡提示詞（描述主體動作、鏡頭移動、環境光影與節奏），不要包含「請生成」等指令文字。'
      : '   - prompt 必須是可直接送給 fal.ai 的英文文生影片提示詞，包含主體動作、鏡頭語言（如緩慢推鏡、跟拍）、光影與氛圍，不要包含「請生成」等指令文字。',
    '   - reply 用繁體中文簡短說明你選了哪個模型、為什麼，以及這次生成影片的畫面重點。',
    '5. 系統最多提供最近 6 張標記為「看圖」的圖片；若你看到使用者說「這張圖」但沒有可見圖片，請要求使用者重新上傳並開啟「看圖」。',
    '6. 回覆只包含一個 JSON 物件，不要 markdown code fence，不要任何 JSON 以外的文字。格式：',
    '{"action":"chat"|"generate","reply":"繁體中文回覆","prompt":"英文影片提示詞或空字串","modelId":"最優先模型 id 或空字串","suggestedModelIds":["推薦的模型 id（可 0～4 個）"],"useReferenceImages":true|false,"applyModelChange":true|false,"quickReplies":["好","請繼續"]}',
    'quickReplies 必須是 2～4 個繁體中文短句（每個不超過 20 字），依你的回覆提供使用者下一步最可能點擊的選項；討論階段可用「好」「請繼續」「再具體一點」，生成後可用「再生成一段」「調整鏡頭」「換個模型」。不要編號或加引號。',
    isImageToVideo
      ? '在圖生影片對話中，useReferenceImages 預設為 true（才能把來源圖傳給 fal.ai）；除非使用者明確說不要某張圖，否則不要設為 false。'
      : '若使用者明確表示不要使用先前上傳的參考圖，將 useReferenceImages 設為 false；否則預設 true。',
    '若使用者只是詢問推薦、沒有明確要求切換模型，applyModelChange 請設為 false；只有明確要求切換時才設為 true。',
    '',
    isImageToVideo ? '## fal.ai 可用圖生影片模型' : '## fal.ai 可用文生影片模型',
    isImageToVideo
      ? '格式：id | 名稱 | 分組 | 圖片輸入能力 | 提示詞需求 | 音效能力 | 單價 | 簡介'
      : '格式：id | 名稱 | 分組 | 參考圖能力 | 音效能力 | 單價 | 簡介',
    catalog,
    '',
    '## 目前介面設定',
    `- 使用者目前選取的模型：${selectedModel ? `${selectedModel.name} (${selectedModel.id})` : '未指定'}`,
    `- 畫面比例：${request.aspectId}`,
    `- 影片長度：${request.durationSeconds} 秒`,
    `- 輸出畫質：${request.resolution}`,
    `- 原生音效：${request.generateAudio ? '開啟' : '關閉'}`,
    `- 本輪對話可讓你看到的圖片（最多 ${TEXT_TO_IMAGE_CHAT_MAX_VISION_IMAGES} 張）：${Math.min(
      counts.visible,
      TEXT_TO_IMAGE_CHAT_MAX_VISION_IMAGES
    )} 張`,
    `- 僅供生成參考（你看不到）的圖片：${counts.referenceOnly} 張`,
    isImageToVideo
      ? `- 生成時可使用的來源圖片總數：${counts.reference} 張`
      : `- 生成時可使用的參考圖總數：${counts.reference} 張`,
    '',
    '再次提醒：只輸出 JSON 物件。討論階段 action 用 "chat"；使用者明確要生成時才用 "generate"。'
  ].join('\n')
}

/** 組出文生影片對話模式的系統提示詞 */
export function buildTextToVideoChatSystemPrompt(
  request: TextToVideoChatRequest,
  options: {
    models?: FalModelPreset[]
    selectedModel?: FalModelPreset
  } = {}
): string {
  return buildVideoChatSystemPrompt(request, 'text-to-video', options)
}

/** 組出圖生影片對話模式的系統提示詞 */
export function buildImageToVideoChatSystemPrompt(
  request: TextToVideoChatRequest,
  options: {
    models?: FalModelPreset[]
    selectedModel?: FalModelPreset
  } = {}
): string {
  return buildVideoChatSystemPrompt(request, 'image-to-video', options)
}

/** 組出送往 DeepSeek 的文生影片對話訊息（支援文字＋圖片視覺輸入） */
export function buildTextToVideoChatMessages(
  request: TextToVideoChatRequest,
  systemPrompt: string,
  visionImages: TextToImageChatVisionImage[]
): DeepSeekChatMessage[] {
  return buildChatMessagesFromHistory(request.messages, systemPrompt, visionImages)
}

/** 解析 DeepSeek 的文生影片 JSON 決策（容錯 code fence 與模型名稱／多模型建議） */
export function parseTextToVideoChatDecision(
  rawContent: string,
  validModelIds?: Set<string>
): TextToVideoChatDecision {
  return parseStructuredChatDecision(rawContent, {
    models: FAL_TEXT_TO_VIDEO_MODELS,
    validModelIds,
    defaultGenerateReply: '已為你生成影片。',
    defaultChatReply: '我想再確認一下你的影片需求，請多告訴我一些畫面細節。',
    missingPromptReply: '我還需要更多影片細節才能生成，請再告訴我主體動作、鏡頭語言或風格方向。',
    defaultChatQuickReplies: DEFAULT_VIDEO_CHAT_QUICK_REPLIES,
    defaultGenerateQuickReplies: DEFAULT_VIDEO_GENERATE_QUICK_REPLIES
  })
}

export function findTextToVideoChatModel(modelId: string): FalModelPreset | undefined {
  return findChatModel(modelId, FAL_TEXT_TO_VIDEO_MODELS)
}

/** 解析 DeepSeek 的圖生影片 JSON 決策 */
export function parseImageToVideoChatDecision(
  rawContent: string,
  validModelIds?: Set<string>
): TextToVideoChatDecision {
  return parseStructuredChatDecision(rawContent, {
    models: FAL_IMAGE_TO_VIDEO_MODELS,
    validModelIds,
    defaultGenerateReply: '已依據你的圖片為你生成影片。',
    defaultChatReply: '我想再確認一下你的影片動態需求，請提供圖片並告訴我想要的動作與運鏡。',
    missingPromptReply: '我還需要更多動態與運鏡細節才能生成，請描述希望畫面如何動起來。',
    defaultChatQuickReplies: DEFAULT_VIDEO_CHAT_QUICK_REPLIES,
    defaultGenerateQuickReplies: DEFAULT_VIDEO_GENERATE_QUICK_REPLIES
  })
}

export function findImageToVideoChatModel(modelId: string): FalModelPreset | undefined {
  return findChatModel(modelId, FAL_IMAGE_TO_VIDEO_MODELS)
}
