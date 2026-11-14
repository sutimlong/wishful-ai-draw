#!/usr/bin/env node
/**
 * 從 fal.ai 公開目錄同步所有「文生圖 (text-to-image)」模型，
 * 產生 src/shared/falTextToImageCatalog.ts 供「文字生成圖片」頁面的模型下拉選單使用。
 *
 * 用法：
 *   npm run sync:fal-text-to-image
 *   node scripts/sync-fal-text-to-image.mjs --out=/tmp/falTextToImageCatalog.ts
 *
 * 資料來源：
 *   1. https://fal.ai/api/models?categories=text-to-image  （模型清單，每頁 40 筆）
 *   2. https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=...  （各模型的輸入 schema）
 *
 * 篩選規則：
 *   - 只保留 public、未下架、且抓得到輸入 schema 的模型
 *   - 必須有 prompt 輸入欄位，且不要求任何圖片輸入
 *   - 只收 output:image 的模型（排除純文字／語音／影片類）
 *   - 依 schema 計算我們會送出的參數是否支援（image_size / aspect_ratio / num_images ...）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CATEGORY = 'text-to-image'
const PAGE_SIZE = 40
const MODELS_API = 'https://fal.ai/api/models'
const SCHEMA_API = 'https://fal.ai/api/openapi/queue/openapi.json'
/** 模型頁面（回傳 Next.js RSC payload，內含 endpointBilling 的計價單位與單價） */
const MODEL_PAGE_API = 'https://fal.ai/models'
const CONCURRENCY = 8
const RETRY = 3

/** 換算「一張圖片」價格時假設的輸出面積：1024×1024（約 1 MP），與 App 預設輸出尺寸一致 */
const ASSUMED_OUTPUT_MEGAPIXELS = 1
/** 「輸入＋輸出」都依像素計價的模型，假設輸入與輸出各 1 MP */
const ASSUMED_PROCESSED_MEGAPIXELS = 2
/** token 計價模型換算時採用的品質欄（fal 對 gpt-image 系列的預設值為 high） */
const ASSUMED_QUALITY_COLUMN = 'high'
/** 計價說明出現這些字樣代表是 token／點數計價，無法直接當成單張價格 */
const TOKEN_PRICING_HINTS = /token|credit|character|word/i

/** 文生圖 payload 會送出的參數（計算各模型不支援哪些欄位） */
const T2I_PAYLOAD_KEYS = [
  'prompt',
  'image_size',
  'aspect_ratio',
  'width',
  'height',
  'num_images',
  'output_format',
  'seed'
]

/** image_size 字串列舉值裡，符合我們畫面比例選單的關鍵字 */
const IMAGE_SIZE_HINTS = /^(square|landscape|portrait)/i
/** aspect_ratio 支援的比例字串 */
const SUPPORTED_ASPECT_RATIOS = new Set(['1:1', '16:9', '9:16', '4:3', '3:4'])

/** 主要圖片輸入欄位（偵測模型是否要求圖片輸入） */
const PRIMARY_IMAGE_FIELDS = [
  'image_urls',
  'image_url',
  'image',
  'images',
  'input_image',
  'input_image_url',
  'input_images',
  'input_image_urls',
  'source_image',
  'source_image_url',
  'init_image',
  'init_image_url',
  'img_url',
  'photo_url',
  'reference_image',
  'reference_image_url',
  'reference_images'
]

const FALLBACK_GROUP = '其他文生圖模型'

/** 要在名稱前面加上「★」精選標記的文生圖模型 id */
const STARRED_TEXT_TO_IMAGE_IDS = new Set([
  'openai/gpt-image-2.6/sunburst/text-to-image',
  'fal-ai/nano-banana-pro',
  'google/nano-banana-2.1',
  'fal-ai/recraft/v4/pro/text-to-image',
  'ideogram/v4',
  'bytedance/seedream/v5/pro/text-to-image',
  'fal-ai/flux-krea-lora/stream',
  'fal-ai/flux-2-pro',
  'wan/v2.6/text-to-image'
])

/** 參考圖欄位偵測順序（優先把語意明確的「參考圖」欄位放在前面） */
const REFERENCE_IMAGE_FIELDS = [
  'reference_image_url',
  'reference_images',
  'image_url',
  'image_urls',
  'input_image_url',
  'init_image_url',
  'image',
  'images'
]

function parseArgs() {
  const outArg = process.argv.find((arg) => arg.startsWith('--out='))
  return {
    out: outArg
      ? path.resolve(process.cwd(), outArg.slice('--out='.length))
      : path.join(__dirname, '..', 'src', 'shared', 'falTextToImageCatalog.ts')
  }
}

async function fetchJson(url) {
  let lastError
  for (let attempt = 1; attempt <= RETRY; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status} (${url})`)
      return await res.json()
    } catch (err) {
      lastError = err
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt))
    }
  }
  throw lastError
}

async function fetchAllModels() {
  const first = await fetchJson(`${MODELS_API}?categories=${CATEGORY}&page=1&pageSize=${PAGE_SIZE}`)
  const pages = Number(first.pages) || 1
  const items = [...first.items]
  for (let page = 2; page <= pages; page++) {
    const data = await fetchJson(
      `${MODELS_API}?categories=${CATEGORY}&page=${page}&pageSize=${PAGE_SIZE}`
    )
    items.push(...data.items)
  }
  return items
}

async function fetchSchema(endpointId) {
  const url = `${SCHEMA_API}?endpoint_id=${encodeURIComponent(endpointId)}`
  const schema = await fetchJson(url)
  const schemas = (schema.components && schema.components.schemas) || {}
  const inputName = Object.keys(schemas).find((key) => /Input$/.test(key))
  if (!inputName) throw new Error('找不到 Input schema')
  const input = schemas[inputName]
  return { properties: input.properties || {}, required: input.required || [] }
}

async function fetchText(url, headers) {
  let lastError
  for (let attempt = 1; attempt <= RETRY; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: 'text/x-component', ...headers } })
      if (!res.ok) throw new Error(`HTTP ${res.status} (${url})`)
      return await res.text()
    } catch (err) {
      lastError = err
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt))
    }
  }
  throw lastError
}

/** RSC payload 內的字串是轉義過的，先還原成可讀文字再解析 */
function unescapeFlight(text) {
  return text.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\u00d7/gi, '×')
}

/** 從模型頁面取出 fal 的計價設定（billing_unit = 計價單位、price = 單位價格） */
function parseEndpointBilling(text) {
  for (const match of text.matchAll(
    /"(?:publicEndpointBilling|endpointBilling)":\s*\{([^{}]*)\}/g
  )) {
    try {
      const parsed = JSON.parse(`{${match[1]}}`)
      if (typeof parsed.billing_unit === 'string' && typeof parsed.price === 'number') return parsed
    } catch {
      // 片段不是合法 JSON 就換下一個
    }
  }
  return null
}

async function fetchModelPricingSource(endpointId) {
  const pageText = unescapeFlight(await fetchText(`${MODEL_PAGE_API}/${endpointId}`, { RSC: '1' }))
  return { billing: parseEndpointBilling(pageText), pageText }
}

/** 計價說明轉純文字（去掉 markdown 粗體與反引號，換行收合成空白） */
function plainPriceText(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function roundPrice(value) {
  return Number(value.toFixed(5))
}

/** fal 說明中直接寫出的「每張」價格 */
function extractPerImagePrice(text) {
  const patterns = [
    /each image costs \$(\d+(?:\.\d+)?)/i,
    /(?:each|per)\s+(?:returned\s+|output\s+)*output\s+costs?\s+\$(\d+(?:\.\d+)?)/i,
    // 例：$0.15 per image、$0.06 (medium) per image、$0.09 per 1K image、$0.10 per generated SVG
    /\$(\d+(?:\.\d+)?)\s*(?:\([^)]{0,20}\)\s*)?(?:\/|per)\s+(?:(?:1K|2K|4K|generated|output|returned|standard|new|a|an)\s+)?(?:image|svg|photo|generation|request|call)\b/i,
    /\$(\d+(?:\.\d+)?)\s*for\s+1024\s*[x×]\s*1024/i
  ]
  for (const pattern of patterns) {
    const match = pattern.exec(text)
    const value = match ? Number(match[1]) : NaN
    if (Number.isFinite(value) && value > 0) return value
  }
  return null
}

/**
 * 「每 N 百萬像素 $X」費率。
 * started=true 代表 fal 是「每起算 N MP」計費（例如 Topaz 每 24 MP 收 $0.08）。
 */
function extractMegapixelRate(text) {
  const patterns = [
    /\$(\d+(?:\.\d+)?)\s*(?:\/|per)\s+(started\s+)?(?:(\d+(?:\.\d+)?)\s+)?megapixels?/i,
    /\$(\d+(?:\.\d+)?)\s*for\s+(?:each\s+)?(started\s+)?(?:(\d+(?:\.\d+)?)\s+)?megapixels?/i
  ]
  for (const pattern of patterns) {
    const match = pattern.exec(text)
    if (!match) continue
    const price = Number(match[1])
    const chunk = match[3] ? Number(match[3]) : 1
    if (Number.isFinite(price) && price > 0 && Number.isFinite(chunk) && chunk > 0) {
      return { price, chunk, started: Boolean(match[2]) }
    }
  }
  return null
}

/** 說明中出現多個價格代表依品質／尺寸分級，單張金額會變動 → 標記為預估值 */
function hasPriceTiers(text) {
  return (text.match(/\$\d+(?:\.\d+)?/g) || []).length > 1
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

/** 找出符合條件的表格列，並往上抓一列不含金額的表頭（用來判斷品質欄位） */
function findPricedTableRow(text, rowPattern) {
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (!rowPattern.test(lines[i].trim())) continue
    let header = null
    for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
      const line = lines[j].trim()
      if (!line.startsWith('|')) break
      if (/^\|[\s:|-]+\|$/.test(line)) continue // markdown 表格分隔線
      if (line.includes('$')) break // 上一列也是資料列
      header = splitTableRow(line)
      break
    }
    return { cells: splitTableRow(lines[i]), header }
  }
  return null
}

/** 依表頭選出代表欄位（優先 high 品質，其次中間欄位） */
function pickTableCell(cells, header) {
  const values = cells
    .slice(1)
    .map((cell) => Number((/\$(\d+(?:\.\d+)?)/.exec(cell) || [])[1]))
    .filter((value) => Number.isFinite(value) && value > 0)
  if (values.length === 0) return null
  const fallback = Math.min(Math.floor((values.length - 1) / 2), values.length - 1)
  if (!header) return values[fallback]
  const labels = header.slice(1).map((label) => label.replace(/[^a-z]/gi, '').toLowerCase())
  const index = labels.indexOf(ASSUMED_QUALITY_COLUMN)
  return index >= 0 && index < values.length ? values[index] : values[fallback]
}

/**
 * token 計價模型：從模型說明中的價格表取出「一張 1024×1024（或 1K）圖片」的金額。
 * 例：| **1024×1024 — square** | $0.02469 | $0.04347 | $0.05268 | …
 *     | 1024 x 1024 | $0.015 | $0.061 | $0.219 |
 *     | 1K | $0.040 | $0.044 |
 */
function extractTabulatedImagePrice(text) {
  const rowPatterns = [/^\|\s*\**\s*1024\s*[x×]\s*1024\b/i, /^\|\s*\**\s*1K\b/i]
  for (const rowPattern of rowPatterns) {
    const found = findPricedTableRow(text, rowPattern)
    if (!found) continue
    const value = pickTableCell(found.cells, found.header)
    if (value !== null) return value
  }
  return null
}

/** 計價單位的中文說明（用於 basis） */
const UNIT_BASIS = {
  images: '每張',
  generations: '每次',
  '1': '每次',
  units: '每單位',
  credits: '每點數'
}

/**
 * 整理單一模型的計價資訊，換算成「生成一張圖片」的預估金額。
 *
 * 判斷順序（前面優先）：
 *   1. fal 計價說明直接寫出的「每張」金額
 *   2. 計價單位就是「張／次」→ 單價即單張價格
 *   3. 依面積計價（megapixels / processed megapixels）→ 單價 × 假設面積
 *   4. 說明中的「每 N MP」費率
 *   5. token 計價 → 取官方價格表 1024×1024 的金額
 *   6. 以單位／點數計價（非 token）→ 單價即單張價格
 *   7. 其他（每運算秒、未公布單價…）→ 只保留計價基準
 */
function derivePricing({ billing, override, pageText }) {
  const unit = (billing && billing.billing_unit) || 'unknown'
  let unitPrice =
    billing && Number.isFinite(billing.price) && billing.price > 0 ? billing.price : null
  const text = plainPriceText(override)
  // 有些端點 billing price 是 0（未設定），但計價說明有寫每秒費率
  if (unitPrice === null) {
    const perSecond = /\$(\d+(?:\.\d+)?)\s*(?:\/|per)\s+(?:compute\s+)?second/i.exec(text)
    const value = perSecond ? Number(perSecond[1]) : NaN
    if (Number.isFinite(value) && value > 0) unitPrice = value
  }

  const base = { unit, ...(unitPrice ? { unitPriceUsd: roundPrice(unitPrice) } : {}) }
  const estimateFlag = hasPriceTiers(text) ? { isEstimate: true } : {}

  // 1. fal 說明中直接公布每張價格
  const perImage = extractPerImagePrice(text)
  if (perImage !== null) {
    return { ...base, perImageUsd: roundPrice(perImage), ...estimateFlag, basis: 'fal 公布每張價格' }
  }

  // 2. 計價單位 = 每張／每次
  if (unitPrice && ['images', 'generations', '1'].includes(unit)) {
    return {
      ...base,
      perImageUsd: roundPrice(unitPrice),
      basis: `fal 計價單位：${UNIT_BASIS[unit]}`
    }
  }

  // 3. 依輸出／處理面積計價
  if (unitPrice && unit === 'megapixels') {
    return {
      ...base,
      perImageUsd: roundPrice(unitPrice * ASSUMED_OUTPUT_MEGAPIXELS),
      isEstimate: true,
      basis: `$${unitPrice} / MP × 約 ${ASSUMED_OUTPUT_MEGAPIXELS} MP（1024×1024）`
    }
  }
  if (unitPrice && unit === 'processed megapixels') {
    return {
      ...base,
      perImageUsd: roundPrice(unitPrice * ASSUMED_PROCESSED_MEGAPIXELS),
      isEstimate: true,
      basis: `$${unitPrice} / MP × 約 ${ASSUMED_PROCESSED_MEGAPIXELS} MP（輸入＋輸出）`
    }
  }

  // 4. 說明中的「每 N MP」費率（Topaz、Ideogram 等以 units 計價但按面積收費的模型）
  const rate = extractMegapixelRate(text)
  if (rate) {
    return {
      ...base,
      perImageUsd: roundPrice(
        rate.started ? rate.price : (rate.price / rate.chunk) * ASSUMED_OUTPUT_MEGAPIXELS
      ),
      isEstimate: true,
      basis: rate.started
        ? `$${rate.price} 起（每 ${rate.chunk} MP）`
        : `$${rate.price} / ${rate.chunk} MP`
    }
  }

  if (TOKEN_PRICING_HINTS.test(text)) {
    // 5. token 計價：有官方價格表就取 1024×1024、預設品質
    const tabulated = extractTabulatedImagePrice(pageText)
    if (tabulated !== null) {
      return {
        ...base,
        perImageUsd: roundPrice(tabulated),
        isEstimate: true,
        basis: `token 計價（${ASSUMED_QUALITY_COLUMN} 品質、1024×1024）`
      }
    }
    return { ...base, basis: '依 token 用量計價，無法換算單張金額' }
  }

  // 5. 以「單位／點數」計價但不是 token 用量 → 單價即單張價格（例如 Seedream、Phota）
  if (unitPrice && !/second/i.test(unit)) {
    return {
      ...base,
      perImageUsd: roundPrice(unitPrice),
      basis: `fal 計價單位：${UNIT_BASIS[unit] ?? unit}`
    }
  }

  // 6. 無法換算單張金額：保留 fal 的計價基準
  if (/second/i.test(unit)) {
    return { ...base, basis: unit.includes('compute') ? '依運算秒數計費' : '依使用秒數計費' }
  }
  return { ...base, basis: 'fal 未公布單價' }
}

function pickImageField(properties) {
  for (const field of PRIMARY_IMAGE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(properties, field)) {
      return field
    }
  }
  return null
}

function isArrayField(property) {
  if (!property || typeof property !== 'object') return false
  if (property.type === 'array') return true
  // 有些 schema 用 anyOf: [{ type: 'array' }, { type: 'null' }]
  if (Array.isArray(property.anyOf)) {
    return property.anyOf.some((variant) => variant && variant.type === 'array')
  }
  return false
}

function numberDefault(property) {
  if (!property || typeof property !== 'object') return undefined
  const value = property.default
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return ''
  const text = value
    .replace(/\r?\n/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/** 端點 id 去掉廠商前綴，例如 fal-ai/flux/dev/image-to-image → flux/dev/image-to-image */
function shortEndpoint(id) {
  const parts = id.split('/')
  return parts.length > 1 ? parts.slice(1).join('/') : id
}

function quote(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/** 把計價資訊輸出成一行 TS 物件（欄位順序與 FalModelPricing 一致） */
function renderPricing(pricing) {
  const parts = []
  if (pricing.perImageUsd !== undefined) parts.push(`perImageUsd: ${pricing.perImageUsd}`)
  if (pricing.isEstimate) parts.push('isEstimate: true')
  parts.push(`unit: ${quote(pricing.unit)}`)
  if (pricing.unitPriceUsd !== undefined) parts.push(`unitPriceUsd: ${pricing.unitPriceUsd}`)
  parts.push(`basis: ${quote(pricing.basis)}`)
  return `{ ${parts.join(', ')} }`
}

function renderEntry(entry) {
  const lines = [
    `    id: ${quote(entry.id)},`,
    `    name: ${quote(entry.name)},`,
    `    description: ${quote(entry.description)},`,
    `    group: ${quote(entry.group)},`,
    `    imageInputField: ${quote(entry.imageInputField)},`
  ]
  if (entry.isArrayImageInput) lines.push('    isArrayImageInput: true,')
  if (entry.includeDiffusionParams === false) lines.push('    includeDiffusionParams: false,')
  if (entry.imageSizeEnum && entry.imageSizeEnum.length > 0) {
    lines.push(`    imageSizeEnum: [${entry.imageSizeEnum.map(quote).join(', ')}],`)
  }
  if (entry.referenceImageField) {
    lines.push(`    referenceImageField: ${quote(entry.referenceImageField)},`)
  }
  if (entry.isArrayReferenceImage) {
    lines.push('    isArrayReferenceImage: true,')
  }
  if (entry.unsupportedFields.length > 0) {
    lines.push(`    unsupportedFields: [${entry.unsupportedFields.map(quote).join(', ')}],`)
  }
  if (entry.pricing) lines.push(`    pricing: ${renderPricing(entry.pricing)},`)
  const defaults = Object.entries(entry.defaultParams)
  if (defaults.length === 0) {
    lines.push('    defaultParams: {}')
  } else {
    lines.push('    defaultParams: {')
    defaults.forEach(([key, value]) => lines.push(`      ${key}: ${value},`))
    lines.push('    }')
  }
  return `  {\n${lines.join('\n')}\n  }`
}

/** 收集 property（含 anyOf / oneOf 各變體）裡的 enum 字串值 */
function collectStringEnums(property) {
  const values = new Set()
  const visit = (node) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'string' && Array.isArray(node.enum)) {
      node.enum.forEach((value) => {
        if (typeof value === 'string') values.add(value)
      })
    }
    if (Array.isArray(node.anyOf)) node.anyOf.forEach(visit)
    if (Array.isArray(node.oneOf)) node.oneOf.forEach(visit)
  }
  visit(property)
  return values
}

/** property 是否為 integer（含 anyOf / oneOf 變體） */
function isIntegerProperty(property) {
  if (!property || typeof property !== 'object') return false
  if (property.type === 'integer') return true
  for (const key of ['anyOf', 'oneOf']) {
    if (Array.isArray(property[key])) {
      if (property[key].some((variant) => variant && variant.type === 'integer')) return true
    }
  }
  return false
}

/** 判斷 image_size 是否支援我們使用的字串列舉（square / landscape / portrait） */
function supportsImageSize(property) {
  const enums = collectStringEnums(property)
  if (enums.size === 0) return false
  return [...enums].some((value) => IMAGE_SIZE_HINTS.test(value))
}

/** 判斷 aspect_ratio 是否支援我們選單中的比例字串 */
function supportsAspectRatio(property) {
  const enums = collectStringEnums(property)
  if (enums.size === 0) return false
  return [...enums].some((value) => SUPPORTED_ASPECT_RATIOS.has(value))
}

/** 計算文生圖模型支援哪些 payload 欄位（prompt 一律支援） */
function computeSupportedKeys(properties) {
  const supported = new Set(['prompt'])
  if (supportsImageSize(properties.image_size)) supported.add('image_size')
  if (supportsAspectRatio(properties.aspect_ratio)) supported.add('aspect_ratio')
  if (isIntegerProperty(properties.width) && isIntegerProperty(properties.height)) {
    supported.add('width')
    supported.add('height')
  }
  if (isIntegerProperty(properties.num_images)) supported.add('num_images')
  if ([...collectStringEnums(properties.output_format)].some((value) => /^(png|jpeg)$/i.test(value))) {
    supported.add('output_format')
  }
  if (isIntegerProperty(properties.seed)) supported.add('seed')
  return supported
}

async function collectModels(models) {
  const queue = models.filter(
    (model) =>
      !model.removed && !model.deprecated && (!model.status || model.status === 'public')
  )
  const entries = []
  const skipped = { schema: [], noPrompt: [], requiresImage: [], notImageOutput: [], pricing: [] }
  let completed = 0

  async function worker() {
    while (queue.length > 0) {
      const model = queue.shift()
      completed++
      if (completed % 25 === 0 || completed === models.length) {
        process.stdout.write(`\r[sync] 讀取文生圖模型資料 ${completed}/${models.length}`)
      }

      let schema
      try {
        schema = await fetchSchema(model.id)
      } catch {
        skipped.schema.push(model.id)
        continue
      }

      const tags = (model.discovery && model.discovery.tags) || []
      const isImageOutput = tags.length === 0 || tags.includes('output:image')
      if (!isImageOutput) {
        skipped.notImageOutput.push(model.id)
        continue
      }

      if (!schema.properties.prompt) {
        skipped.noPrompt.push(model.id)
        continue
      }

      const requiresImage = schema.required.some((field) => PRIMARY_IMAGE_FIELDS.includes(field))
      if (requiresImage) {
        skipped.requiresImage.push(model.id)
        continue
      }

      const supportedKeys = computeSupportedKeys(schema.properties)
      const unsupportedFields = T2I_PAYLOAD_KEYS.filter((key) => !supportedKeys.has(key))

      // image_size 字串列舉值（依畫面比例選單排序：方形優先，橫式次之，直式最後）
      const imageSizeEnum = supportedKeys.has('image_size')
        ? [...collectStringEnums(schema.properties.image_size)]
            .filter((value) => IMAGE_SIZE_HINTS.test(value))
            .sort()
        : undefined

      // 可選參考圖欄位：第一個存在於 properties 但不在 required 的欄位
      const referenceImageField = REFERENCE_IMAGE_FIELDS.find(
        (field) => schema.properties[field] && !schema.required.includes(field)
      )
      const isArrayReferenceImage = referenceImageField
        ? isArrayField(schema.properties[referenceImageField])
        : undefined

      // 計價資訊：模型頁面內含 fal 的 billing_unit／price 與官方計價說明
      let pricing
      try {
        const source = await fetchModelPricingSource(model.id)
        pricing = derivePricing({
          billing: source.billing,
          override: model.pricingInfoOverride,
          pageText: source.pageText
        })
      } catch {
        skipped.pricing.push(model.id)
      }

      const rawName = cleanText(model.title, 90) || model.id
      const name = STARRED_TEXT_TO_IMAGE_IDS.has(model.id) ? `★ ${rawName}` : rawName

      entries.push({
        id: model.id,
        name,
        description: cleanText(model.shortDescription, 160),
        group:
          cleanText(model.modelLab || (model.discovery && model.discovery.lab), 60) ||
          FALLBACK_GROUP,
        imageInputField: '',
        imageSizeEnum,
        referenceImageField,
        isArrayReferenceImage: isArrayReferenceImage || undefined,
        unsupportedFields,
        pricing,
        defaultParams: {}
      })
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  process.stdout.write('\n')
  return { entries, skipped }
}

function renderFile(entries) {
  // 名稱重複時補上端點，避免下拉選單出現兩個一模一樣的選項
  const nameCount = new Map()
  entries.forEach((entry) => nameCount.set(entry.name, (nameCount.get(entry.name) || 0) + 1))
  entries.forEach((entry) => {
    if (nameCount.get(entry.name) > 1) entry.name = `${entry.name} · ${shortEndpoint(entry.id)}`
  })

  // 分組排序：模型數多的組別優先，組內依名稱排序
  const groupCount = new Map()
  entries.forEach((entry) => groupCount.set(entry.group, (groupCount.get(entry.group) || 0) + 1))
  entries.sort((a, b) => {
    const diff = groupCount.get(b.group) - groupCount.get(a.group)
    if (diff !== 0) return diff
    if (a.group !== b.group) return a.group.localeCompare(b.group, 'en')
    return a.name.localeCompare(b.name, 'en')
  })

  const generatedAt = new Date().toISOString().slice(0, 10)
  const header = [
    '// ⚠️ AUTO-GENERATED FILE — 請勿手動編輯',
    '// 由 `npm run sync:fal-text-to-image`（scripts/sync-fal-text-to-image.mjs）自動產生',
    '// 資料來源：fal.ai 公開模型目錄（categories=text-to-image）、各模型 OpenAPI schema 與模型頁面計價資訊',
    `// 產生日期：${generatedAt}　模型數：${entries.length}`,
    "import { FalModelPreset } from './types'",
    '',
    '/**',
    ' * 由 fal.ai 目錄同步而來的文生圖模型（依實驗室分組，組內依名稱排序）。',
    ' * `imageInputField` 恆為空字串（文生圖不需要來源圖）。',
    ' * `unsupportedFields` 為該模型 schema 不接受的參數，送出前會自動剔除；',
    ' * `pricing` 為 fal.ai 公布的計價資訊（含換算後的單張預估金額）。',
    ' */',
    'export const FAL_TEXT_TO_IMAGE_CATALOG: FalModelPreset[] = [',
    entries.map(renderEntry).join(',\n'),
    ']',
    '',
    '/** 下拉選單的分組順序（依模型數多寡排序） */',
    'export const FAL_TEXT_TO_IMAGE_GROUPS: string[] = FAL_TEXT_TO_IMAGE_CATALOG.reduce<string[]>(',
    '  (groups, model) => {',
    "    const group = model.group ?? '其他'",
    '    if (!groups.includes(group)) groups.push(group)',
    '    return groups',
    '  },',
    '  []',
    ')',
    ''
  ].join('\n')

  return `${header}
`
}

async function main() {
  const args = parseArgs()
  console.log(`[sync] 抓取 fal.ai ${CATEGORY} 模型清單…`)
  const models = await fetchAllModels()
  console.log(`[sync] 目錄共 ${models.length} 個模型，開始讀取各模型輸入 schema…`)

  const { entries, skipped } = await collectModels(models)
  const output = renderFile(entries)

  fs.mkdirSync(path.dirname(args.out), { recursive: true })
  fs.writeFileSync(args.out, output, 'utf-8')

  console.log(`[sync] 已寫入 ${args.out}`)
  console.log(`[sync] 收錄 ${entries.length} 個文生圖模型`)
  const priced = entries.filter((entry) => entry.pricing && entry.pricing.perImageUsd !== undefined)
  const basisOnly = entries.filter((entry) => entry.pricing && entry.pricing.perImageUsd === undefined)
  console.log(
    `[sync] 計價：可換算單張金額 ${priced.length}、僅有計價基準 ${basisOnly.length}` +
      `、未取得計價 ${entries.length - priced.length - basisOnly.length}` +
      (skipped.pricing.length > 0 ? `（頁面讀取失敗 ${skipped.pricing.length}）` : '')
  )
  console.log(
    `[sync] 略過：schema 讀取失敗 ${skipped.schema.length}、無 prompt ${skipped.noPrompt.length}` +
      `、要求圖片輸入 ${skipped.requiresImage.length}、非圖片輸出 ${skipped.notImageOutput.length}`
  )
  if (skipped.pricing.length > 0) {
    console.log(`[sync] 計價頁面讀取失敗（未附價格）：\n  ${skipped.pricing.join('\n  ')}`)
  }
}

main().catch((err) => {
  console.error('[sync] 失敗：', err)
  process.exit(1)
})
