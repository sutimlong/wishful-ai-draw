import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { existsSync } from 'fs'
import { copyFile, mkdir, readdir, stat } from 'fs/promises'
import { basename, extname, join } from 'path'
import {
  DEFAULT_IMAGE_TO_VIDEO_MODEL_ID,
  FAL_IMAGE_TO_VIDEO_MODELS,
  findImageToVideoModel
} from '../../shared/falImageToVideoModels'
import {
  DEFAULT_TEXT_TO_VIDEO_MODEL_ID,
  FAL_TEXT_TO_VIDEO_MODELS,
  findTextToVideoModel
} from '../../shared/falTextToVideoModels'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type {
  FalModelPreset,
  TextToVideoChatRequest,
  TextToVideoChatResult,
  TextToVideoDownloadResult,
  TextToVideoFileEntry,
  TextToVideoListResult,
  TextToVideoRequest,
  TextToVideoResult
} from '../../shared/types'
import { createDeepSeekChatCompletion, DEEPSEEK_CHAT_MODEL } from '../services/deepSeekService'
import { falCostService } from '../services/falCostService'
import { falService } from '../services/falService'
import {
  getImageToVideoOutputDirectory,
  getTextToVideoOutputDirectory
} from '../services/outputDirectories'
import { getSettingsStore } from '../services/store'
import {
  collectTextToImageChatReferencePaths,
  collectTextToImageChatVisionTargets,
  resolveChatSuggestedModels
} from '../services/textToImageChat'
import { toTextToImageChatImageDataUrl } from '../services/textToImageChatImage'
import {
  buildImageToVideoChatSystemPrompt,
  buildTextToVideoChatMessages,
  buildTextToVideoChatSystemPrompt,
  findImageToVideoChatModel,
  findTextToVideoChatModel,
  parseImageToVideoChatDecision,
  parseTextToVideoChatDecision,
  type TextToVideoChatDecision,
  type VideoChatMode
} from '../services/textToVideoChat'
import { TextToVideoService, getVideoFileBasename } from '../services/textToVideoService'
import { usageLogger } from '../services/usageLoggerWiring'
import { toLocalMediaUrl } from './file.ipc'

const VIDEO_OUTPUT_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.mkv', '.m4v'])

const textToVideoService = new TextToVideoService()

interface VideoModeIpcConfig {
  mode: VideoChatMode
  models: FalModelPreset[]
  defaultModelId: string
  findModel: (endpointId: string) => FalModelPreset | undefined
  getOutputDirectory: () => string
  buildChatSystemPrompt: (
    request: TextToVideoChatRequest,
    options?: { models?: FalModelPreset[]; selectedModel?: FalModelPreset }
  ) => string
  parseChatDecision: (rawContent: string, validModelIds?: Set<string>) => TextToVideoChatDecision
  findChatModel: (modelId: string) => FalModelPreset | undefined
  recordUsage: (entry: {
    endpointId: string
    sourceFileName: string
    costUsd?: number
    costIsEstimated?: boolean
  }) => void
  channels: {
    generate: string
    chat: string
    listOutputs: string
    copyToDownloads: string
    saveAs: string
  }
  labels: {
    modeTitle: string
    folderTitle: string
    defaultFileName: string
  }
}

async function resolveUniqueCopyPath(directory: string, fileName: string): Promise<string> {
  const ext = extname(fileName)
  const stem = basename(fileName, ext)
  const first = join(directory, fileName)
  try {
    await stat(first)
  } catch {
    return first
  }
  for (let i = 1; i < 1000; i++) {
    const candidate = join(directory, `${stem}_${i}${ext}`)
    try {
      await stat(candidate)
    } catch {
      return candidate
    }
  }
  return join(directory, `${stem}_${Date.now()}${ext}`)
}

async function uploadSourceImagesForVideoMode(
  mode: VideoChatMode,
  model: FalModelPreset | undefined,
  sourcePaths: string[],
  falApiKey: string
): Promise<{ urls: string[]; errorMessage?: string }> {
  if (mode === 'image-to-video') {
    if (sourcePaths.length === 0) {
      return { urls: [], errorMessage: '請先選擇至少一張來源圖片' }
    }
    if (model?.requiresEndImage && sourcePaths.length < 2) {
      return {
        urls: [],
        errorMessage: `模型「${model.name}」需要同時提供首幀與尾幀兩張圖片`
      }
    }
    const uploadPaths = model?.isArrayImageInput
      ? sourcePaths
      : model?.endImageField
        ? sourcePaths.slice(0, 2)
        : sourcePaths.slice(0, 1)
    const urls = await Promise.all(
      uploadPaths.map((filePath) => falService.uploadLocalImage(filePath, undefined, falApiKey))
    )
    return { urls }
  }

  if (model?.requiresReferenceImage && sourcePaths.length === 0) {
    return {
      urls: [],
      errorMessage: '此模型必須提供參考圖才能生成，請先加入參考圖'
    }
  }
  if (sourcePaths.length === 0) {
    return { urls: [] }
  }
  if (!model?.referenceImageField) {
    return {
      urls: [],
      errorMessage: '目前選用的模型不支援參考圖，請改用下拉選單中標示「（可參考圖）」的模型'
    }
  }
  const refPaths = model.isArrayReferenceImage ? sourcePaths : sourcePaths.slice(0, 1)
  const urls = await Promise.all(
    refPaths.map((filePath) => falService.uploadLocalImage(filePath, undefined, falApiKey))
  )
  return { urls }
}

async function runVideoGenerate(
  config: VideoModeIpcConfig,
  request: TextToVideoRequest
): Promise<TextToVideoResult> {
  const settings = getSettingsStore().getSettings()
  const falApiKey = settings.falApiKey.trim()
  if (!falApiKey) {
    return { ok: false, message: '請先在設定中輸入 fal.ai API Key' }
  }

  const endpointId = request.endpointId?.trim() || config.defaultModelId
  const model = config.findModel(endpointId)
  const outputDirectory = config.getOutputDirectory()

  const rawPaths =
    config.mode === 'image-to-video'
      ? (request.imageFilePaths?.length ? request.imageFilePaths : request.referenceImageFilePaths) ?? []
      : request.referenceImageFilePaths ?? []
  const sourcePaths = Array.isArray(rawPaths) ? rawPaths.filter(Boolean) : []

  const uploadResult = await uploadSourceImagesForVideoMode(
    config.mode,
    model,
    sourcePaths,
    falApiKey
  )
  if (uploadResult.errorMessage) {
    return { ok: false, message: uploadResult.errorMessage }
  }

  const generated = await textToVideoService.generate(
    { ...request, endpointId },
    falApiKey,
    outputDirectory,
    uploadResult.urls,
    { isImageToVideo: config.mode === 'image-to-video' }
  )

  // 將本機已儲存路徑轉成 local-media:// 供 Renderer <video> 串流播放
  const videos = generated.videos.map((v) => ({
    ...v,
    url: v.savedFilePath ? toLocalMediaUrl(v.savedFilePath) : v.url
  }))

  let costUsd: number | undefined
  let costIsEstimated: boolean | undefined
  try {
    const cost = await falCostService.resolveItemCost(falApiKey, endpointId, generated.requestId)
    if (cost) {
      costUsd = cost.costUsd
      costIsEstimated = cost.isEstimated
    }
  } catch {
    // 查價失敗不影響已生成的影片
  }

  // 寫入 Google 雲端試算表使用紀錄
  for (const video of videos) {
    try {
      const fileName = video.savedFilePath
        ? getVideoFileBasename(video.savedFilePath)
        : config.labels.defaultFileName
      config.recordUsage({
        endpointId,
        sourceFileName: fileName,
        costUsd,
        costIsEstimated
      })
    } catch (logErr) {
      console.error(`寫入${config.labels.modeTitle}使用記錄失敗：`, logErr)
    }
  }

  return {
    ok: true,
    videos,
    endpointId: generated.endpointId,
    requestId: generated.requestId,
    costUsd,
    costIsEstimated
  }
}

function validateChatPreconditions(
  config: VideoModeIpcConfig,
  model: FalModelPreset,
  referencePaths: string[],
  applyModelChange: boolean,
  quickReplies: string[]
): TextToVideoChatResult | null {
  if (config.mode === 'image-to-video') {
    if (referencePaths.length === 0) {
      return {
        ok: true,
        action: 'chat',
        reply: '請先在對話中上傳並開啟「參考」圖片作為圖生影片來源，我才能幫你送出生成。',
        suggestedModelId: model.id,
        suggestedModelIds: [model.id],
        applyModelChange,
        quickReplies
      }
    }
    if (model.requiresEndImage && referencePaths.length < 2) {
      const singleImageModels = config.models.filter((m) => !m.requiresEndImage).slice(0, 3)
      return {
        ok: true,
        action: 'chat',
        reply: `「${model.name}」需要同時提供首幀與尾幀兩張「參考」圖片。請再補上傳一張尾幀圖並開啟「參考」，或改用單圖模型。`,
        suggestedModelId: singleImageModels[0]?.id,
        suggestedModelIds: singleImageModels.map((m) => m.id),
        applyModelChange,
        quickReplies
      }
    }
    return null
  }

  const referenceModels = config.models.filter((m) => m.referenceImageField)
  if (referencePaths.length > 0 && !model.referenceImageField) {
    const optionalReferenceModels = referenceModels.filter((m) => !m.requiresReferenceImage)
    const suggestions = (
      optionalReferenceModels.length > 0 ? optionalReferenceModels : referenceModels
    ).slice(0, 3)
    return {
      ok: true,
      action: 'chat',
      reply: `你提供了 ${referencePaths.length} 張生成參考圖，但「${model.name}」不支援參考圖。建議改用：${suggestions.map((m) => m.name).join('、') || '支援參考圖的模型'
        }；或告訴我這次不要使用參考圖。`,
      suggestedModelId: suggestions[0]?.id,
      suggestedModelIds: suggestions.map((m) => m.id),
      applyModelChange,
      quickReplies
    }
  }

  if (model.requiresReferenceImage && referencePaths.length === 0) {
    const suggestion = referenceModels.find((m) => !m.requiresReferenceImage) ?? referenceModels[0]
    return {
      ok: true,
      action: 'chat',
      reply: `「${model.name}」必須提供參考圖才能生成。請在對話中上傳圖片並開啟「參考」，或改用其他模型。`,
      suggestedModelId: suggestion?.id,
      suggestedModelIds: suggestion ? [suggestion.id] : undefined,
      applyModelChange,
      quickReplies
    }
  }

  return null
}

function registerVideoGenerationIpc(config: VideoModeIpcConfig): void {
  const validModelIds = new Set(config.models.map((m) => m.id))

  ipcMain.handle(
    config.channels.generate,
    async (_event, request: TextToVideoRequest): Promise<TextToVideoResult> => {
      try {
        return await runVideoGenerate(config, request)
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : `${config.labels.modeTitle}失敗，請稍後再試`
        }
      }
    }
  )

  // 對話模式：DeepSeek Flash 與使用者討論、看圖、推薦／切換模型，必要時交接 fal.ai 生成影片
  ipcMain.handle(
    config.channels.chat,
    async (_event, request: TextToVideoChatRequest): Promise<TextToVideoChatResult> => {
      const messages = Array.isArray(request?.messages) ? request.messages : []
      const lastMessage = messages[messages.length - 1]
      if (!lastMessage || lastMessage.role !== 'user') {
        return { ok: false, message: '對話內容格式不正確，請再試一次' }
      }

      const settings = getSettingsStore().getSettings()

      try {
        const selectedModel = config.findModel(request.endpointId)
        const systemPrompt = config.buildChatSystemPrompt(request, { selectedModel })
        const visionTargets = collectTextToImageChatVisionTargets(messages)
        const visionImages = visionTargets.flatMap((target) => {
          const dataUrl = toTextToImageChatImageDataUrl(target.filePath)
          return dataUrl
            ? [{ messageIndex: target.messageIndex, fileName: target.fileName, dataUrl }]
            : []
        })
        const chatMessages = buildTextToVideoChatMessages(request, systemPrompt, visionImages)

        const rawReply = await createDeepSeekChatCompletion(chatMessages, {
          apiKey: settings.deepseekApiKey,
          model: DEEPSEEK_CHAT_MODEL,
          responseFormat: 'json_object'
        })
        const decision = config.parseChatDecision(rawReply, validModelIds)
        const decidedModel = config.findChatModel(decision.modelId)

        if (decision.action !== 'generate') {
          const suggested = resolveChatSuggestedModels({
            decision,
            models: config.models,
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

        const model = decidedModel ?? selectedModel ?? config.models[0]
        if (!model) {
          return { ok: false, message: `找不到可用的 fal.ai ${config.labels.modeTitle}模型` }
        }
        if (!decision.prompt && (config.mode !== 'image-to-video' || model.requiresPrompt !== false)) {
          return {
            ok: true,
            action: 'chat',
            reply: decision.reply || '我還需要更多影片細節才能生成。',
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

        const conflict = validateChatPreconditions(
          config,
          model,
          referencePaths,
          decision.applyModelChange,
          decision.quickReplies
        )
        if (conflict) {
          return conflict
        }

        const genResult = await runVideoGenerate(config, {
          endpointId: model.id,
          prompt: decision.prompt,
          aspectId: request.aspectId,
          durationSeconds: request.durationSeconds,
          resolution: request.resolution,
          generateAudio: request.generateAudio,
          imageFilePaths: referencePaths,
          referenceImageFilePaths: referencePaths
        })

        if (!genResult.ok) {
          return { ok: false, message: genResult.message }
        }

        return {
          ok: true,
          action: 'generate',
          reply: decision.reply,
          modelId: model.id,
          modelName: model.name,
          prompt: decision.prompt,
          videos: genResult.videos,
          requestId: genResult.requestId,
          costUsd: genResult.costUsd,
          costIsEstimated: genResult.costIsEstimated,
          quickReplies: decision.quickReplies
        }
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'AI 對話或生成影片失敗'
        }
      }
    }
  )

  ipcMain.handle(config.channels.listOutputs, async (): Promise<TextToVideoListResult> => {
    try {
      const outputDir = config.getOutputDirectory()
      const entries = await readdir(outputDir, { withFileTypes: true })
      const files: TextToVideoFileEntry[] = []

      for (const entry of entries) {
        if (!entry.isFile() || entry.name.startsWith('.')) continue
        const ext = extname(entry.name).toLowerCase()
        if (!VIDEO_OUTPUT_EXTENSIONS.has(ext)) continue

        const filePath = join(outputDir, entry.name)
        const info = await stat(filePath)
        files.push({
          filePath,
          url: toLocalMediaUrl(filePath),
          fileName: entry.name,
          modifiedAt: info.mtimeMs
        })
      }

      files.sort((a, b) => b.modifiedAt - a.modifiedAt)
      return { ok: true, files }
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : `讀取${config.labels.folderTitle}失敗`
      }
    }
  })

  ipcMain.handle(
    config.channels.copyToDownloads,
    async (_event, filePath: string): Promise<TextToVideoDownloadResult> => {
      try {
        const downloadsDir = app.getPath('downloads')
        await mkdir(downloadsDir, { recursive: true })
        const targetPath = await resolveUniqueCopyPath(downloadsDir, basename(filePath))
        await copyFile(filePath, targetPath)
        return { ok: true, filePath: targetPath }
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : '複製影片到下載資料夾失敗'
        }
      }
    }
  )

  ipcMain.handle(
    config.channels.saveAs,
    async (event, filePath: string): Promise<TextToVideoDownloadResult> => {
      try {
        const win = BrowserWindow.fromWebContents(event.sender)
        const ext = extname(filePath).replace('.', '').toLowerCase() || 'mp4'
        const dialogOptions = {
          title: '儲存影片',
          defaultPath: join(app.getPath('downloads'), basename(filePath)),
          filters: [{ name: '影片檔案', extensions: [ext, 'mp4', 'webm', 'mov', 'mkv'] }]
        }
        const { canceled, filePath: chosenPath } = win
          ? await dialog.showSaveDialog(win, dialogOptions)
          : await dialog.showSaveDialog(dialogOptions)
        if (canceled || !chosenPath) {
          return { ok: false, message: '已取消儲存', canceled: true }
        }
        await copyFile(filePath, chosenPath)
        return { ok: true, filePath: chosenPath }
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : '另存影片失敗'
        }
      }
    }
  )
}

export function registerTextToVideoIpc(): void {
  registerVideoGenerationIpc({
    mode: 'text-to-video',
    models: FAL_TEXT_TO_VIDEO_MODELS,
    defaultModelId: DEFAULT_TEXT_TO_VIDEO_MODEL_ID,
    findModel: findTextToVideoModel,
    getOutputDirectory: getTextToVideoOutputDirectory,
    buildChatSystemPrompt: buildTextToVideoChatSystemPrompt,
    parseChatDecision: parseTextToVideoChatDecision,
    findChatModel: findTextToVideoChatModel,
    recordUsage: (entry) => usageLogger.recordTextToVideoGenerated(entry),
    channels: {
      generate: IPC_CHANNELS.TEXT_TO_VIDEO_GENERATE,
      chat: IPC_CHANNELS.TEXT_TO_VIDEO_CHAT,
      listOutputs: IPC_CHANNELS.TEXT_TO_VIDEO_LIST_OUTPUTS,
      copyToDownloads: IPC_CHANNELS.TEXT_TO_VIDEO_COPY_TO_DOWNLOADS,
      saveAs: IPC_CHANNELS.TEXT_TO_VIDEO_SAVE_AS
    },
    labels: {
      modeTitle: '文字生成影片',
      folderTitle: '文生影片輸出資料夾',
      defaultFileName: 'text2vid.mp4'
    }
  })
}

export function registerImageToVideoIpc(): void {
  registerVideoGenerationIpc({
    mode: 'image-to-video',
    models: FAL_IMAGE_TO_VIDEO_MODELS,
    defaultModelId: DEFAULT_IMAGE_TO_VIDEO_MODEL_ID,
    findModel: findImageToVideoModel,
    getOutputDirectory: getImageToVideoOutputDirectory,
    buildChatSystemPrompt: buildImageToVideoChatSystemPrompt,
    parseChatDecision: parseImageToVideoChatDecision,
    findChatModel: findImageToVideoChatModel,
    recordUsage: (entry) => usageLogger.recordImageToVideoGenerated(entry),
    channels: {
      generate: IPC_CHANNELS.IMAGE_TO_VIDEO_GENERATE,
      chat: IPC_CHANNELS.IMAGE_TO_VIDEO_CHAT,
      listOutputs: IPC_CHANNELS.IMAGE_TO_VIDEO_LIST_OUTPUTS,
      copyToDownloads: IPC_CHANNELS.IMAGE_TO_VIDEO_COPY_TO_DOWNLOADS,
      saveAs: IPC_CHANNELS.IMAGE_TO_VIDEO_SAVE_AS
    },
    labels: {
      modeTitle: '圖片生成影片',
      folderTitle: '圖生影片輸出資料夾',
      defaultFileName: 'img2vid.mp4'
    }
  })
}
