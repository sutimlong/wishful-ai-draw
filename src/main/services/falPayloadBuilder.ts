import { BatchItem, GenerationConfig } from '../../shared/types'

export function buildFalInputPayload(
  item: BatchItem,
  config: GenerationConfig,
  remoteInputUrl: string
): Record<string, unknown> {
  const effectivePrompt =
    item.customPrompt && item.customPrompt.trim().length > 0
      ? item.customPrompt.trim()
      : config.prompt.trim()

  const imageField = config.imageInputField.trim() || 'image_url'
  const imageValue = config.isArrayImageInput ? [remoteInputUrl] : remoteInputUrl

  const payload: Record<string, unknown> = {
    [imageField]: imageValue,
    prompt: effectivePrompt,
    output_format: config.outputFormat
  }

  // 擴散模型專屬參數：OpenAI GPT Image 系列等模型不支援，需依模型能力分流
  if (config.includeDiffusionParams !== false) {
    payload.strength = config.strength
    payload.num_inference_steps = config.numInferenceSteps
    payload.guidance_scale = config.guidanceScale

    if (config.negativePrompt && config.negativePrompt.trim().length > 0) {
      payload.negative_prompt = config.negativePrompt.trim()
    }

    // seed 同樣屬於擴散模型參數；GPT Image 系列的 schema 不接受 seed
    if (typeof config.seed === 'number' && !Number.isNaN(config.seed)) {
      payload.seed = config.seed
    }

    if (config.scheduler && config.scheduler.trim().length > 0) {
      payload.scheduler = config.scheduler.trim()
    }
  } else {
    // OpenAI GPT Image 系列的原生參數
    if (config.quality) payload.quality = config.quality
    if (config.imageSize && config.imageSize.trim()) payload.image_size = config.imageSize.trim()
    if (typeof config.numImages === 'number' && !Number.isNaN(config.numImages)) {
      payload.num_images = config.numImages
    }
    if (config.safetyTolerance && config.safetyTolerance.trim()) {
      payload.safety_tolerance = config.safetyTolerance.trim()
    }
  }

  // 依模型 schema 剔除不支援的參數（由 fal.ai 目錄同步而來，避免 422 驗證錯誤）
  if (config.unsupportedFields && config.unsupportedFields.length > 0) {
    const blocked = new Set(config.unsupportedFields)
    Object.keys(payload).forEach((key) => {
      if (blocked.has(key)) delete payload[key]
    })
  }

  if (config.customJsonParams && config.customJsonParams.trim().length > 0) {
    try {
      const customObj = JSON.parse(config.customJsonParams)
      if (typeof customObj === 'object' && customObj !== null && !Array.isArray(customObj)) {
        Object.assign(payload, customObj)
      }
    } catch {
      throw new Error('進階 JSON 參數格式錯誤 (Invalid JSON in customJsonParams)')
    }
  }

  return payload
}

export function extractFalOutputImageUrl(result: unknown): string {
  if (!result || typeof result !== 'object') {
    throw new Error('fal.ai 回傳結果為空或格式不正確')
  }

  const obj = result as Record<string, unknown>
  const data = (obj.data && typeof obj.data === 'object' ? obj.data : obj) as Record<
    string,
    unknown
  >

  // 1. Check data.images[0].url or data.images[0] (string)
  if (Array.isArray(data.images) && data.images.length > 0) {
    const first = data.images[0]
    if (typeof first === 'string' && first.startsWith('http')) {
      return first
    }
    if (first && typeof first === 'object' && typeof (first as { url?: unknown }).url === 'string') {
      return (first as { url: string }).url
    }
  }

  // 2. Check data.image.url or data.image (string)
  if (typeof data.image === 'string' && data.image.startsWith('http')) {
    return data.image
  }
  if (
    data.image &&
    typeof data.image === 'object' &&
    typeof (data.image as { url?: unknown }).url === 'string'
  ) {
    return (data.image as { url: string }).url
  }

  // 3. Check direct output_url / url
  if (typeof data.url === 'string' && data.url.startsWith('http')) {
    return data.url
  }

  throw new Error('無法從 fal.ai 回應中解析輸出圖片 URL')
}

