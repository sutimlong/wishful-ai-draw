import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const root = mkdtempSync(join(tmpdir(), 'wishful-output-dirs-'))
const picturesDir = join(root, 'pictures')
process.env['TEST_OUTPUT_ROOT'] = root

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => {
      const base = process.env['TEST_OUTPUT_ROOT'] as string
      if (name === 'pictures') return join(base, 'pictures')
      throw new Error(`unexpected app.getPath: ${name}`)
    }
  }
}))

const {
  OUTPUT_ROOT_FOLDER_NAME,
  TEXT_TO_IMAGE_FOLDER_NAME,
  TEXT_TO_VIDEO_FOLDER_NAME,
  IMAGE_TO_VIDEO_FOLDER_NAME,
  ensureOutputDirectories,
  getOutputRootDirectory,
  getTextToImageOutputDirectory,
  getTextToVideoOutputDirectory,
  getImageToVideoOutputDirectory
} = await import('../src/main/services/outputDirectories')

describe('預設輸出資料夾', () => {
  beforeEach(() => {
    rmSync(picturesDir, { recursive: true, force: true })
  })

  afterAll(() => {
    rmSync(root, { recursive: true, force: true })
    delete process.env['TEST_OUTPUT_ROOT']
  })

  it('路徑固定為「圖片 / Wishful_Ai_Draw」與「文生圖」「文生影片」「圖生影片」', () => {
    expect(OUTPUT_ROOT_FOLDER_NAME).toBe('Wishful_Ai_Draw')
    expect(TEXT_TO_IMAGE_FOLDER_NAME).toBe('文生圖')
    expect(TEXT_TO_VIDEO_FOLDER_NAME).toBe('文生影片')
    expect(IMAGE_TO_VIDEO_FOLDER_NAME).toBe('圖生影片')
    expect(getOutputRootDirectory()).toBe(join(picturesDir, 'Wishful_Ai_Draw'))
    expect(getTextToImageOutputDirectory()).toBe(
      join(picturesDir, 'Wishful_Ai_Draw', '文生圖')
    )
    expect(getTextToVideoOutputDirectory()).toBe(
      join(picturesDir, 'Wishful_Ai_Draw', '文生影片')
    )
    expect(getImageToVideoOutputDirectory()).toBe(
      join(picturesDir, 'Wishful_Ai_Draw', '圖生影片')
    )
  })

  it('第一次進入時自動建立根資料夾與「文生圖」「文生影片」「圖生影片」子資料夾', () => {
    const directories = ensureOutputDirectories()

    expect(directories).toEqual({
      stylize: join(picturesDir, 'Wishful_Ai_Draw'),
      textToImage: join(picturesDir, 'Wishful_Ai_Draw', '文生圖'),
      textToVideo: join(picturesDir, 'Wishful_Ai_Draw', '文生影片'),
      imageToVideo: join(picturesDir, 'Wishful_Ai_Draw', '圖生影片')
    })
    expect(existsSync(directories.stylize)).toBe(true)
    expect(existsSync(directories.textToImage)).toBe(true)
    expect(existsSync(directories.textToVideo)).toBe(true)
    expect(existsSync(directories.imageToVideo)).toBe(true)
  })

  it('資料夾被刪除後再次呼叫會重新建立', () => {
    ensureOutputDirectories()
    rmSync(picturesDir, { recursive: true, force: true })

    const directories = ensureOutputDirectories()

    expect(existsSync(directories.stylize)).toBe(true)
    expect(existsSync(directories.textToImage)).toBe(true)
    expect(existsSync(directories.textToVideo)).toBe(true)
    expect(existsSync(directories.imageToVideo)).toBe(true)
  })
})
