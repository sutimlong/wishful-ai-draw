import { FAL_TEXT_TO_VIDEO_CATALOG } from './falTextToVideoCatalog'
import { FalModelPreset } from './types'

/**
 * 若需手動補充 sync 尚未收錄的文生影片模型，可加在這裡（不會被 sync:fal-text-to-video 覆寫）。
 */
export const FAL_TEXT_TO_VIDEO_EXTRA_MODELS: FalModelPreset[] = []

/**
 * 常用／精選文字生成影片模型（顯示在下拉選單最上方的「常用推薦」群組，其餘依廠商分組）
 */
export const STARRED_TEXT_TO_VIDEO_IDS: string[] = [
  'google/gemini-omni-flash/v1.2/text-to-video',
  'minimax/h3-max-turbo/text-to-video',
  'fal-ai/kling-video/v3/pro/text-to-video',
  'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
  'alibaba/wan-3.0/text-to-video',
  'bytedance/seedance-2.5/us/text-to-video',
  'xai/grok-imagine-video/text-to-video',
  'lightricks/ltx-2.5/text-to-video/pro'
]

function mergeVideoCatalog(): FalModelPreset[] {
  const byId = new Map<string, FalModelPreset>()
  for (const model of FAL_TEXT_TO_VIDEO_CATALOG) {
    byId.set(model.id, model)
  }
  for (const extra of FAL_TEXT_TO_VIDEO_EXTRA_MODELS) {
    if (!byId.has(extra.id)) {
      byId.set(extra.id, extra)
    }
  }
  return Array.from(byId.values())
}

/** 合併自動同步與手動補充的完整文生影片模型清單 */
export const FAL_TEXT_TO_VIDEO_MODELS: FalModelPreset[] = mergeVideoCatalog()

/** 預設文字生成影片模型 ID */
export const DEFAULT_TEXT_TO_VIDEO_MODEL_ID: string =
  FAL_TEXT_TO_VIDEO_MODELS.find((m) => m.id === 'google/gemini-omni-flash/v1.2/text-to-video')?.id ??
  FAL_TEXT_TO_VIDEO_MODELS[0]?.id ??
  'google/gemini-omni-flash/v1.2/text-to-video'

export function findTextToVideoModel(endpointId: string): FalModelPreset | undefined {
  return FAL_TEXT_TO_VIDEO_MODELS.find((m) => m.id === endpointId)
}
