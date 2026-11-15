import { describe, expect, it } from 'vitest'
import { FAL_TEXT_TO_VIDEO_CATALOG } from '../src/shared/falTextToVideoCatalog'
import {
  DEFAULT_TEXT_TO_VIDEO_MODEL_ID,
  FAL_TEXT_TO_VIDEO_MODELS,
  STARRED_TEXT_TO_VIDEO_IDS,
  findTextToVideoModel
} from '../src/shared/falTextToVideoModels'

describe('FAL 文字生成影片模型目錄', () => {
  it('應從 fal.ai 同步並收錄多個可用文生影片模型且無重複 ID', () => {
    expect(FAL_TEXT_TO_VIDEO_CATALOG.length).toBeGreaterThanOrEqual(30)
    expect(FAL_TEXT_TO_VIDEO_MODELS.length).toBeGreaterThanOrEqual(FAL_TEXT_TO_VIDEO_CATALOG.length)

    const ids = FAL_TEXT_TO_VIDEO_MODELS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('預設模型與精選推薦模型皆存在於目錄中', () => {
    expect(DEFAULT_TEXT_TO_VIDEO_MODEL_ID).toBe('google/gemini-omni-flash/v1.2/text-to-video')
    const defaultModel = findTextToVideoModel(DEFAULT_TEXT_TO_VIDEO_MODEL_ID)
    expect(defaultModel).toBeDefined()
    expect(defaultModel?.name).toBe('Gemini Omni Flash 1.2 Text to Video')

    for (const starredId of STARRED_TEXT_TO_VIDEO_IDS) {
      const found = findTextToVideoModel(starredId)
      expect(found, `找不到精選模型 ${starredId}`).toBeDefined()
    }
  })

  it('每個模型皆具備名稱、分組與計價資訊（若有）的合法結構', () => {
    for (const model of FAL_TEXT_TO_VIDEO_MODELS) {
      expect(model.id.trim().length).toBeGreaterThan(0)
      expect(model.name.trim().length).toBeGreaterThan(0)
      expect(model.group?.trim().length).toBeGreaterThan(0)
      if (model.durationSpec) {
        expect(['number', 'string', 'seconds_string']).toContain(model.durationSpec.type)
      }
      if (model.audioField) {
        expect(['generate_audio', 'generate_audio_switch']).toContain(model.audioField)
      }
    }
  })
})
