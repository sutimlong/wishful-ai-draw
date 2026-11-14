import { describe, expect, it } from 'vitest'
import { FAL_TEXT_TO_IMAGE_CATALOG, FAL_TEXT_TO_IMAGE_GROUPS } from '../src/shared/falTextToImageCatalog'

describe('文生圖模型目錄', () => {
  it('收錄 fal.ai 文生圖模型，且每個模型都標註單張預估價格或計價基準', () => {
    expect(FAL_TEXT_TO_IMAGE_CATALOG.length).toBeGreaterThan(100)

    for (const model of FAL_TEXT_TO_IMAGE_CATALOG) {
      // 文生圖不需要來源圖
      expect(model.imageInputField).toBe('')
      // prompt 永遠支援（不會出現在 unsupportedFields 裡）
      expect(model.unsupportedFields ?? []).not.toContain('prompt')
      // 每個模型都要有計價資訊（單張金額或 fal 計價基準）
      expect(model.pricing).toBeTruthy()
    }
  })

  it('包含常見文生圖模型，且分組清單可用', () => {
    const ids = new Set(FAL_TEXT_TO_IMAGE_CATALOG.map((model) => model.id))
    expect(ids.has('fal-ai/flux/schnell')).toBe(true)
    expect(ids.has('fal-ai/nano-banana')).toBe(true)
    expect(FAL_TEXT_TO_IMAGE_GROUPS.length).toBeGreaterThan(0)
    expect(FAL_TEXT_TO_IMAGE_GROUPS.every((group) => group.length > 0)).toBe(true)
  })

  it('部分模型支援參考圖輸入，並標記參考圖欄位名稱', () => {
    const referenceModels = FAL_TEXT_TO_IMAGE_CATALOG.filter(
      (model) => model.referenceImageField
    )
    expect(referenceModels.length).toBeGreaterThan(0)
    for (const model of referenceModels) {
      expect(typeof model.referenceImageField).toBe('string')
      expect(model.referenceImageField.length).toBeGreaterThan(0)
    }
    // 陣列欄位（image_urls）要一併標記
    const arrayRef = referenceModels.filter((model) => model.isArrayReferenceImage)
    expect(arrayRef.length).toBeGreaterThan(0)
  })
})
