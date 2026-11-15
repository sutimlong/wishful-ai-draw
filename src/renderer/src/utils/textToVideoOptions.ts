import type { FalModelPreset, TextToVideoAspect } from '../../../shared/types'

export const VIDEO_ASPECT_RATIOS: { id: TextToVideoAspect; label: string; hint: string }[] = [
  { id: '16:9', label: '16:9', hint: '橫式寬螢幕（YouTube／電影）' },
  { id: '9:16', label: '9:16', hint: '直式短影音（Reels／TikTok）' },
  { id: '1:1', label: '1:1', hint: '正方形（社群貼文）' },
  { id: '4:3', label: '4:3', hint: '經典電視比例' },
  { id: '3:4', label: '3:4', hint: '直拍肖像比例' },
  { id: '21:9', label: '21:9', hint: '電影超寬銀幕' }
]

export const VIDEO_DURATION_OPTIONS = [5, 6, 8, 10] as const

export const VIDEO_RESOLUTION_OPTIONS = ['480p', '720p', '1080p'] as const

/** 產生模型秒數／解析度支援說明，讓使用者了解實際送出行為 */
export function describeVideoModelSupport(model: FalModelPreset | undefined): string[] {
  if (!model) return []
  const notes: string[] = []
  if (model.durationSpec?.enum && model.durationSpec.enum.length > 0) {
    notes.push(`支援秒數：${model.durationSpec.enum.join(' / ')}`)
  } else if (
    model.durationSpec &&
    (typeof model.durationSpec.min === 'number' || typeof model.durationSpec.max === 'number')
  ) {
    const min = model.durationSpec.min ?? 1
    const max = model.durationSpec.max ?? 15
    notes.push(`秒數範圍：${min} ~ ${max} 秒`)
  }

  if (model.resolutionEnum && model.resolutionEnum.length > 0) {
    notes.push(`支援畫質：${model.resolutionEnum.join(' / ')}`)
  } else if (model.videoSizeEnum && model.videoSizeEnum.length > 0) {
    notes.push('輸出尺寸依比例自動對應 video_size')
  }

  return notes
}

/** 依單價與所選秒數估算本次影片生成費用（僅在計價單位可明確換算時回傳） */
export function estimateVideoCostUsd(
  model: FalModelPreset | undefined,
  durationSeconds: number
): { costUsd: number; note: string } | undefined {
  const pricing = model?.pricing
  if (!pricing || typeof pricing.unitPriceUsd !== 'number' || pricing.unitPriceUsd <= 0) {
    return undefined
  }
  const unit = pricing.unit.toLowerCase()
  if (unit === 'seconds') {
    return {
      costUsd: pricing.unitPriceUsd * Math.max(1, durationSeconds),
      note: `依 ${durationSeconds} 秒估算`
    }
  }
  if (unit === '5 seconds') {
    const segments = Math.max(1, Math.ceil(durationSeconds / 5))
    return {
      costUsd: pricing.unitPriceUsd * segments,
      note: `依 ${segments} 個 5 秒區段估算`
    }
  }
  if (unit === 'videos') {
    return {
      costUsd: pricing.unitPriceUsd,
      note: '依單部影片計價'
    }
  }
  return undefined
}

/** 將過期 Preload / 主程序尚未重載造成的 Electron IPC 錯誤轉為可理解的中文指引 */
export function formatElectronIpcError(error: unknown, fallback = '操作失敗，請稍後再試'): string {
  const message = error instanceof Error ? error.message : fallback
  if (/No handler registered/i.test(message)) {
    return '主程序尚未載入最新功能，請停止並重新執行 npm run dev（或重新啟動 App）後再試。'
  }
  if (/is not a function/i.test(message)) {
    return 'Preload 尚未載入最新功能，請停止並重新執行 npm run dev（或重新啟動 App）後再試。'
  }
  return message
}
