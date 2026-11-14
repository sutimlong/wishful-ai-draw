import { describe, expect, it } from 'vitest'
import { FalModelPreset } from '../src/shared/types'
import {
  SELECTED_MODEL_GROUP,
  buildModelGroups,
  hasModelSearchResults
} from '../src/renderer/src/utils/modelOptions'

const fixture: FalModelPreset[] = [
  {
    id: 'fal-ai/gpt-image-2.6-sunburst/edit',
    name: 'GPT Image 2.6 Sunburst (OpenAI)',
    description: '預設模型',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    group: '精選推薦（已驗證）',
    defaultParams: {}
  },
  {
    id: 'fal-ai/nano-banana-pro/edit',
    name: 'Nano Banana Pro',
    description: '',
    imageInputField: 'image_urls',
    group: 'Google',
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux/dev/image-to-image',
    name: 'FLUX.1 [dev]',
    description: '',
    imageInputField: 'image_url',
    group: 'Black Forest Labs',
    defaultParams: {}
  },
  {
    id: 'fal-ai/aura-sr',
    name: 'AuraSR',
    description: '',
    imageInputField: 'image_url',
    group: 'fal.ai 工具與影像處理',
    defaultParams: {}
  }
]

const DEFAULT_ID = 'fal-ai/gpt-image-2.6-sunburst/edit'

describe('buildModelGroups', () => {
  it('無關鍵字時依目錄順序分組', () => {
    const groups = buildModelGroups(fixture, '', DEFAULT_ID)
    expect(groups.map((group) => group.label)).toEqual([
      '精選推薦（已驗證）',
      'Google',
      'Black Forest Labs',
      'fal.ai 工具與影像處理'
    ])
    expect(groups[0].models).toHaveLength(1)
  })

  it('可用模型名稱搜尋且不分大小寫', () => {
    const groups = buildModelGroups(fixture, 'nano BANANA', DEFAULT_ID)
    expect(groups).toHaveLength(2)
    expect(groups[0].label).toBe(SELECTED_MODEL_GROUP)
    expect(groups[1].label).toBe('Google')
    expect(groups[1].models[0].id).toBe('fal-ai/nano-banana-pro/edit')
  })

  it('可用端點路徑搜尋', () => {
    const groups = buildModelGroups(fixture, 'flux/dev', DEFAULT_ID)
    const fluxGroup = groups.find((group) => group.label === 'Black Forest Labs')
    expect(fluxGroup?.models).toHaveLength(1)
  })

  it('可用實驗室 / 分組名稱搜尋', () => {
    const groups = buildModelGroups(fixture, 'black forest', DEFAULT_ID)
    expect(groups.some((group) => group.label === 'Black Forest Labs')).toBe(true)
    expect(groups.some((group) => group.label === 'Google')).toBe(false)
  })

  it('搜尋結果不含目前模型時，補上「目前選擇」分組', () => {
    const groups = buildModelGroups(fixture, 'aura', DEFAULT_ID)
    expect(groups[0].label).toBe(SELECTED_MODEL_GROUP)
    expect(groups[0].models[0].id).toBe(DEFAULT_ID)
  })

  it('目前模型已在搜尋結果中時，不重複補分組', () => {
    const groups = buildModelGroups(fixture, 'sunburst', DEFAULT_ID)
    expect(groups.some((group) => group.label === SELECTED_MODEL_GROUP)).toBe(false)
    expect(groups[0].models[0].id).toBe(DEFAULT_ID)
  })

  it('自訂端點不在目錄中時，不會產生空分組', () => {
    const groups = buildModelGroups(fixture, 'aura', 'custom/endpoint')
    expect(groups.map((group) => group.label)).toEqual(['fal.ai 工具與影像處理'])
  })

  it('hasModelSearchResults 會忽略「目前選擇」分組', () => {
    expect(hasModelSearchResults(buildModelGroups(fixture, 'aura', DEFAULT_ID))).toBe(true)
    expect(hasModelSearchResults(buildModelGroups(fixture, 'not-exist', DEFAULT_ID))).toBe(false)
  })
})
