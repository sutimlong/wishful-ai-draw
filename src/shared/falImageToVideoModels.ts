import { FAL_IMAGE_TO_VIDEO_CATALOG } from './falImageToVideoCatalog'
import { FalModelPreset } from './types'

/**
 * 額外手動補充之常用 fal.ai 圖生影片模型（優先置於清單前段，若同步目錄已收錄同 ID 則以同步版本為準）
 */
export const FAL_IMAGE_TO_VIDEO_EXTRA_MODELS: FalModelPreset[] = []

/** 精選推薦圖生影片模型清單（支援常用單圖動起來與高品質電影感片段） */
export const STARRED_IMAGE_TO_VIDEO_IDS = new Set<string>([
  'google/gemini-omni-flash/v1.2/image-to-video',
  'google/gemini-omni-flash/v1.2/reference-to-video',
  'fal-ai/kling-video/v3/pro/image-to-video',
  'fal-ai/kling-video/v3/standard/image-to-video',
  'kling/v4/image-to-video',
  'minimax/h3-max/image-to-video',
  'minimax/h3-max-turbo/image-to-video',
  'alibaba/wan-3.0-prime/image-to-video',
  'bytedance/seedance-2.5/us/image-to-video',
  'xai/grok-imagine-video/v1.5/image-to-video'
])

const CATALOG_IDS = new Set(FAL_IMAGE_TO_VIDEO_CATALOG.map((model) => model.id))

/** 圖生影片頁面使用的完整 fal.ai 模型清單 */
export const FAL_IMAGE_TO_VIDEO_MODELS: FalModelPreset[] = [
  ...FAL_IMAGE_TO_VIDEO_EXTRA_MODELS.filter((model) => !CATALOG_IDS.has(model.id)),
  ...FAL_IMAGE_TO_VIDEO_CATALOG
]

export const DEFAULT_IMAGE_TO_VIDEO_MODEL_ID =
  FAL_IMAGE_TO_VIDEO_MODELS.find(
    (model) => model.id === 'google/gemini-omni-flash/v1.2/image-to-video'
  )?.id ??
  FAL_IMAGE_TO_VIDEO_MODELS[0]?.id ??
  'google/gemini-omni-flash/v1.2/image-to-video'

export function findImageToVideoModel(endpointId: string): FalModelPreset | undefined {
  const normalized = endpointId.trim()
  return FAL_IMAGE_TO_VIDEO_MODELS.find((model) => model.id === normalized)
}
