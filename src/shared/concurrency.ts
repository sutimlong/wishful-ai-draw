/**
 * 批次生成的同時併發上限。
 *
 * fal.ai 官方《Concurrency Limits》說明：
 * - 新帳號預設 2 個同時 IN_PROGRESS 請求
 * - 隨近 4 週付費金額自動提升
 * - 自助方案（self-serve）最高 40 個同時請求（超過需聯絡 sales）
 * - 超過額度的請求會排隊等待，不會被拒絕
 */
export const MAX_BATCH_CONCURRENCY = 40

/** 將併發數限制在 1 ~ MAX_BATCH_CONCURRENCY 之間（非數字或非整數會先四捨五入） */
export function clampConcurrency(value: number): number {
  const rounded = Number.isFinite(value) ? Math.round(value) : 1
  return Math.max(1, Math.min(MAX_BATCH_CONCURRENCY, rounded))
}
