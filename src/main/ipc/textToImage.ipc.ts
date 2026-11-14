import { app, dialog, ipcMain } from 'electron'
import { basename, extname, join } from 'path'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import {
  TextToImageDownloadResult,
  TextToImageFileEntry,
  TextToImageGeneratedImage,
  TextToImageListResult,
  TextToImageRequest,
  TextToImageResult
} from '../../shared/types'
import { FAL_TEXT_TO_IMAGE_MODELS } from '../../shared/falTextToImageModels'
import { estimatePerImageCostUsd } from '../../shared/falPricing'
import { getSettingsStore } from '../services/store'
import { falService } from '../services/falService'
import { textToImageService, aspectPixels } from '../services/textToImageService'
import { downloadOrSaveOutputImage } from '../services/imageDownloader'
import { usageLogger } from '../services/usageLoggerWiring'
import { toLocalMediaUrl } from './file.ipc'

/** 文生圖輸出檔的命名規則（不依賴來源圖檔名） */
const TEXT_TO_IMAGE_NAMING_PATTERN = 'text2img_{timestamp}_{index}'
/** 文生圖成果存放的根資料夾名稱 */
const TEXT_TO_IMAGE_BASE_FOLDER = 'Wishful_Ai_Draw'
/** 文生圖子資料夾名稱 */
const TEXT_TO_IMAGE_FOLDER_NAME = '文生圖'
/** 可顯示的圖片副檔名 */
const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

/** 文生圖結果一律存放在 Mac「圖片 / Wishful_Ai_Draw / 文生圖」資料夾 */
export function getTextToImageOutputDirectory(): string {
  const baseDirectory = join(app.getPath('pictures'), TEXT_TO_IMAGE_BASE_FOLDER)
  const directory = join(baseDirectory, TEXT_TO_IMAGE_FOLDER_NAME)
  if (!existsSync(baseDirectory)) mkdirSync(baseDirectory, { recursive: true })
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true })
  return directory
}

/** 應用程式啟動時呼叫：確保「圖片 / Wishful_Ai_Draw / 文生圖」資料夾結構存在 */
export function ensureTextToImageDirectories(): void {
  getTextToImageOutputDirectory()
}

/** 把一張遠端圖片存到本機，回傳儲存路徑 */
function saveImageToDisk(
  url: string,
  directory: string,
  outputFormat: 'png' | 'jpeg',
  index: number
): Promise<string> {
  return downloadOrSaveOutputImage({
    outputImageUrl: url,
    sourceFilePath: 'text2img.png',
    outputDirectory: directory,
    namingPattern: TEXT_TO_IMAGE_NAMING_PATTERN,
    outputFormat,
    index
  })
}

/** 列出「文生圖」資料夾中的所有圖片（依修改時間新到舊） */
function listTextToImageFiles(directory: string): TextToImageFileEntry[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.has(extname(entry.name).toLowerCase()))
    .map((entry) => {
      const filePath = join(directory, entry.name)
      const stat = statSync(filePath)
      return {
        filePath,
        url: toLocalMediaUrl(filePath),
        fileName: entry.name,
        modifiedAt: stat.mtimeMs
      }
    })
    .sort((a, b) => b.modifiedAt - a.modifiedAt)
}

/** 把本機檔案複製一份到系統「下載」資料夾（檔名衝突時自動加序號） */
function copyToDownloads(filePath: string): string {
  const downloads = app.getPath('downloads')
  const ext = extname(filePath)
  const name = basename(filePath, ext)

  let target = join(downloads, `${name}${ext}`)
  let counter = 1
  while (existsSync(target)) {
    target = join(downloads, `${name}_${counter}${ext}`)
    counter++
  }
  copyFileSync(filePath, target)
  return target
}

/** 跳出「另存新檔」對話框，讓使用者選擇儲存位置，再把檔案複製過去 */
async function saveImageAs(filePath: string): Promise<TextToImageDownloadResult> {
  const ext = extname(filePath).toLowerCase()
  const result = await dialog.showSaveDialog({
    title: '儲存圖片',
    defaultPath: join(app.getPath('downloads'), basename(filePath)),
    filters: [
      { name: 'Images', extensions: [ext.replace('.', '') || 'png'] }
    ]
  })

  if (result.canceled || !result.filePath) {
    return { ok: false, message: '已取消儲存', canceled: true }
  }

  copyFileSync(filePath, result.filePath)
  return { ok: true, filePath: result.filePath }
}

export function registerTextToImageIpc(): void {
  ipcMain.handle(
    IPC_CHANNELS.TEXT_TO_IMAGE_GENERATE,
    async (_event, request: TextToImageRequest): Promise<TextToImageResult> => {
      const settings = getSettingsStore().getSettings()
      const model = FAL_TEXT_TO_IMAGE_MODELS.find((entry) => entry.id === request.endpointId)
      const { width, height } = aspectPixels(request.aspectId)

      try {
        // 編輯模型若必須提供參考圖，缺少時直接回傳清楚的錯誤
        if (model?.requiresReferenceImage && !request.referenceImageFilePath) {
          return {
            ok: false,
            message: '此模型必須提供參考圖才能生成，請先加入一張參考圖'
          }
        }

        // 參考圖：先上傳到 fal.storage，再帶入模型對應欄位
        let referenceImageUrl: string | undefined
        if (request.referenceImageFilePath) {
          if (!model?.referenceImageField) {
            return {
              ok: false,
              message: '目前選用的模型不支援參考圖，請改用標示「可參考圖」的模型'
            }
          }
          referenceImageUrl = await falService.uploadLocalImage(
            request.referenceImageFilePath,
            undefined,
            settings.falApiKey
          )
        }

        const { outputImageUrls, requestId } = await textToImageService.generate(
          request,
          settings.falApiKey,
          referenceImageUrl
        )

        // 結果一律存到 Mac「圖片/文生圖」資料夾（保留在電腦中，不會因新的生成而丟失）
        const outputDirectory = getTextToImageOutputDirectory()
        const images: TextToImageGeneratedImage[] = []
        for (let i = 0; i < outputImageUrls.length; i++) {
          const url = outputImageUrls[i]
          const savedFilePath = await saveImageToDisk(url, outputDirectory, request.outputFormat, i + 1)

          images.push({ url, width, height, savedFilePath })

          // 每張成功圖片寫一列 Google 使用記錄；記錄失敗不影響回傳結果
          try {
            usageLogger.recordTextToImageGenerated({
              endpointId: request.endpointId,
              sourceFileName: basename(savedFilePath),
              costUsd: model ? estimatePerImageCostUsd(model) : undefined,
              costIsEstimated: model?.pricing?.isEstimate === true || model?.pricing?.perImageUsd === undefined
            })
          } catch (logErr) {
            console.error('寫入文字生成圖片使用記錄失敗：', logErr)
          }
        }

        const perImage = model ? estimatePerImageCostUsd(model) : undefined
        const costUsd = typeof perImage === 'number' ? perImage * images.length : undefined

        return {
          ok: true,
          images,
          endpointId: request.endpointId,
          requestId,
          costUsd,
          costIsEstimated: model?.pricing?.isEstimate === true || perImage === undefined
        }
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : '文字生成圖片失敗，請稍後再試'
        }
      }
    }
  )

  // 將單張圖片下載到系統「下載」資料夾（滑鼠移到圖片上的下載按鈕使用）
  ipcMain.handle(
    IPC_CHANNELS.TEXT_TO_IMAGE_DOWNLOAD,
    async (
      _event,
      payload: { url: string; outputFormat: 'png' | 'jpeg' }
    ): Promise<TextToImageDownloadResult> => {
      try {
        const filePath = await saveImageToDisk(
          payload.url,
          app.getPath('downloads'),
          payload.outputFormat,
          1
        )
        return { ok: true, filePath }
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : '下載失敗，請稍後再試'
        }
      }
    }
  )

  // 列出「文生圖」資料夾中的所有圖片（頁面每次進入／生成後讀取顯示）
  ipcMain.handle(
    IPC_CHANNELS.TEXT_TO_IMAGE_LIST_OUTPUTS,
    async (): Promise<TextToImageListResult> => {
      try {
        const files = listTextToImageFiles(getTextToImageOutputDirectory())
        return { ok: true, files }
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : '讀取文生圖資料夾失敗'
        }
      }
    }
  )

  // 把「文生圖」資料夾中的本機圖片複製一份到系統「下載」資料夾
  ipcMain.handle(
    IPC_CHANNELS.TEXT_TO_IMAGE_COPY_TO_DOWNLOADS,
    async (_event, filePath: string): Promise<TextToImageDownloadResult> => {
      try {
        const target = copyToDownloads(filePath)
        return { ok: true, filePath: target }
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : '下載失敗，請稍後再試'
        }
      }
    }
  )

  // 跳出「另存新檔」對話框讓使用者選擇儲存位置
  ipcMain.handle(
    IPC_CHANNELS.TEXT_TO_IMAGE_SAVE_AS,
    async (_event, filePath: string): Promise<TextToImageDownloadResult> => {
      try {
        return await saveImageAs(filePath)
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : '儲存失敗，請稍後再試'
        }
      }
    }
  )
}
