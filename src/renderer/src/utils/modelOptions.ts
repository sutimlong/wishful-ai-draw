import { FalModelPreset } from '@shared/types'

export interface ModelGroup {
  label: string
  models: FalModelPreset[]
}

/** 搜尋結果不含目前選用模型時，補上的臨時分組名稱 */
export const SELECTED_MODEL_GROUP = '目前選擇'

/**
 * 將模型目錄整理成下拉選單分組，並依關鍵字（名稱 / 端點 / 實驗室）過濾。
 *
 * 若過濾結果不含目前選用的模型，會在最前面補一個「目前選擇」分組，
 * 避免 <select> 找不到對應 <option> 時顯示空白。
 */
export function buildModelGroups(
  catalog: FalModelPreset[],
  query: string,
  selectedId: string,
  starredIds?: Iterable<string>
): ModelGroup[] {
  const keyword = query.trim().toLowerCase()
  const groups: ModelGroup[] = []
  const starredSet = new Set(starredIds ?? [])
  const orderedCatalog =
    starredSet.size > 0
      ? [...catalog].sort(
          (a, b) => Number(starredSet.has(b.id)) - Number(starredSet.has(a.id))
        )
      : catalog

  for (const preset of orderedCatalog) {
    if (keyword) {
      const haystack = `${preset.name} ${preset.id} ${preset.group ?? ''}`.toLowerCase()
      if (!haystack.includes(keyword)) continue
    }
    const label = preset.group ?? '其他'
    const group = groups.find((item) => item.label === label)
    if (group) {
      group.models.push(preset)
    } else {
      groups.push({ label, models: [preset] })
    }
  }

  const containsSelected = groups.some((group) =>
    group.models.some((model) => model.id === selectedId)
  )
  if (!containsSelected) {
    const selected = catalog.find((model) => model.id === selectedId)
    if (selected) {
      groups.unshift({ label: SELECTED_MODEL_GROUP, models: [selected] })
    }
  }

  return groups
}

/** 搜尋關鍵字是否有任何實際結果（排除「目前選擇」分組） */
export function hasModelSearchResults(groups: ModelGroup[]): boolean {
  return groups.some((group) => group.label !== SELECTED_MODEL_GROUP)
}
