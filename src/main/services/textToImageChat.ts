import { formatModelPriceTag } from '../../shared/falPricing'
import { FAL_TEXT_TO_IMAGE_MODELS } from '../../shared/falTextToImageModels'
import {
  DEFAULT_IMAGE_CHAT_QUICK_REPLIES,
  DEFAULT_IMAGE_GENERATE_QUICK_REPLIES,
  normalizeQuickReplies
} from '../../shared/chatQuickReplies'
import type {
  FalModelPreset,
  TextToImageChatMessage,
  TextToImageChatRequest
} from '../../shared/types'
import type {
  DeepSeekChatContentPart,
  DeepSeekChatMessage
} from './deepSeekService'

/** 單次送給 DeepSeek 看圖的圖片上限（避免請求過大） */
export const TEXT_TO_IMAGE_CHAT_MAX_VISION_IMAGES = 6

/** 對話中要提供給 DeepSeek 的圖片（已轉成 data URL） */
export interface TextToImageChatVisionImage {
  messageIndex: number
  fileName: string
  dataUrl: string
}

/** 對話中標記為可看圖的圖片目標（尚未轉成 data URL） */
export interface TextToImageChatVisionTarget {
  messageIndex: number
  filePath: string
  fileName: string
}

/** DeepSeek 回傳的結構化決策 */
export interface TextToImageChatDecision {
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

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** 正規化模型顯示名稱（移除精選星號與能力標註，便於寬鬆比對） */
export function normalizeChatModelLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/^★\s*/u, '')
    .replace(/（可參考圖）\s*$/u, '')
    .trim()
}

/** 依模型 id 或顯示名稱從清單尋找對應模型（不區分大小寫與前綴星號） */
export function findChatModel(
  value: string | undefined,
  models: FalModelPreset[]
): FalModelPreset | undefined {
  const target = (value ?? '').trim()
  if (!target) return undefined

  const lower = target.toLowerCase()
  const direct = models.find((model) => model.id.toLowerCase() === lower)
  if (direct) return direct

  const wantsReference = target.includes('可參考圖')
  const normalizedTarget = normalizeChatModelLabel(target)
  const byName = models.filter((model) => normalizeChatModelLabel(model.name) === normalizedTarget)
  if (byName.length > 0) {
    if (wantsReference) {
      return byName.find((model) => Boolean(model.referenceImageField)) ?? byName[0]
    }
    return byName[0]
  }

  // 支援省略「· sub-id」後綴的短名稱（限唯一匹配）
  const shortMatches = models.filter((model) => {
    const baseName = normalizeChatModelLabel(model.name).split(' · ')[0]?.trim()
    return baseName === normalizedTarget
  })
  return shortMatches.length === 1 ? shortMatches[0] : undefined
}

/** 解析單一欄位中的模型 id／名稱清單（支援陣列或以逗號、頓號分隔的字串） */
export function collectChatModelCandidates(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(normalizeString).filter(Boolean)
  }
  const single = normalizeString(value)
  if (!single) return []
  if (/[,，、|\n]/.test(single)) {
    return single
      .split(/[,，、|\n]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return [single]
}

const ASCII_ALPHA_NUM = /[a-z0-9]/i
const MODEL_ID_CHAR = /[a-z0-9_./-]/i
const NEGATIVE_PREFIX_RE = /(?:不推薦|不建議|不適合|不要用|不要選|避免使用|避免選用|排除)[^，。！？\n]*$/
const NEGATIVE_SUFFIX_RE = /^\s*(?:（[^）]*）|\([^)]*\))?\s*(?:並不|並未|不支援|不適合|不建議|無法)/

function isBoundaryMatch(text: string, start: number, end: number, isId: boolean): boolean {
  const prev = start > 0 ? text[start - 1] : ''
  const next = end < text.length ? text[end] : ''
  if (isId) {
    return (!prev || !MODEL_ID_CHAR.test(prev)) && (!next || !MODEL_ID_CHAR.test(next))
  }
  if (prev && ASCII_ALPHA_NUM.test(prev)) return false
  if (next && (ASCII_ALPHA_NUM.test(next) || (next === '.' && ASCII_ALPHA_NUM.test(text[end + 1] ?? '')))) {
    return false
  }
  return true
}

const POSITIVE_PIVOT_RE = /(?<!不)(?:建議|推薦|改用|改試|可選)/g

function isNegativeContext(reply: string, start: number, end: number): boolean {
  const before = reply.slice(0, start)
  const lastSentenceStart = Math.max(
    before.lastIndexOf('。'),
    before.lastIndexOf('！'),
    before.lastIndexOf('？'),
    before.lastIndexOf('；'),
    before.lastIndexOf(';'),
    before.lastIndexOf('\n')
  )
  const clause = before.slice(lastSentenceStart + 1)
  // 若同句中前面是否定詞、後面卻緊接著肯定推薦轉折詞（排除「不建議」等否定複合詞），代表進入正面推薦子句
  let positivePivot = -1
  for (const match of clause.matchAll(POSITIVE_PIVOT_RE)) {
    positivePivot = match.index ?? positivePivot
  }
  const negMatch = clause.match(NEGATIVE_PREFIX_RE)
  if (negMatch && (negMatch.index ?? -1) > positivePivot) {
    return true
  }
  const after = reply.slice(end, end + 24)
  return NEGATIVE_SUFFIX_RE.test(after)
}

/**
 * 從 DeepSeek 純文字回覆中擷取被明確點名推薦的模型（依出現順序排序，略過目前模型與否定提及）。
 * 僅使用完整 model.id 或目錄中唯一的不重複模型名稱，避免短關鍵字誤判。
 */
export function extractRecommendedModelsFromReply(
  reply: string,
  models: FalModelPreset[],
  excludeEndpointId?: string,
  limit: number = 4
): FalModelPreset[] {
  const text = reply.trim()
  if (!text) return []

  const lowerText = text.toLowerCase()
  const occupied: Array<[number, number]> = []
  const hits: Array<{ index: number; model: FalModelPreset }> = []

  const overlapsOccupied = (start: number, end: number): boolean =>
    occupied.some(([s, e]) => start < e && end > s)

  const recordHit = (start: number, end: number, model: FalModelPreset): void => {
    occupied.push([start, end])
    if (excludeEndpointId && model.id === excludeEndpointId) return
    if (isNegativeContext(text, start, end)) return
    hits.push({ index: start, model })
  }

  // 1) 優先比對完整 fal.ai endpoint id（最長優先，避免前綴重疊）
  const sortedById = [...models].sort((a, b) => b.id.length - a.id.length)
  for (const model of sortedById) {
    const needle = model.id.toLowerCase()
    let from = 0
    while (from < lowerText.length) {
      const idx = lowerText.indexOf(needle, from)
      if (idx < 0) break
      const end = idx + needle.length
      if (!overlapsOccupied(idx, end) && isBoundaryMatch(lowerText, idx, end, true)) {
        recordHit(idx, end, model)
        break
      }
      from = idx + 1
    }
  }

  // 2) 比對在目錄中唯一出現的模型名稱（最長優先）
  const labelCounts = new Map<string, number>()
  const labelEntries: Array<{ label: string; model: FalModelPreset }> = []
  for (const model of models) {
    const full = normalizeChatModelLabel(model.name)
    if (full.length >= 4) {
      labelCounts.set(full, (labelCounts.get(full) ?? 0) + 1)
      labelEntries.push({ label: full, model })
    }
    if (full.includes(' · ')) {
      const prefix = full.split(' · ')[0]?.trim()
      if (prefix && prefix.length >= 4 && prefix !== full) {
        labelCounts.set(prefix, (labelCounts.get(prefix) ?? 0) + 1)
        labelEntries.push({ label: prefix, model })
      }
    }
  }

  const uniqueLabels = labelEntries
    .filter((entry) => labelCounts.get(entry.label) === 1)
    .sort((a, b) => b.label.length - a.label.length)

  for (const { label, model } of uniqueLabels) {
    let from = 0
    while (from < lowerText.length) {
      const idx = lowerText.indexOf(label, from)
      if (idx < 0) break
      const end = idx + label.length
      if (!overlapsOccupied(idx, end) && isBoundaryMatch(lowerText, idx, end, false)) {
        recordHit(idx, end, model)
        break
      }
      from = idx + 1
    }
  }

  hits.sort((a, b) => a.index - b.index)
  const deduped: FalModelPreset[] = []
  const seenIds = new Set<string>()
  for (const hit of hits) {
    if (seenIds.has(hit.model.id)) continue
    seenIds.add(hit.model.id)
    deduped.push(hit.model)
    if (deduped.length >= limit) break
  }
  return deduped
}

/**
 * 彙整「切換模型按鈕」要顯示的推薦模型清單：
 * 先納入 JSON 明確指定的 modelId／suggestedModelIds，若不足 2 個再從 reply 補齊清楚推薦的模型。
 */
export function resolveChatSuggestedModels(params: {
  decision: Pick<TextToImageChatDecision, 'modelId' | 'suggestedModelIds' | 'reply'>
  models: FalModelPreset[]
  currentEndpointId: string
  limit?: number
}): {
  suggestedModelId?: string
  suggestedModelIds?: string[]
} {
  const { decision, models, currentEndpointId, limit = 4 } = params
  const resolved: FalModelPreset[] = []
  const seen = new Set<string>()

  const pushModel = (model: FalModelPreset | undefined): void => {
    if (!model || model.id === currentEndpointId || seen.has(model.id)) return
    seen.add(model.id)
    resolved.push(model)
  }

  const explicitCandidates = [
    ...(decision.suggestedModelIds ?? []),
    ...(decision.modelId ? [decision.modelId] : [])
  ]
  for (const candidate of explicitCandidates) {
    pushModel(findChatModel(candidate, models))
  }

  // DeepSeek 若未在 JSON 填入完整 suggestedModelIds 陣列（或只填了單一 modelId），
  // 再從回覆文本中補齊明確推薦的其他模型（例如「推薦 A 或 B」）。
  const hasExplicitMultiList = (decision.suggestedModelIds?.length ?? 0) >= 2
  if (!hasExplicitMultiList && resolved.length < limit) {
    const fromReply = extractRecommendedModelsFromReply(
      decision.reply,
      models,
      currentEndpointId,
      limit
    )
    for (const model of fromReply) {
      pushModel(model)
      if (resolved.length >= limit) break
    }
  }

  if (resolved.length === 0) return {}
  const ids = resolved.slice(0, limit).map((model) => model.id)
  return {
    suggestedModelId: ids[0],
    suggestedModelIds: ids
  }
}

function compactDescription(description: string): string {
  const compact = description.replace(/\s+/g, ' ').trim()
  return compact.length > 100 ? `${compact.slice(0, 100)}…` : compact
}

/** 單一模型在系統提示詞中的一行摘要 */
export function describeTextToImageChatModel(model: FalModelPreset): string {
  const reference = model.requiresReferenceImage
    ? '必填參考圖'
    : model.referenceImageField
      ? model.isArrayReferenceImage
        ? '支援多張參考圖'
        : '支援 1 張參考圖'
      : '不支援參考圖'
  const description = compactDescription(model.description)
  return `- ${model.id} | ${model.name} | ${model.group ?? '其他'} | ${reference} | ${formatModelPriceTag(model.pricing)} | ${description}`
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
 * 組出對話模式的系統提示詞。
 * 模型目錄會完整提供給 DeepSeek，讓它能從 UI 同一份清單中挑選模型並交接給 fal.ai。
 */
export function buildTextToImageChatSystemPrompt(
  request: TextToImageChatRequest,
  options: {
    models?: FalModelPreset[]
    selectedModel?: FalModelPreset
  } = {}
): string {
  const models = options.models ?? FAL_TEXT_TO_IMAGE_MODELS
  const selectedModel = options.selectedModel
  const counts = countChatImages(request.messages)
  const catalog = models.map(describeTextToImageChatModel).join('\n')

  return [
    '你是 Wishful AI Draw 的 AI 影像創作助理，由 DeepSeek Flash 驅動，支援視覺輸入。',
    '你的任務是與使用者用繁體中文討論影像創作，釐清主體、構圖、風格、光線、文字與限制，',
    '並在適當的時候把生圖任務交接給 fal.ai。你可以看到使用者訊息中標記為「看圖」的圖片；',
    '標記為「參考」的圖片會直接提供給 fal.ai 作為生成參考，但不一定會出現在你的視覺輸入中。',
    '',
    '## 對話規則',
    '1. 一律使用繁體中文、自然專業的口吻回覆，reply 請使用純文字，不要 Markdown、不要提到 JSON 或系統提示。',
    '2. 若使用者只是在討論、詢問、比較模型或修改想法，action 設為 "chat"，在 reply 中給出建議或追問；不要擅自生成。若你在回覆中推薦或比較了適合的模型（1～4 個），請務必將推薦模型的 id 依建議順序填入 suggestedModelIds 陣列（並把最優先推薦的填入 modelId），UI 會在訊息下方為每個推薦模型顯示「切換模型」按鈕；若使用者明確要求「改用／切換／指定」某個模型，請將 applyModelChange 設為 true，UI 會立即同步更新模型選單。',
    '3. 只有當使用者明確要求你「現在產生圖片」（例如「生成」、「畫一張」、「開始產圖」、「就這個」、「用這個模型做」）時，action 才設為 "generate"；若只是詢問模型、價格、功能、方法或假設性問題（例如「哪個模型適合生成？」），一律使用 "chat"。',
    '4. action 為 "generate" 時：',
    '   - modelId 必須完全等於下方模型清單中的 id。使用者有指定模型時使用該模型；否則依需求挑選最適合的模型。',
    '   - 若使用者提供生成參考圖，優先選擇支援參考圖的模型；若模型要求參考圖，必須確認已有參考圖。',
    '   - prompt 必須是可直接送給 fal.ai 的英文生圖提示詞，整合對話中已確認的主體、構圖、光線、風格與限制，不要包含「請生成」等指令文字。',
    '   - reply 用繁體中文簡短說明你選了哪個模型、為什麼，以及這次生成的畫面重點。',
    '   - 若資訊不足、模型不支援必要條件或需要使用者確認，改用 action "chat" 追問或說明，不要生成。',
    '5. 系統最多提供最近 6 張標記為「看圖」的圖片；若你看到使用者說「這張圖」但沒有可見圖片，請要求使用者重新上傳並開啟「看圖」。',
    '6. 回覆只包含一個 JSON 物件，不要 markdown code fence，不要任何 JSON 以外的文字。格式：',
    '{"action":"chat"|"generate","reply":"繁體中文回覆","prompt":"英文生圖提示詞或空字串","modelId":"最優先模型 id 或空字串","suggestedModelIds":["推薦的模型 id（可 0～4 個）"],"useReferenceImages":true|false,"applyModelChange":true|false,"quickReplies":["好","請繼續"]}',
    'quickReplies 必須是 2～4 個繁體中文短句（每個不超過 20 字），依你的回覆提供使用者下一步最可能點擊的選項；討論階段可用「好」「請繼續」「再具體一點」，生成後可用「再生成一張」「調整風格」「換個模型」。不要編號或加引號。',
    '若使用者明確表示不要使用先前上傳的參考圖，將 useReferenceImages 設為 false；否則預設 true。',
    '若使用者只是詢問推薦、沒有明確要求切換模型，applyModelChange 請設為 false；只有明確要求切換時才設為 true。',
    '',
    '## fal.ai 可用模型',
    '格式：id | 名稱 | 分組 | 參考圖能力 | 單張預估價 | 簡介',
    catalog,
    '',
    '## 目前介面設定',
    `- 使用者目前選取的模型：${selectedModel ? `${selectedModel.name} (${selectedModel.id})` : '未指定'}`,
    `- 畫面比例：${request.aspectId}`,
    `- 生成張數：${request.numImages}`,
    `- 輸出格式：${request.outputFormat}`,
    `- 本輪對話可讓你看到的圖片（最多 ${TEXT_TO_IMAGE_CHAT_MAX_VISION_IMAGES} 張）：${Math.min(
      counts.visible,
      TEXT_TO_IMAGE_CHAT_MAX_VISION_IMAGES
    )} 張`,
    `- 僅供生成參考（你看不到）的圖片：${counts.referenceOnly} 張`,
    `- 生成時可使用的參考圖總數：${counts.reference} 張`,
    '',
    '再次提醒：只輸出 JSON 物件。討論階段 action 用 "chat"；使用者明確要生成時才用 "generate"。'
  ].join('\n')
}


/** 依對話歷史與看圖清單組出送往 DeepSeek 的訊息陣列（文生圖／文生影片共用） */
export function buildChatMessagesFromHistory(
  chatMessages: TextToImageChatMessage[],
  systemPrompt: string,
  visionImages: TextToImageChatVisionImage[]
): DeepSeekChatMessage[] {
  const messages: DeepSeekChatMessage[] = [{ role: 'system', content: systemPrompt }]

  for (let index = 0; index < chatMessages.length; index++) {
    const message = chatMessages[index]
    if (message.role === 'assistant') {
      if (message.content.trim()) {
        messages.push({ role: 'assistant', content: message.content.trim() })
      }
      continue
    }

    const images = visionImages.filter((image) => image.messageIndex === index)
    const text = message.content.trim()
    if (images.length === 0) {
      messages.push({ role: 'user', content: text || '請看我上傳的圖片。' })
      continue
    }

    const parts: DeepSeekChatContentPart[] = []
    if (text) parts.push({ type: 'text', text })
    images.forEach((image, imageIndex) => {
      parts.push({ type: 'text', text: `[圖片 ${imageIndex + 1}：${image.fileName}]` })
      parts.push({
        type: 'image_url',
        image_url: { url: image.dataUrl, detail: 'auto' }
      })
    })
    messages.push({ role: 'user', content: parts })
  }

  return messages
}

/** 組出送往 DeepSeek 的對話訊息（使用者訊息可包含文字＋圖片內容片段） */
export function buildTextToImageChatMessages(
  request: TextToImageChatRequest,
  systemPrompt: string,
  visionImages: TextToImageChatVisionImage[]
): DeepSeekChatMessage[] {
  return buildChatMessagesFromHistory(request.messages, systemPrompt, visionImages)
}

export interface ParseStructuredChatDecisionOptions {
  models?: FalModelPreset[]
  validModelIds?: Set<string>
  defaultGenerateReply: string
  defaultChatReply: string
  missingPromptReply: string
  /** DeepSeek 未提供 quickReplies 時使用的預設快速回覆 */
  defaultChatQuickReplies?: string[]
  defaultGenerateQuickReplies?: string[]
}

/** 共用 DeepSeek 對話 JSON 決策解析器（文生圖／文生影片共用） */
export function parseStructuredChatDecision(
  rawContent: string,
  options: ParseStructuredChatDecisionOptions
): TextToImageChatDecision {
  const {
    models,
    validModelIds,
    defaultGenerateReply,
    defaultChatReply,
    missingPromptReply,
    defaultChatQuickReplies = DEFAULT_IMAGE_CHAT_QUICK_REPLIES,
    defaultGenerateQuickReplies = DEFAULT_IMAGE_GENERATE_QUICK_REPLIES
  } = options

  const normalizeCandidate = (value: string): string => {
    if (!value) return ''
    const resolvedId = models ? (findChatModel(value, models)?.id ?? value) : value
    if (validModelIds && !validModelIds.has(resolvedId)) return ''
    return resolvedId
  }

  const raw = typeof rawContent === 'string' ? rawContent.trim() : ''
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1].trim() : raw
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')

  if (start >= 0 && end > start) {
    try {
      const parsed = JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>
      const action =
        normalizeString(parsed.action).toLowerCase() === 'generate' ? 'generate' : 'chat'
      const reply = normalizeString(parsed.reply)
      const prompt = normalizeString(parsed.prompt)

      const primaryCandidates = [
        ...collectChatModelCandidates(parsed.modelId),
        ...collectChatModelCandidates(parsed.suggestedModelId),
        ...collectChatModelCandidates(parsed.endpointId)
      ]
      const arrayCandidates = [
        ...collectChatModelCandidates(parsed.suggestedModelIds),
        ...collectChatModelCandidates(parsed.recommendedModelIds),
        ...collectChatModelCandidates(parsed.recommendedModels)
      ]

      const resolvedSuggestedIds: string[] = []
      for (const item of [...arrayCandidates, ...primaryCandidates]) {
        const resolved = normalizeCandidate(item)
        if (resolved && !resolvedSuggestedIds.includes(resolved)) {
          resolvedSuggestedIds.push(resolved)
        }
      }

      const modelId =
        primaryCandidates.map(normalizeCandidate).find(Boolean) ?? resolvedSuggestedIds[0] ?? ''

      const hasExplicitMultiOrArray =
        arrayCandidates.length > 0 || resolvedSuggestedIds.length > 1

      const useReferenceImages =
        parsed.useReferenceImages === false || parsed.useReferenceImages === 'false'
          ? false
          : true
      const applyModelChange =
        parsed.applyModelChange === true || parsed.applyModelChange === 'true'

      const buildDecision = (
        nextAction: 'chat' | 'generate',
        nextReply: string,
        nextPrompt: string
      ): TextToImageChatDecision => {
        const base: TextToImageChatDecision = {
          action: nextAction,
          reply: nextReply,
          prompt: nextPrompt,
          modelId,
          useReferenceImages,
          applyModelChange,
          quickReplies: normalizeQuickReplies(
            parsed.quickReplies,
            nextAction === 'generate'
              ? defaultGenerateQuickReplies
              : defaultChatQuickReplies
          )
        }
        if (hasExplicitMultiOrArray && resolvedSuggestedIds.length > 0) {
          base.suggestedModelIds = resolvedSuggestedIds
        }
        return base
      }

      if (action === 'generate' && !prompt) {
        return buildDecision('chat', reply || missingPromptReply, '')
      }

      return buildDecision(
        action,
        reply || (action === 'generate' ? defaultGenerateReply : defaultChatReply),
        prompt
      )
    } catch {
      // 落到下方的純文字回覆
    }
  }

  const fallback = (fenced ? candidate : raw).replace(/```/g, '').trim()
  return {
    action: 'chat',
    reply: fallback || '抱歉，我需要再確認一下你的需求。',
    prompt: '',
    modelId: '',
    useReferenceImages: true,
    applyModelChange: false,
    quickReplies: [...defaultChatQuickReplies]
  }
}

/**
 * 解析 DeepSeek 的 JSON 決策。
 * 即使模型多包了 code fence 或前後說明，也會盡量取出第一個 JSON 物件；
 * 完全無法解析時退回為一般對話回覆，避免整個對話中斷。
 */
export function parseTextToImageChatDecision(rawContent: string): TextToImageChatDecision {
  return parseStructuredChatDecision(rawContent, {
    models: FAL_TEXT_TO_IMAGE_MODELS,
    defaultGenerateReply: '已為你生成圖片。',
    defaultChatReply: '我想再確認一下你的需求，請多告訴我一些畫面細節。',
    missingPromptReply: '我還需要更多畫面細節才能生成，請再告訴我主體、風格或構圖方向。'
  })
}

/** 收集對話中所有標記為「生成參考」的圖片路徑（去重、保留順序） */
export function collectTextToImageChatReferencePaths(
  messages: TextToImageChatMessage[]
): string[] {
  const paths: string[] = []
  for (const message of messages) {
    for (const attachment of message.attachments ?? []) {
      if (!attachment.asReference || !attachment.filePath) continue
      if (paths.includes(attachment.filePath)) continue
      paths.push(attachment.filePath)
    }
  }
  return paths
}

/** 收集要讓 DeepSeek 看圖的圖片（只取最近 N 張） */
export function collectTextToImageChatVisionTargets(
  messages: TextToImageChatMessage[],
  limit: number = TEXT_TO_IMAGE_CHAT_MAX_VISION_IMAGES
): TextToImageChatVisionTarget[] {
  const targets: TextToImageChatVisionTarget[] = []
  for (let index = 0; index < messages.length; index++) {
    for (const attachment of messages[index].attachments ?? []) {
      if (!attachment.forVision || !attachment.filePath) continue
      targets.push({
        messageIndex: index,
        filePath: attachment.filePath,
        fileName: attachment.fileName || attachment.filePath.split(/[/\\]/).pop() || 'image'
      })
    }
  }
  return targets.slice(-Math.max(1, limit))
}

