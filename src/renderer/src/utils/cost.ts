import { BatchItem } from '@shared/types'

/** 將 USD 金額格式化為適合顯示的字串（極小金額保留 4 位小數） */
export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '$0.00'
  if (amount < 0.01) return `$${amount.toFixed(4)}`
  return `$${amount.toFixed(2)}`
}

/** 單張圖片的費用標籤；無費用資料時回傳 null（預估費用會加上 `~` 前綴） */
export function formatItemCost(item: BatchItem): string | null {
  if (typeof item.apiCostUsd !== 'number') return null
  const prefix = item.apiCostIsEstimated ? '~' : ''
  return `${prefix}${formatUsd(item.apiCostUsd)}`
}
