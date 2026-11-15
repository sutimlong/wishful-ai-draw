/**
 * 共用 fal.ai 影片模型目錄同步器（供 sync:fal-text-to-video 與 sync:fal-image-to-video 共用）。
 */

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const CONCURRENCY = 8
const REQUEST_TIMEOUT_MS = 20_000

const TEXT_TO_VIDEO_BLOCKED_REQUIRED = new Set([
  'image_url',
  'image_urls',
  'first_frame_url',
  'first_frame_image_url',
  'start_image_url',
  'end_image_url',
  'last_frame_url',
  'video_url',
  'audio_url',
  'face_url',
  'reference_image_url',
  'reference_image_urls',
  'character_image_url',
  'avatar_id'
])

const IMAGE_TO_VIDEO_UNSUPPORTED_REQUIRED = new Set([
  'video_url',
  'audio_url',
  'face_url',
  'avatar_id',
  'effect',
  'keyframes',
  'loras',
  'image_references'
])

const PRIMARY_I2V_IMAGE_FIELDS = [
  'image_url',
  'start_image_url',
  'first_image_url',
  'first_frame_image_url',
  'subject_reference_image_url',
  'image_urls',
  'reference_image_urls',
  'input_image_urls'
]

const END_IMAGE_FIELDS = ['end_image_url', 'tail_image_url']
const ARRAY_IMAGE_FIELDS = new Set(['image_urls', 'reference_image_urls', 'input_image_urls', 'images'])

const OPTIONAL_REF_IMAGE_FIELDS = [
  'reference_image_url',
  'reference_image_urls',
  'image_url',
  'image_urls',
  'first_frame_image_url'
]

const CHECKED_OPTIONAL_FIELDS = [
  'negative_prompt',
  'seed',
  'aspect_ratio',
  'duration',
  'resolution',
  'video_size'
]

const GROUP_LABELS = new Map([
  ['wan', 'Alibaba Wan'],
  ['alibaba', 'Alibaba Wan'],
  ['kling', 'Kuaishou Kling'],
  ['kling-video', 'Kuaishou Kling'],
  ['minimax', 'MiniMax Hailuo'],
  ['hailuo', 'MiniMax Hailuo'],
  ['veo', 'Google Veo'],
  ['google', 'Google Veo / Gemini'],
  ['gemini', 'Google Veo / Gemini'],
  ['sora', 'OpenAI Sora'],
  ['luma', 'Luma Ray'],
  ['ray', 'Luma Ray'],
  ['vidu', 'Vidu'],
  ['pixverse', 'PixVerse'],
  ['ltx', 'Lightricks LTX'],
  ['runway', 'Runway'],
  ['bytedance', 'ByteDance Seedance'],
  ['seedance', 'ByteDance Seedance'],
  ['xai', 'xAI Grok'],
  ['grok-imagine-video', 'xAI Grok'],
  ['hunyuan', 'Tencent Hunyuan'],
  ['mochi', 'Genmo Mochi'],
  ['cogvideox', 'CogVideoX'],
  ['skyreels', 'SkyReels'],
  ['magi', 'Sand AI Magi'],
  ['pika', 'Pika'],
  ['moonvalley', 'Moonvalley Marey'],
  ['blackforestlabs', 'Black Forest Labs'],
  ['longcat-video', 'LongCat Video'],
  ['ovi', 'Ovi'],
  ['heygen', 'HeyGen'],
  ['creatify', 'Creatify AI']
])

async function fetchJson(url, retries = 2) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      })
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      return await res.json()
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
      }
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError
}

async function fetchText(url, retries = 2) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'text/html,application/xhtml+xml' }
      })
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      return await res.text()
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
      }
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length)
  let nextIndex = 0
  async function worker() {
    while (nextIndex < items.length) {
      const idx = nextIndex++
      results[idx] = await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

function resolveRef(spec, schema) {
  if (!schema || typeof schema !== 'object') return schema
  if (schema.$ref && typeof schema.$ref === 'string') {
    const match = schema.$ref.match(/^#\/components\/schemas\/(.+)$/)
    if (match) {
      const target = spec?.components?.schemas?.[match[1]]
      if (target) {
        const merged = { ...resolveRef(spec, target), ...schema }
        delete merged.$ref
        return merged
      }
    }
  }
  return schema
}

function findInputSchema(spec) {
  const schemas = spec?.components?.schemas || {}
  for (const [name, schema] of Object.entries(schemas)) {
    if (name === 'Input' || name.endsWith('Input')) {
      return resolveRef(spec, schema)
    }
  }
  const paths = spec?.paths || {}
  for (const [pathKey, pathObj] of Object.entries(paths)) {
    if (pathKey.endsWith('/status') || pathKey.endsWith('/cancel')) continue
    const jsonContent = pathObj?.post?.requestBody?.content?.['application/json']
    if (jsonContent?.schema) {
      return resolveRef(spec, jsonContent.schema)
    }
  }
  return null
}

function findOutputSchema(spec) {
  const schemas = spec?.components?.schemas || {}
  for (const [name, schema] of Object.entries(schemas)) {
    if (name === 'Output' || name.endsWith('Output')) {
      return resolveRef(spec, schema)
    }
  }
  const paths = spec?.paths || {}
  for (const [pathKey, pathObj] of Object.entries(paths)) {
    if (!pathKey.includes('/requests/{request_id}') || pathKey.endsWith('/status')) continue
    const okResp = pathObj?.get?.responses?.['200'] || pathObj?.get?.responses?.default
    const jsonContent = okResp?.content?.['application/json']
    if (jsonContent?.schema) {
      return resolveRef(spec, jsonContent.schema)
    }
  }
  return null
}

function extractEnumValues(spec, rawProp) {
  const prop = resolveRef(spec, rawProp)
  if (!prop || typeof prop !== 'object') return []
  const values = []
  const pushVal = (v) => {
    if ((typeof v === 'string' || typeof v === 'number') && !values.includes(v)) {
      values.push(v)
    }
  }
  if (Array.isArray(prop.enum)) prop.enum.forEach(pushVal)
  if (prop.const !== undefined) pushVal(prop.const)
  for (const key of ['anyOf', 'oneOf', 'allOf']) {
    if (Array.isArray(prop[key])) {
      for (const branch of prop[key]) {
        const resolved = resolveRef(spec, branch)
        if (!resolved || resolved.type === 'null') continue
        extractEnumValues(spec, resolved).forEach(pushVal)
      }
    }
  }
  return values
}

function extractPropertyDefault(spec, rawProp) {
  const prop = resolveRef(spec, rawProp)
  if (!prop || typeof prop !== 'object') return undefined
  if (
    prop.default !== undefined &&
    prop.default !== null &&
    (typeof prop.default === 'string' ||
      typeof prop.default === 'number' ||
      typeof prop.default === 'boolean')
  ) {
    return prop.default
  }
  return undefined
}

function extractDurationSpec(spec, rawProp) {
  if (!rawProp) return undefined
  const prop = resolveRef(spec, rawProp)
  if (!prop || typeof prop !== 'object') return undefined

  const enumVals = extractEnumValues(spec, prop)
  const defaultVal = extractPropertyDefault(spec, prop)

  const candidates = []
  const collectTypes = (node) => {
    const resolved = resolveRef(spec, node)
    if (!resolved || resolved.type === 'null') return
    if (resolved.type) candidates.push(resolved)
    for (const key of ['anyOf', 'oneOf', 'allOf']) {
      if (Array.isArray(resolved[key])) resolved[key].forEach(collectTypes)
    }
  }
  collectTypes(prop)

  let type = 'number'
  const stringEnums = enumVals.filter((v) => typeof v === 'string')
  const numberEnums = enumVals.filter((v) => typeof v === 'number')

  if (stringEnums.some((v) => /^\d+s$/i.test(v))) {
    type = 'seconds_string'
  } else if (
    stringEnums.length > 0 ||
    (candidates.some((c) => c.type === 'string') &&
      !candidates.some((c) => c.type === 'integer' || c.type === 'number'))
  ) {
    type = 'string'
  } else if (typeof defaultVal === 'string' && /^\d+s$/i.test(defaultVal)) {
    type = 'seconds_string'
  } else if (typeof defaultVal === 'string') {
    type = 'string'
  } else if (
    numberEnums.length > 0 ||
    candidates.some((c) => c.type === 'integer' || c.type === 'number')
  ) {
    type = 'number'
  }

  let min
  let max
  for (const c of candidates) {
    if (typeof c.minimum === 'number') min = min === undefined ? c.minimum : Math.max(min, c.minimum)
    if (typeof c.maximum === 'number') max = max === undefined ? c.maximum : Math.min(max, c.maximum)
  }

  const out = { type }
  if (enumVals.length > 0) out.enum = enumVals
  if (typeof min === 'number') out.min = min
  if (typeof max === 'number') out.max = max
  if (defaultVal !== undefined) out.default = defaultVal
  return out
}

function isArrayProperty(spec, rawProp) {
  const prop = resolveRef(spec, rawProp)
  if (!prop || typeof prop !== 'object') return false
  if (prop.type === 'array') return true
  for (const key of ['anyOf', 'oneOf']) {
    if (Array.isArray(prop[key])) {
      for (const b of prop[key]) {
        const rb = resolveRef(spec, b)
        if (rb?.type === 'array') return true
      }
    }
  }
  return false
}

function inferGroup(item) {
  const parts = String(item.id || '').split('/')
  const idVendor = (parts[0] === 'fal-ai' && parts[1] ? parts[1] : parts[0]).toLowerCase()
  const lab = String(item.modelLab || item.modelFamily || '').trim()
  const normalizedLab = lab.toLowerCase()

  if (GROUP_LABELS.has(idVendor)) return GROUP_LABELS.get(idVendor)
  for (const [key, label] of GROUP_LABELS.entries()) {
    if (idVendor.includes(key)) return label
  }

  if (lab && normalizedLab !== 'fal' && normalizedLab !== 'fal-ai') {
    const mapped = GROUP_LABELS.get(normalizedLab)
    if (mapped) return mapped
    return lab
  }

  return idVendor || 'Other'
}

function formatUnitBasis(unit, unitPriceUsd) {
  const unitMap = {
    seconds: '秒',
    videos: '部',
    'video segments': '片段',
    '5 seconds': '每 5 秒',
    'compute seconds': '運算秒',
    '1000 tokens': '1K tokens',
    '1m tokens': '1M tokens',
    units: '計費單位',
    credits: '點數',
    megapixels: 'MP'
  }
  const unitZh = unitMap[unit] || unit
  if (typeof unitPriceUsd === 'number' && unitPriceUsd > 0) {
    const trimmed = Number(unitPriceUsd.toFixed(5)).toString()
    const formatted =
      trimmed.includes('.') && trimmed.split('.')[1].length >= 2
        ? `$${trimmed}`
        : `$${unitPriceUsd.toFixed(2)}`
    return `${formatted} / ${unitZh}`
  }
  return `依 ${unitZh} 計費`
}

function extractPricingFromText(text) {
  if (!text || typeof text !== 'string') return null
  const clean = text.replace(/\*\*/g, '')
  const perSecondMatch =
    clean.match(/\$(\d+(?:\.\d+)?)\s*(?:per|\/)\s*second\b/i) ||
    clean.match(/per second[^$.\n]{0,80}?\$(\d+(?:\.\d+)?)/i) ||
    clean.match(/second of[^$.\n]{0,80}?charged\s+\$(\d+(?:\.\d+)?)/i)
  if (perSecondMatch) {
    const price = Number(perSecondMatch[1])
    if (Number.isFinite(price) && price > 0) {
      return {
        unit: 'seconds',
        unitPriceUsd: price,
        basis: formatUnitBasis('seconds', price)
      }
    }
  }
  const perVideoMatch =
    clean.match(/\$(\d+(?:\.\d+)?)\s*(?:per|\/)\s*video\b/i) ||
    clean.match(/each video[^$.\n]{0,60}?\$(\d+(?:\.\d+)?)/i)
  if (perVideoMatch) {
    const price = Number(perVideoMatch[1])
    if (Number.isFinite(price) && price > 0) {
      return {
        unit: 'videos',
        unitPriceUsd: price,
        basis: formatUnitBasis('videos', price)
      }
    }
  }
  if (/per second/i.test(clean)) {
    return { unit: 'seconds', basis: '依生成秒數計費' }
  }
  if (/per token|million tokens|1M tokens/i.test(clean)) {
    return { unit: '1m tokens', basis: '依 token 用量計費' }
  }
  return null
}

function extractPricingFromHtml(html, item) {
  if (html && !item.hidePricing) {
    const unescaped = html.replace(/\\"/g, '"')
    const blocks = [
      ...unescaped.matchAll(
        /"(?:publicEndpointBilling|endpointBilling)"\s*:\s*\{[^}]*"billing_unit"\s*:\s*"([^"]+)"[^}]*"price"\s*:\s*([0-9.]+)[^}]*\}/g
      )
    ]
    for (const match of blocks) {
      const unit = String(match[1] || '').toLowerCase()
      const price = Number(match[2])
      if (unit && Number.isFinite(price) && price > 0) {
        return {
          unit,
          unitPriceUsd: price,
          basis: formatUnitBasis(unit, price)
        }
      }
    }
  }

  if (item.hidePricing) return undefined
  return (
    extractPricingFromText(item.pricingInfoOverride) ||
    extractPricingFromText(item.billingMessage) ||
    undefined
  )
}

async function fetchAllCatalogItems(category) {
  const byId = new Map()
  let page = 1
  const pageSize = 40
  let totalPages = 1

  while (page <= totalPages) {
    const url = `https://fal.ai/api/models?categories=${encodeURIComponent(category)}&page=${page}&pageSize=${pageSize}`
    const data = await fetchJson(url)
    if (!data || !Array.isArray(data.items) || data.items.length === 0) break
    if (typeof data.pages === 'number' && data.pages > 0) {
      totalPages = data.pages
    } else if (typeof data.total === 'number' && data.total > 0) {
      totalPages = Math.ceil(data.total / pageSize)
    }
    for (const item of data.items) {
      if (!item?.id) continue
      if (item.removed || item.deprecated) continue
      if (item.status && item.status !== 'public') continue
      if (!byId.has(item.id)) {
        byId.set(item.id, item)
      }
    }
    page++
  }

  return Array.from(byId.values())
}

async function inspectVideoModel(item, mode) {
  const openApiUrl = `https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=${encodeURIComponent(item.id)}`
  let spec = null
  try {
    spec = await fetchJson(openApiUrl)
  } catch {
    return { skipReason: 'schemaError', id: item.id }
  }
  if (!spec) return { skipReason: 'noSchema', id: item.id }

  const inputSchema = findInputSchema(spec)
  const outputSchema = findOutputSchema(spec)
  const props = inputSchema?.properties || {}
  if (!inputSchema || typeof props !== 'object') {
    return { skipReason: 'noInputProps', id: item.id }
  }

  const promptField = props.prompt ? 'prompt' : props.instruction ? 'instruction' : null
  if (!promptField) {
    return { skipReason: 'noPrompt', id: item.id }
  }

  const outProps = outputSchema?.properties || {}
  const outKeys = Object.keys(outProps)
  if (
    outKeys.length > 0 &&
    !outKeys.some((k) => k.includes('video') || k === 'url' || k === 'output_url')
  ) {
    return { skipReason: 'nonVideoOutput', id: item.id }
  }

  const required = Array.isArray(inputSchema.required) ? inputSchema.required : []
  const defaultParams = {}

  let imageInputField = 'image_url'
  let isArrayImageInput = false
  let endImageField
  let requiresEndImage = false
  let requiresPrompt

  if (mode === 'image-to-video') {
    const primaryField = PRIMARY_I2V_IMAGE_FIELDS.find((f) => props[f])
    if (!primaryField) {
      return { skipReason: 'noImageInput', id: item.id }
    }
    imageInputField = primaryField
    isArrayImageInput =
      ARRAY_IMAGE_FIELDS.has(primaryField) || isArrayProperty(spec, props[primaryField])

    endImageField = END_IMAGE_FIELDS.find((f) => props[f] && f !== primaryField)
    if (endImageField && required.includes(endImageField)) {
      requiresEndImage = true
    }

    if (!required.includes(promptField)) {
      requiresPrompt = false
    }

    for (const reqField of required) {
      if (
        reqField === promptField ||
        reqField === imageInputField ||
        reqField === endImageField ||
        reqField === 'resolution'
      ) {
        continue
      }
      if (IMAGE_TO_VIDEO_UNSUPPORTED_REQUIRED.has(reqField)) {
        return { skipReason: `requiresMedia:${reqField}`, id: item.id }
      }
      const defVal = extractPropertyDefault(spec, props[reqField])
      if (defVal !== undefined) {
        defaultParams[reqField] = defVal
      } else {
        return { skipReason: `extraRequired:${reqField}`, id: item.id }
      }
    }
  } else {
    for (const reqField of required) {
      if (reqField === promptField) continue
      if (TEXT_TO_VIDEO_BLOCKED_REQUIRED.has(reqField)) {
        return { skipReason: `requiresMedia:${reqField}`, id: item.id }
      }
      const defVal = extractPropertyDefault(spec, props[reqField])
      if (defVal !== undefined) {
        defaultParams[reqField] = defVal
      } else {
        return { skipReason: `extraRequired:${reqField}`, id: item.id }
      }
    }
  }

  const aspectRatioEnum = props.aspect_ratio
    ? extractEnumValues(spec, props.aspect_ratio).filter((v) => typeof v === 'string')
    : undefined
  const resolutionEnum = props.resolution
    ? extractEnumValues(spec, props.resolution).filter((v) => typeof v === 'string')
    : undefined
  const videoSizeEnum = props.video_size
    ? extractEnumValues(spec, props.video_size).filter((v) => typeof v === 'string')
    : undefined
  const durationSpec = extractDurationSpec(spec, props.duration)

  const audioField = props.generate_audio
    ? 'generate_audio'
    : props.generate_audio_switch
      ? 'generate_audio_switch'
      : undefined

  const unsupportedFields = CHECKED_OPTIONAL_FIELDS.filter((field) => !props[field])

  let referenceImageField
  let isArrayReferenceImage
  if (mode === 'text-to-video') {
    for (const candidate of OPTIONAL_REF_IMAGE_FIELDS) {
      if (props[candidate] && !required.includes(candidate)) {
        referenceImageField = candidate
        isArrayReferenceImage = isArrayProperty(spec, props[candidate])
        break
      }
    }
  }

  let html = null
  try {
    html = await fetchText(`https://fal.ai/models/${item.id}`)
  } catch {
    html = null
  }
  const pricing = extractPricingFromHtml(html, item)

  const preset = {
    id: item.id,
    name: String(item.title || item.id).trim(),
    description: String(item.shortDescription || item.title || item.id)
      .replace(/\s+/g, ' ')
      .trim(),
    imageInputField,
    ...(isArrayImageInput ? { isArrayImageInput: true } : {}),
    includeDiffusionParams: false,
    group: inferGroup(item),
    ...(promptField !== 'prompt' ? { promptField } : {}),
    ...(requiresPrompt === false ? { requiresPrompt: false } : {}),
    ...(endImageField ? { endImageField } : {}),
    ...(requiresEndImage ? { requiresEndImage: true } : {}),
    ...(durationSpec ? { durationSpec } : {}),
    ...(aspectRatioEnum && aspectRatioEnum.length > 0 ? { aspectRatioEnum } : {}),
    ...(resolutionEnum && resolutionEnum.length > 0 ? { resolutionEnum } : {}),
    ...(videoSizeEnum && videoSizeEnum.length > 0 ? { videoSizeEnum } : {}),
    ...(audioField ? { audioField } : {}),
    ...(referenceImageField ? { referenceImageField } : {}),
    ...(isArrayReferenceImage ? { isArrayReferenceImage: true } : {}),
    ...(unsupportedFields.length > 0 ? { unsupportedFields } : {}),
    ...(pricing ? { pricing } : {}),
    defaultParams
  }

  return { preset }
}

/** 執行 fal.ai 影片模型目錄同步並產生對應 TS 目錄檔案 */
export async function syncFalVideoCatalog(config) {
  const { projectRoot, mode, category, outputRelativePath, exportName, scriptFileName, syncScript, titleZh } =
    config
  const outputFile = resolve(projectRoot, outputRelativePath)

  console.log(`正在從 fal.ai 讀取所有 ${category} 模型清單...`)
  const items = await fetchAllCatalogItems(category)
  console.log(`取得公開 ${category} 候選端點：${items.length} 筆`)

  const inspected = await mapPool(items, CONCURRENCY, (item) => inspectVideoModel(item, mode))

  const presets = []
  const skipped = {}
  for (const res of inspected) {
    if (res.preset) {
      presets.push(res.preset)
    } else {
      skipped[res.skipReason] = (skipped[res.skipReason] || 0) + 1
    }
  }

  const pricedCount = presets.filter((p) => p.pricing?.unitPriceUsd || p.pricing?.unit).length

  const fileContent = `/**
 * 此檔案由 scripts/${scriptFileName} 自動產生，請勿手動修改！
 * 若需重新從 fal.ai 同步最新${titleZh}模型與牌價，請執行：
 *   npm run ${syncScript}
 *
 * 產生時間：${new Date().toISOString()}
 * 收錄模型數：${presets.length}
 */

import { FalModelPreset } from './types'

export const ${exportName}: FalModelPreset[] = ${JSON.stringify(presets, null, 2)}
`

  writeFileSync(outputFile, fileContent, 'utf8')
  console.log(`已產生 ${outputFile}`)
  console.log(`收錄可用${titleZh}模型：${presets.length} 筆（含計價資訊：${pricedCount} 筆）`)
  console.log('略過原因統計：', skipped)
}
