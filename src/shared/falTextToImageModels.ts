import { FalModelPreset } from './types'
import { FAL_TEXT_TO_IMAGE_CATALOG } from './falTextToImageCatalog'
import { FAL_TEXT_TO_IMAGE_EXTRA_MODELS } from './falTextToImageExtraModels'

/**
 * 要在名稱前面加上「★」精選標記的模型 id。
 * 涵蓋同步目錄與手動補充模型；已含「★」的名稱不會重複加星。
 */
const STARRED_MODEL_IDS = new Set([
  'fal-ai/nano-banana-pro/edit',
  'fal-ai/nano-banana-2/edit',
  'openai/gpt-image-2/edit',
  'fal-ai/kling-image/o1',
  'wan/v2.6/text-to-image',
  'fal-ai/flux-pro/kontext/multi',
  'fal-ai/flux-pro/kontext/max/multi'
])

/** 依 id 決定是否在名稱前加「★」 */
function withStar(model: FalModelPreset): FalModelPreset {
  if (!STARRED_MODEL_IDS.has(model.id) || model.name.startsWith('★')) return model
  return { ...model, name: `★ ${model.name}` }
}

/**
 * 文生圖頁面實際使用的模型清單：
 * fal.ai 同步目錄（自動產生）＋ 手動補充模型，並套用「★」精選標記。
 *
 * 這樣可以加入同步目錄沒有的模型，又不會在重新執行
 * `npm run sync:fal-text-to-image` 時被覆蓋。
 */
export const FAL_TEXT_TO_IMAGE_MODELS: FalModelPreset[] = [
  ...FAL_TEXT_TO_IMAGE_CATALOG,
  ...FAL_TEXT_TO_IMAGE_EXTRA_MODELS
].map(withStar)

/** 下拉選單的分組順序（與 buildModelGroups 一樣依首次出現順序） */
export const FAL_TEXT_TO_IMAGE_MODEL_GROUPS: string[] = FAL_TEXT_TO_IMAGE_MODELS.reduce<string[]>(
  (groups, model) => {
    const group = model.group ?? '其他'
    if (!groups.includes(group)) groups.push(group)
    return groups
  },
  []
)
