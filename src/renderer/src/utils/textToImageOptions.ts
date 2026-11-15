import type { TextToImageAspect } from '@shared/types'

/** 畫面比例選項（實際像素為 fal.ai 常見的可整除尺寸） */
export const ASPECT_RATIOS: {
  id: TextToImageAspect
  label: string
  hint: string
  width: number
  height: number
}[] = [
  { id: '1:1', label: '1:1', hint: '1024 × 1024 方形', width: 1024, height: 1024 },
  { id: '16:9', label: '16:9', hint: '1344 × 768 寬幅', width: 1344, height: 768 },
  { id: '9:16', label: '9:16', hint: '768 × 1344 直式', width: 768, height: 1344 },
  { id: '4:3', label: '4:3', hint: '1152 × 896 橫式', width: 1152, height: 896 },
  { id: '3:4', label: '3:4', hint: '896 × 1152 直立', width: 896, height: 1152 }
]

export const IMAGE_COUNTS = [1, 2, 4] as const
export const OUTPUT_FORMATS = ['png', 'jpeg'] as const
export type TextToImageOutputFormat = (typeof OUTPUT_FORMATS)[number]

/** 陣列欄位模型最多可加入的參考圖張數（避免一次上傳過多檔案） */
export const MAX_REFERENCE_IMAGES = 10
