import { app, dialog, ipcMain } from 'electron'
import { basename, extname, join } from 'path'
import { copyFileSync, existsSync, readdirSync, statSync } from 'fs'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import {
  FalModelPreset,
  TextToImageChatRequest,
  TextToImageChatResult,
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
import { getTextToImageOutputDirectory } from '../services/outputDirectories'
import { createDeepSeekChatCompletion, DEEPSEEK_CHAT_MODEL } from '../services/deepSeekService'
import {
  buildTextToImageChatMessages,
  buildTextToImageChatSystemPrompt,
  collectTextToImageChatReferencePaths,
  collectTextToImageChatVisionTargets,
  findChatModel,
  parseTextToImageChatDecision,
  resolveChatSuggestedModels
} from '../services/textToImageChat'
import { toTextToImageChatImageDataUrl } from '../services/textToImageChatImage'
import { usageLogger } from '../services/usageLoggerWiring'
import { toLocalMediaUrl } from './file.ipc'

/** 文生圖輸出檔的命名規則（不依賴來源圖檔名） */
const TEXT_TO_IMAGE_NAMING_PATTERN = 'text2img_{timestamp}_{index}'
/** 可顯示的圖片副檔名 */
const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

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

interface SavedTextToImageOutputs {
  images: TextToImageGeneratedImage[]
  costUsd?: number
  costIsEstimated: boolean
}

/**
 * 把 fal.ai 回傳的圖片存到「文生圖」資料夾，並寫入使用記錄。
 * 提示詞模式與對話模式共用，確保兩種流程的存檔與計費行為一致。
 */
async function saveGeneratedTextToImageOutputs(options: {
  outputImageUrls: string[]
  outputFormat: 'png' | 'jpeg'
  endpointId: string
  model?: FalModelPreset
  width: number
  height: number
}): Promise<SavedTextToImageOutputs> {
  const { outputImageUrls, outputFormat, endpointId, model, width, height } = options
  const outputDirectory = getTextToImageOutputDirectory()
  const images: TextToImageGeneratedImage[] = []
  const perImage = model ? estimatePerImageCostUsd(model) : undefined
  const costIsEstimated = model?.pricing?.isEstimate === true || perImage === undefined

  for (let i = 0; i < outputImageUrls.length; i++) {
    const url = outputImageUrls[i]
    const savedFilePath = await saveImageToDisk(url, outputDirectory, outputFormat, i + 1)
    images.push({ url, width, height, savedFilePath })

    // 每張成功圖片寫一列 Google 使用記錄；記錄失敗不影響回傳結果
    try {
      usageLogger.recordTextToImageGenerated({
        endpointId,
        sourceFileName: basename(savedFilePath),
        costUsd: perImage,
        costIsEstimated
      })
    } catch (logErr) {
      console.error('寫入文字生成圖片使用記錄失敗：', logErr)
    }
  }

  const costUsd = typeof perImage === 'number' ? perImage * images.length : undefined
  return { images, costUsd, costIsEstimated }
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
        // 支援多張參考圖（優先使用陣列；保留舊版單張欄位）
        const referencePaths =
          request.referenceImageFilePaths && request.referenceImageFilePaths.length > 0
            ? request.referenceImageFilePaths
            : request.referenceImageFilePath
              ? [request.referenceImageFilePath]
              : []

        // 編輯模型若必須提供參考圖，缺少時直接回傳清楚的錯誤
        if (model?.requiresReferenceImage && referencePaths.length === 0) {
          return {
            ok: false,
            message: '此模型必須提供參考圖才能生成，請先加入參考圖'
          }
        }

        // 參考圖：先上傳到 fal.storage，再帶入模型對應欄位
        let referenceImageUrls: string[] = []
        if (referencePaths.length > 0) {
          if (!model?.referenceImageField) {
            return {
              ok: false,
              message: '目前選用的模型不支援參考圖，請改用標示「可參考圖」的模型'
            }
          }
          // 單一欄位模型只使用第一張；陣列欄位模型可帶入多張
          const pathsToUpload = model.isArrayReferenceImage ? referencePaths : referencePaths.slice(0, 1)
          referenceImageUrls = await Promise.all(
            pathsToUpload.map((path) =>
              falService.uploadLocalImage(path, undefined, settings.falApiKey)
            )
          )
        }

        const { outputImageUrls, requestId } = await textToImageService.generate(
          request,
          settings.falApiKey,
          referenceImageUrls
        )

        // 結果一律存到 Mac「圖片/文生圖」資料夾（保留在電腦中，不會因新的生成而丟失）
        const saved = await saveGeneratedTextToImageOutputs({
          outputImageUrls,
          outputFormat: request.outputFormat,
          endpointId: request.endpointId,
          model,
          width,
          height
        })

        return {
          ok: true,
          images: saved.images,
          endpointId: request.endpointId,
          requestId,
          costUsd: saved.costUsd,
          costIsEstimated: saved.costIsEstimated
        }
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : '文字生成圖片失敗，請稍後再試'
        }
      }
    }
  )

  // 對話模式：DeepSeek Flash 與使用者討論，必要時直接交接 fal.ai 生成
  ipcMain.handle(
    IPC_CHANNELS.TEXT_TO_IMAGE_CHAT,
    async (_event, request: TextToImageChatRequest): Promise<TextToImageChatResult> => {
      const messages = Array.isArray(request?.messages) ? request.messages : []
      const lastMessage = messages[messages.length - 1]
      if (!lastMessage || lastMessage.role !== 'user') {
        return { ok: false, message: '對話內容格式不正確，請再試一次' }
      }

      const settings = getSettingsStore().getSettings()

      try {
        const selectedModel = FAL_TEXT_TO_IMAGE_MODELS.find(
          (item) => item.id === request.endpointId
        )
        const systemPrompt = buildTextToImageChatSystemPrompt(request, { selectedModel })
        const visionTargets = collectTextToImageChatVisionTargets(messages)
        const visionImages = visionTargets.flatMap((target) => {
          const dataUrl = toTextToImageChatImageDataUrl(target.filePath)
          return dataUrl
            ? [{ messageIndex: target.messageIndex, fileName: target.fileName, dataUrl }]
            : []
        })
        const chatMessages = buildTextToImageChatMessages(request, systemPrompt, visionImages)

        const rawReply = await createDeepSeekChatCompletion(chatMessages, {
          apiKey: settings.deepseekApiKey,
          model: DEEPSEEK_CHAT_MODEL,
          responseFormat: 'json_object'
        })
        const decision = parseTextToImageChatDecision(rawReply)
        const decidedModel = findChatModel(decision.modelId, FAL_TEXT_TO_IMAGE_MODELS)

        if (decision.action !== 'generate') {
          const suggested = resolveChatSuggestedModels({
            decision,
            models: FAL_TEXT_TO_IMAGE_MODELS,
            currentEndpointId: request.endpointId
          })
          return {
            ok: true,
            action: 'chat',
            reply: decision.reply,
            ...suggested,
            applyModelChange: decision.applyModelChange,
            quickReplies: decision.quickReplies
          }
        }

        const model = decidedModel ?? selectedModel ?? FAL_TEXT_TO_IMAGE_MODELS[0]
        if (!model) {
          return { ok: false, message: '找不到可用的 fal.ai 文生圖模型' }
        }
        if (!decision.prompt) {
          return {
            ok: true,
            action: 'chat',
            reply: decision.reply || '我還需要更多畫面細節才能生成。',
            suggestedModelId: model.id,
            suggestedModelIds: [model.id],
            applyModelChange: decision.applyModelChange,
            quickReplies: decision.quickReplies
          }
        }

        const referencePaths = decision.useReferenceImages
          ? collectTextToImageChatReferencePaths(messages).filter((filePath) =>
              existsSync(filePath)
            )
          : []
        const referenceModels = FAL_TEXT_TO_IMAGE_MODELS.filter(
          (item) => item.referenceImageField
        )

        // 參考圖與模型能力衝突時，不擅自丟棄參考圖，改用對話請使用者確認
        if (referencePaths.length > 0 && !model.referenceImageField) {
          const optionalReferenceModels = referenceModels.filter(
            (item) => !item.requiresReferenceImage
          )
          const suggestions = (
            optionalReferenceModels.length > 0 ? optionalReferenceModels : referenceModels
          ).slice(0, 3)
          return {
            ok: true,
            action: 'chat',
            reply: `你提供了 ${referencePaths.length} 張生成參考圖，但「${model.name}」不支援參考圖。建議改用：${
              suggestions.map((item) => item.name).join('、') || '支援參考圖的模型'
            }；或告訴我這次不要使用參考圖。`,
            suggestedModelId: suggestions[0]?.id,
            suggestedModelIds: suggestions.map((item) => item.id),
            applyModelChange: decision.applyModelChange,
            quickReplies: decision.quickReplies
          }
        }

        if (model.requiresReferenceImage && referencePaths.length === 0) {
          const suggestion =
            referenceModels.find((item) => !item.requiresReferenceImage) ?? referenceModels[0]
          return {
            ok: true,
            action: 'chat',
            reply: `「${model.name}」必須提供參考圖才能生成。請在對話中上傳圖片並開啟「參考」，或改用其他模型。`,
            suggestedModelId: suggestion?.id,
            suggestedModelIds: suggestion ? [suggestion.id] : undefined,
            applyModelChange: decision.applyModelChange,
            quickReplies: decision.quickReplies
          }
        }

        // 參考圖：先上傳到 fal.storage，再帶入模型對應欄位
        let referenceImageUrls: string[] = []
        if (referencePaths.length > 0) {
          const pathsToUpload = model.isArrayReferenceImage
            ? referencePaths.slice(0, 10)
            : referencePaths.slice(0, 1)
          referenceImageUrls = await Promise.all(
            pathsToUpload.map((filePath) =>
              falService.uploadLocalImage(filePath, undefined, settings.falApiKey)
            )
          )
        }

        const { outputImageUrls, requestId } = await textToImageService.generate(
          {
            endpointId: model.id,
            prompt: decision.prompt,
            aspectId: request.aspectId,
            numImages: request.numImages,
            outputFormat: request.outputFormat
          },
          settings.falApiKey,
          referenceImageUrls
        )
        const { width, height } = aspectPixels(request.aspectId)
        const saved = await saveGeneratedTextToImageOutputs({
          outputImageUrls,
          outputFormat: request.outputFormat,
          endpointId: model.id,
          model,
          width,
          height
        })

        return {
          ok: true,
          action: 'generate',
          reply: decision.reply,
          modelId: model.id,
          modelName: model.name,
          prompt: decision.prompt,
          images: saved.images,
          requestId,
          costUsd: saved.costUsd,
          costIsEstimated: saved.costIsEstimated,
          quickReplies: decision.quickReplies
        }
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : '對話生成失敗，請稍後再試'
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
