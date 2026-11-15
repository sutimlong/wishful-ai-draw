import { FalModelPreset, FalModelPricing } from './types'

/**
 * 換算「一張圖片」價格時假設的輸出面積：1024×1024（約 1 MP），與 App 預設輸出尺寸一致。
 *
 * fal 對以像素計價的模型（fal-ai/flux/* 等）是「每百萬像素」收費，實際金額會隨輸出尺寸變動，
 * 因此用這個基準換算成單張預估金額。
 */
export const ASSUMED_OUTPUT_MEGAPIXELS = 1

/** fal 計價單位的中文名稱 */
const UNIT_LABELS: Record<string, string> = {
  images: '張',
  videos: '部',
  'video segments': '片段',
  '5 seconds': '5 秒',
  generations: '次',
  '1': '次',
  units: '單位',
  credits: '點數',
  megapixels: 'MP',
  'processed megapixels': 'MP（輸入＋輸出）',
  'compute seconds': '運算秒',
  seconds: '秒',
  '1000 tokens': '1K tokens',
  '1m tokens': '1M tokens'
}

/** 計價單位轉中文標籤（未知單位原樣顯示） */
export function formatUnitLabel(unit: string): string {
  return UNIT_LABELS[unit] ?? unit
}

/**
 * 格式化 USD 金額：一般金額 2 位小數，極小金額（< $0.01）保留到看得見的有效位數。
 * （與 utils/cost.ts 的 formatUsd 不同：這裡會保留每秒／每 MP 之類的細額費率）
 */
export function formatPriceUsd(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '$0.00'
  if (amount >= 0.01) return `$${amount.toFixed(2)}`
  const fixed = amount.toFixed(5).replace(/0+$/, '')
  return `$${fixed.endsWith('.') ? fixed.slice(0, -1) : fixed}`
}

/** 單張圖片的價格字串，例如 `$0.04 / 張`、`~$0.03 / 張`；無法換算時回傳 undefined */
export function formatPerImagePrice(pricing?: FalModelPricing): string | undefined {
  if (!pricing || typeof pricing.perImageUsd !== 'number' || pricing.perImageUsd <= 0) {
    return undefined
  }
  const prefix = pricing.isEstimate ? '~' : ''
  return `${prefix}${formatPriceUsd(pricing.perImageUsd)} / 張`
}

/** fal 公布單價的字串，例如 `$0.0019 / 運算秒`；未公布時回傳 undefined */
export function formatUnitPrice(pricing?: FalModelPricing): string | undefined {
  if (!pricing || typeof pricing.unitPriceUsd !== 'number' || pricing.unitPriceUsd <= 0) {
    return undefined
  }
  return `${formatPriceUsd(pricing.unitPriceUsd)} / ${formatUnitLabel(pricing.unit)}`
}

/**
 * 下拉選單選項後面的價格標籤。
 *
 * 優先顯示「生成一張圖片的預估金額」；無法換算時退回 fal 的原始計價基準
 * （例如每秒計價的即時模型、未公布單價的舊端點）。
 */
export function formatModelPriceTag(pricing?: FalModelPricing): string {
  const perImage = formatPerImagePrice(pricing)
  if (perImage) return perImage
  // token 計價模型的「單位價」不代表單張費用（例如 gpt-image 的 1 unit ≈ 1 美元計價單位），
  // 只顯示計價方式，避免誤導
  if (pricing && /token/i.test(pricing.basis)) return '依 token 用量'
  const unitPrice = formatUnitPrice(pricing)
  if (unitPrice) return unitPrice
  return '未公布單價'
}

/** 已選模型的價格說明（價格標籤 + 換算依據） */
export function describeModelPricing(pricing?: FalModelPricing): string {
  if (!pricing) return 'fal.ai 未提供此端點的計價資訊'
  const perImage = formatPerImagePrice(pricing)
  if (perImage) return `${perImage} · ${pricing.basis}`
  const unitPrice = formatUnitPrice(pricing)
  if (unitPrice && !/token/i.test(pricing.basis)) return `${unitPrice} · ${pricing.basis}`
  return pricing.basis
}

/** 生成一張圖片的預估費用（USD）；fal 未公布或無法換算時回傳 undefined */
export function estimatePerImageCostUsd(model: FalModelPreset): number | undefined {
  const value = model.pricing?.perImageUsd
  return typeof value === 'number' && value > 0 ? value : undefined
}

/** 批次預估總費用（僅計算目錄中有公布單張價格的模型） */
export function estimateBatchCostUsd(model: FalModelPreset, imageCount: number): number | undefined {
  const perImage = estimatePerImageCostUsd(model)
  if (perImage === undefined || !Number.isFinite(imageCount) || imageCount <= 0) return undefined
  return perImage * imageCount
}
