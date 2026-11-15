import { app } from 'electron'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { OutputDirectories } from '../../shared/types'

/** 應用程式在「圖片」資料夾下建立的根資料夾名稱 */
export const OUTPUT_ROOT_FOLDER_NAME = 'Wishful_Ai_Draw'

/** 文字生成圖片使用的子資料夾名稱 */
export const TEXT_TO_IMAGE_FOLDER_NAME = '文生圖'

/** 文字生成影片使用的子資料夾名稱 */
export const TEXT_TO_VIDEO_FOLDER_NAME = '文生影片'

/** 圖片生成影片使用的子資料夾名稱 */
export const IMAGE_TO_VIDEO_FOLDER_NAME = '圖生影片'

/** 影像風格化預設輸出資料夾：Mac「圖片 / Wishful_Ai_Draw」 */
export function getOutputRootDirectory(): string {
  return join(app.getPath('pictures'), OUTPUT_ROOT_FOLDER_NAME)
}

/** 文字生成圖片輸出資料夾：Mac「圖片 / Wishful_Ai_Draw / 文生圖」 */
export function getTextToImageOutputDirectory(): string {
  const directory = join(getOutputRootDirectory(), TEXT_TO_IMAGE_FOLDER_NAME)
  ensureDirectory(directory)
  return directory
}

/** 文字生成影片輸出資料夾：Mac「圖片 / Wishful_Ai_Draw / 文生影片」 */
export function getTextToVideoOutputDirectory(): string {
  const directory = join(getOutputRootDirectory(), TEXT_TO_VIDEO_FOLDER_NAME)
  ensureDirectory(directory)
  return directory
}

/** 圖片生成影片輸出資料夾：Mac「圖片 / Wishful_Ai_Draw / 圖生影片」 */
export function getImageToVideoOutputDirectory(): string {
  const directory = join(getOutputRootDirectory(), IMAGE_TO_VIDEO_FOLDER_NAME)
  ensureDirectory(directory)
  return directory
}

function ensureDirectory(directory: string): void {
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true })
  }
}

/**
 * 確保「圖片 / Wishful_Ai_Draw / 文生圖／文生影片／圖生影片」資料夾結構存在。
 *
 * 應用程式啟動、第一次進入頁面與查詢輸出路徑時都會呼叫，
 * 因此即使使用者手動刪除資料夾，下次進入時也會自動重新建立。
 */
export function ensureOutputDirectories(): OutputDirectories {
  const stylize = getOutputRootDirectory()
  let textToImage = join(stylize, TEXT_TO_IMAGE_FOLDER_NAME)
  let textToVideo = join(stylize, TEXT_TO_VIDEO_FOLDER_NAME)
  let imageToVideo = join(stylize, IMAGE_TO_VIDEO_FOLDER_NAME)

  try {
    ensureDirectory(stylize)
    textToImage = getTextToImageOutputDirectory()
    textToVideo = getTextToVideoOutputDirectory()
    imageToVideo = getImageToVideoOutputDirectory()
  } catch (err) {
    // 建立失敗時仍回傳路徑，讓各功能在實際寫檔時能回報較清楚的錯誤
    console.error('建立預設輸出資料夾失敗：', err)
  }

  return { stylize, textToImage, textToVideo, imageToVideo }
}
