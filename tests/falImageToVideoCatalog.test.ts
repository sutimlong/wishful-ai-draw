import { describe, expect, it } from 'vitest'
import { FAL_IMAGE_TO_VIDEO_CATALOG } from '../src/shared/falImageToVideoCatalog'
import {
  DEFAULT_IMAGE_TO_VIDEO_MODEL_ID,
  FAL_IMAGE_TO_VIDEO_MODELS,
  STARRED_IMAGE_TO_VIDEO_IDS,
  findImageToVideoModel
} from '../src/shared/falImageToVideoModels'

describe('FAL 圖片生成影片模型目錄', () => {
  it('應從 fal.ai 同步並收錄所有公開圖生影片模型且無重複 ID', () => {
    expect(FAL_IMAGE_TO_VIDEO_CATALOG.length).toBeGreaterThanOrEqual(100)
    expect(FAL_IMAGE_TO_VIDEO_MODELS.length).toBeGreaterThanOrEqual(
      FAL_IMAGE_TO_VIDEO_CATALOG.length
    )

    const ids = FAL_IMAGE_TO_VIDEO_MODELS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('預設模型與精選推薦模型皆存在於目錄中', () => {
    expect(DEFAULT_IMAGE_TO_VIDEO_MODEL_ID).toBe('google/gemini-omni-flash/v1.2/image-to-video')
    const defaultModel = findImageToVideoModel(DEFAULT_IMAGE_TO_VIDEO_MODEL_ID)
    expect(defaultModel).toBeDefined()
    expect(defaultModel?.name).toBe('Gemini Omni Flash 1.2 Image to Video')

    for (const starredId of STARRED_IMAGE_TO_VIDEO_IDS) {
      const found = findImageToVideoModel(starredId)
      expect(found, `找不到精選模型 ${starredId}`).toBeDefined()
    }
  })

  it('每個圖生影片模型皆具備圖片輸入欄位與合法架構設定', () => {
    for (const model of FAL_IMAGE_TO_VIDEO_MODELS) {
      expect(model.id.trim().length).toBeGreaterThan(0)
      expect(model.name.trim().length).toBeGreaterThan(0)
      expect(model.group?.trim().length).toBeGreaterThan(0)
      expect(model.imageInputField?.trim().length).toBeGreaterThan(0)
      if (model.durationSpec) {
        expect(['number', 'string', 'seconds_string']).toContain(model.durationSpec.type)
      }
      if (model.audioField) {
        expect(['generate_audio', 'generate_audio_switch']).toContain(model.audioField)
      }
    }
  })
})
