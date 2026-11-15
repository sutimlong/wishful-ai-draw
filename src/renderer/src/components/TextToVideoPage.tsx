import React, { useEffect, useMemo, useState } from 'react'
import {
  Download,
  FolderOpen,
  ImagePlus,
  Layers,
  Loader2,
  MessageSquareText,
  Palette,
  PenLine,
  Play,
  Sparkles,
  Video,
  Wand2,
  X
} from 'lucide-react'
import {
  FAL_IMAGE_TO_VIDEO_MODELS,
  STARRED_IMAGE_TO_VIDEO_IDS
} from '../../../shared/falImageToVideoModels'
import {
  FAL_TEXT_TO_VIDEO_MODELS,
  STARRED_TEXT_TO_VIDEO_IDS
} from '../../../shared/falTextToVideoModels'
import type { BatchItem, TextToVideoFileEntry } from '../../../shared/types'
import {
  type TextToVideoState,
  useTextToVideoStore
} from '../store/useTextToVideoStore'
import { formatUsd } from '../utils/cost'
import { MAX_REFERENCE_IMAGES } from '../utils/textToImageOptions'
import { estimateVideoCostUsd, formatElectronIpcError } from '../utils/textToVideoOptions'
import { TextToVideoChat } from './TextToVideoChat'
import {
  TextToVideoSettingsFields,
  type VideoSettingsModeKind
} from './TextToVideoSettingsFields'

/** 常用風格預設：點選後把對應英文描述附加到提示詞後方 */
const VIDEO_STYLE_PRESETS: { id: string; label: string; suffix: string }[] = [
  {
    id: 'cinematic',
    label: '電影感',
    suffix:
      'cinematic lighting, dramatic composition, shallow depth of field, 35mm film grain, smooth tracking shot'
  },
  {
    id: 'anime',
    label: '動漫風格',
    suffix:
      'high quality anime cinema style, vibrant cel shading, expressive lighting, fluid dynamic motion'
  },
  {
    id: 'photo',
    label: '寫實攝影',
    suffix:
      'photorealistic, natural lighting, ultra detailed textures, 85mm lens, handheld realistic camera movement'
  },
  {
    id: 'render3d',
    label: '3D 渲染',
    suffix:
      'stylized 3D animation render, soft global illumination, subsurface scattering, octane render, smooth orbital camera'
  },
  {
    id: 'drone',
    label: '空拍大片',
    suffix:
      'sweeping aerial drone shot, golden hour sunlight, epic atmospheric depth, steady slow glide'
  }
]

export interface VideoGenerationPageProps {
  modeKind: VideoSettingsModeKind
  store: TextToVideoState
}

/**
 * 「文字生成影片」與「圖片生成影片」共用的主頁面元件，維持一致的提示詞／對話雙模式排版與流程。
 */
export const VideoGenerationPage: React.FC<VideoGenerationPageProps> = ({ modeKind, store }) => {
  const isImageToVideo = modeKind === 'image-to-video'
  const models = isImageToVideo ? FAL_IMAGE_TO_VIDEO_MODELS : FAL_TEXT_TO_VIDEO_MODELS
  const starredIds = isImageToVideo ? STARRED_IMAGE_TO_VIDEO_IDS : STARRED_TEXT_TO_VIDEO_IDS
  const idPrefix = modeKind

  const {
    mode,
    setMode,
    prompt,
    setPrompt,
    endpointId,
    setEndpointId,
    aspectId,
    setAspectId,
    durationSeconds,
    setDurationSeconds,
    resolution,
    setResolution,
    generateAudio,
    setGenerateAudio,
    isGenerating,
    setIsGenerating,
    isOptimizing,
    setIsOptimizing,
    error: generateError,
    setError: setGenerateError,
    lastCostUsd,
    lastCostIsEstimated,
    setLastCost,
    outputs: results,
    setOutputs: setResults
  } = store

  const [styleId, setStyleId] = useState<string | null>(null)
  const [optimizeError, setOptimizeError] = useState<string | null>(null)
  const [optimizeNotice, setOptimizeNotice] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<TextToVideoFileEntry | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null)
  const [referenceImages, setReferenceImages] = useState<BatchItem[]>([])

  const selectedModel = useMemo(
    () => models.find((model) => model.id === endpointId) ?? models[0],
    [models, endpointId]
  )
  const trimmedPrompt = prompt.trim()
  const canOptimize = trimmedPrompt.length > 0 && !isOptimizing

  const referenceLimit = isImageToVideo
    ? selectedModel?.isArrayImageInput
      ? MAX_REFERENCE_IMAGES
      : selectedModel?.endImageField
        ? 2
        : 1
    : selectedModel?.isArrayReferenceImage
      ? MAX_REFERENCE_IMAGES
      : 1

  const sourceMissing = isImageToVideo && referenceImages.length === 0
  const endFrameMissing =
    isImageToVideo && Boolean(selectedModel?.requiresEndImage) && referenceImages.length < 2
  const promptOptional = isImageToVideo && selectedModel?.requiresPrompt === false
  const referenceUnsupported =
    !isImageToVideo && referenceImages.length > 0 && !selectedModel?.referenceImageField
  const referenceRequiredMissing =
    !isImageToVideo && Boolean(selectedModel?.requiresReferenceImage) && referenceImages.length === 0
  const referenceOverLimit = referenceImages.length > referenceLimit

  const canGenerate =
    !isGenerating &&
    (promptOptional || trimmedPrompt.length > 0) &&
    !sourceMissing &&
    !endFrameMissing &&
    !referenceUnsupported &&
    !referenceRequiredMissing

  const generateDisabledReason = isGenerating
    ? ''
    : sourceMissing
      ? '請先選擇至少一張來源圖片'
      : endFrameMissing
        ? '此模型必須提供首幀與尾幀兩張圖片'
        : !promptOptional && trimmedPrompt.length === 0
          ? '請先輸入提示詞'
          : referenceUnsupported
            ? '目前選用的模型不支援參考圖'
            : referenceRequiredMissing
              ? '此模型必須提供參考圖'
              : ''

  const estimatedCost = estimateVideoCostUsd(selectedModel, durationSeconds)

  // 按 Esc 關閉放大預覽
  useEffect(() => {
    if (!previewVideo) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setPreviewVideo(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [previewVideo])

  // 讀取對應輸出資料夾的所有影片並顯示
  const refreshOutputs = async (): Promise<void> => {
    if (typeof window === 'undefined') return
    const listFn = isImageToVideo
      ? window.electronAPI?.listImageToVideoOutputs
      : window.electronAPI?.listTextToVideoOutputs
    if (typeof listFn !== 'function') return
    const result = await listFn()
    if (result.ok) setResults(result.files)
  }

  useEffect(() => {
    void refreshOutputs()
  }, [isImageToVideo])

  const handleOptimizePrompt = async (): Promise<void> => {
    if (!canOptimize) return

    setIsOptimizing(true)
    setOptimizeError(null)
    setOptimizeNotice(null)
    try {
      const result = await window.electronAPI.optimizePrompt(trimmedPrompt)
      if (result.ok) {
        setPrompt(result.prompt)
        setOptimizeNotice('已優化並翻譯為英文提示詞')
      } else {
        setOptimizeError(result.message)
      }
    } catch (err) {
      setOptimizeError(err instanceof Error ? err.message : '提示詞優化失敗，請稍後再試')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleToggleStyle = (style: (typeof VIDEO_STYLE_PRESETS)[number]): void => {
    setOptimizeNotice(null)
    if (styleId === style.id) {
      setStyleId(null)
      const cleaned = prompt
        .replace(`, ${style.suffix}`, '')
        .replace(`${style.suffix}, `, '')
        .replace(style.suffix, '')
        .trim()
      setPrompt(cleaned)
      return
    }
    setStyleId(style.id)
    setPrompt(
      prompt.includes(style.suffix)
        ? prompt
        : `${prompt.trim()}${prompt.trim() ? ', ' : ''}${style.suffix}`
    )
  }

  const handleClear = (): void => {
    setPrompt('')
    setStyleId(null)
    setOptimizeError(null)
    setOptimizeNotice(null)
  }

  const handleGenerate = async (): Promise<void> => {
    if (!canGenerate) return

    setIsGenerating(true)
    setGenerateError(null)
    setLastCost(undefined, undefined)
    try {
      const filePaths = referenceImages.map((image) => image.sourceFilePath)
      const result = isImageToVideo
        ? await window.electronAPI.generateImageToVideo({
            endpointId,
            prompt: trimmedPrompt,
            aspectId,
            durationSeconds,
            resolution,
            generateAudio,
            imageFilePaths: filePaths
          })
        : await window.electronAPI.generateTextToVideo({
            endpointId,
            prompt: trimmedPrompt,
            aspectId,
            durationSeconds,
            resolution,
            generateAudio,
            referenceImageFilePaths: filePaths
          })
      if (result.ok) {
        setLastCost(result.costUsd, result.costIsEstimated)
        await refreshOutputs()
      } else {
        setGenerateError(result.message)
      }
    } catch (err) {
      setGenerateError(
        formatElectronIpcError(
          err,
          `${isImageToVideo ? '圖片生成影片' : '文字生成影片'}失敗，請稍後再試`
        )
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectReference = async (): Promise<void> => {
    const items = await window.electronAPI.selectReferenceImages()
    if (items.length === 0) return

    setReferenceImages((prev) => {
      if (referenceLimit === 1) {
        return [items[0]]
      }
      const merged = [...prev]
      for (const item of items) {
        if (merged.some((existing) => existing.sourceFilePath === item.sourceFilePath)) continue
        if (merged.length >= referenceLimit) break
        merged.push(item)
      }
      return merged
    })
  }

  const handleRemoveReference = (index: number): void => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDownload = async (video: TextToVideoFileEntry): Promise<void> => {
    if (downloadingId) return
    setDownloadingId(video.filePath)
    setDownloadNotice(null)
    try {
      const result = isImageToVideo
        ? await window.electronAPI.saveImageToVideoAs(video.filePath)
        : await window.electronAPI.saveTextToVideoAs(video.filePath)
      if (result.ok) {
        setDownloadNotice('已儲存影片')
      } else if (!result.canceled) {
        setDownloadNotice(result.message)
      }
    } catch (err) {
      setDownloadNotice(formatElectronIpcError(err, '儲存失敗，請稍後再試'))
    } finally {
      setDownloadingId(null)
    }
  }

  const renderImagePickerBlock = (): React.ReactNode => {
    const sectionTitle = isImageToVideo
      ? selectedModel?.requiresEndImage
        ? '來源圖片（必填首幀＋尾幀 2 張）'
        : selectedModel?.endImageField
          ? '來源圖片（首幀必填，可選第 2 張尾幀）'
          : selectedModel?.isArrayImageInput
            ? '來源圖片（必填，支援多張參考圖）'
            : '來源圖片（必填）'
      : '參考圖（選用）'

    return (
      <div
        className={`space-y-2 ${
          isImageToVideo ? 'border-b border-zinc-800/80 pb-4' : 'border-t border-zinc-800/80 pt-4'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <ImagePlus className="h-3.5 w-3.5 text-indigo-400" />
            {sectionTitle}
          </div>
          {referenceImages.length > 0 && (
            <span className="text-[11px] text-zinc-500">
              {referenceImages.length} / {referenceLimit} 張
            </span>
          )}
        </div>

        {referenceImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {referenceImages.map((image, index) => {
              const badgeLabel = isImageToVideo
                ? selectedModel?.endImageField
                  ? index === 0
                    ? '首幀'
                    : index === 1
                      ? '尾幀'
                      : String(index + 1)
                  : index === 0
                    ? '來源'
                    : String(index + 1)
                : String(index + 1)
              return (
                <div
                  key={image.sourceFilePath}
                  title={image.sourceFileName}
                  className="group relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
                >
                  <img
                    src={image.sourcePreviewUrl}
                    alt={`${isImageToVideo ? '來源圖片' : '參考圖'} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-1 top-1 rounded bg-black/75 px-1 text-[9px] font-semibold text-zinc-200">
                    {badgeLabel}
                  </span>
                  <button
                    onClick={() => handleRemoveReference(index)}
                    title={isImageToVideo ? '移除來源圖片' : '移除參考圖'}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded bg-black/70 text-zinc-300 opacity-0 transition hover:bg-rose-500/80 hover:text-white group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {referenceImages.length < referenceLimit ? (
          <button
            onClick={handleSelectReference}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 px-3 py-3 text-xs text-zinc-400 transition hover:border-indigo-500 hover:text-indigo-200"
          >
            <ImagePlus className="h-4 w-4" />
            {referenceImages.length === 0
              ? isImageToVideo
                ? referenceLimit > 1
                  ? '選擇來源圖片（可選首幀或 2 張）'
                  : '選擇來源圖片'
                : selectedModel?.isArrayReferenceImage
                  ? '加入參考圖（可多選）'
                  : '加入參考圖'
              : isImageToVideo && selectedModel?.endImageField && referenceImages.length === 1
                ? '再加入第 2 張（尾幀圖片）'
                : isImageToVideo
                  ? '再加入來源圖片'
                  : '再加入參考圖'}
          </button>
        ) : (
          <p className="text-[11px] text-zinc-600">
            {referenceLimit > 1
              ? isImageToVideo
                ? `已選取 ${referenceImages.length} / ${referenceLimit} 張圖片，若要更換請點擊縮圖右上角移除`
                : `已達上限 ${MAX_REFERENCE_IMAGES} 張`
              : isImageToVideo
                ? '此模型僅使用 1 張來源圖片，若要更換請點擊縮圖右上角移除'
                : '此模型僅支援 1 張參考圖，若要更換請先移除'}
          </p>
        )}

        {referenceImages.length > 0 && (
          <p className="text-[11px] text-zinc-600">
            {isImageToVideo
              ? `將以此 ${referenceImages.length} 張來源圖片為基礎生成動態影片${
                  referenceOverLimit ? `（此模型最多使用前 ${referenceLimit} 張）` : ''
                }`
              : `AI 會參考這 ${referenceImages.length} 張圖生成新影片${
                  referenceOverLimit ? '（此模型僅支援 1 張，將只使用第 1 張）' : ''
                }`}
          </p>
        )}

        {referenceUnsupported && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
            目前選用的模型不支援參考圖，請改用下拉選單中標示「（可參考圖）」的模型。
          </p>
        )}

        {(referenceRequiredMissing || endFrameMissing) && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
            {endFrameMissing
              ? '此模型必須提供首幀與尾幀共 2 張圖片才能生成，請再補選第 2 張圖片。'
              : '此模型必須提供參考圖才能生成，請先加入參考圖。'}
          </p>
        )}
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-zinc-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-7 space-y-6">
        {/* 頁面標題與模式切換 */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 to-fuchsia-500/15 border border-indigo-500/30 text-indigo-300">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                {isImageToVideo ? '圖片生成影片' : '文字生成影片'}
              </h1>
              <p className="mt-0.5 text-xs text-zinc-400">
                {mode === 'prompt'
                  ? isImageToVideo
                    ? '選擇來源圖片並設定動態提示詞，調用 fal.ai 圖生影片模型讓畫面動起來。'
                    : '輸入提示詞即可從零生成全新影片，不需要先準備素材。'
                  : isImageToVideo
                    ? '先上傳來源圖片並和 DeepSeek 討論動態、運鏡與模型，確認後交給 fal.ai 生成。'
                    : '先和 DeepSeek 討論想法、上傳參考圖，確認後由 AI 選擇模型並交給 fal.ai 生成。'}
              </p>
            </div>
          </div>

          {/* Prompt / Chat 模式切換 */}
          <div
            aria-label={isImageToVideo ? '圖片生成影片模式切換' : '文字生成影片模式切換'}
            className="flex shrink-0 items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/70 p-1"
          >
            <button
              onClick={() => setMode('prompt')}
              aria-pressed={mode === 'prompt'}
              title="使用提示詞直接生成影片"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                mode === 'prompt'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-950/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              提示詞模式
            </button>
            <button
              onClick={() => setMode('chat')}
              aria-pressed={mode === 'chat'}
              title="與 DeepSeek 討論後自動交接 fal.ai 生成"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                mode === 'chat'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-950/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquareText className="h-3.5 w-3.5" />
              對話模式
            </button>
          </div>
        </div>

        {/* 提示詞模式（切到對話模式時僅隱藏，保留工作流程狀態） */}
        <div className={mode === 'prompt' ? 'space-y-6' : 'hidden'}>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* 左側：來源圖片／提示詞與風格 */}
            <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              {isImageToVideo && renderImagePickerBlock()}

              <div className="flex items-center justify-between">
                <label
                  htmlFor={`${idPrefix}-prompt`}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  <Palette className="h-3.5 w-3.5 text-indigo-400" />
                  提示詞 (Prompt)
                  {promptOptional && (
                    <span className="text-[11px] font-normal normal-case text-zinc-500">
                      （此模型選填）
                    </span>
                  )}
                </label>
                <button
                  onClick={handleOptimizePrompt}
                  disabled={!canOptimize}
                  title="使用 DeepSeek 將提示詞優化並翻譯為英文"
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${
                    canOptimize
                      ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20'
                      : 'cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600'
                  }`}
                >
                  {isOptimizing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  {isOptimizing ? '優化中…' : 'AI 優化'}
                </button>
              </div>

              <textarea
                id={`${idPrefix}-prompt`}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value)
                  setOptimizeNotice(null)
                }}
                rows={isImageToVideo ? 6 : 7}
                placeholder={
                  isImageToVideo
                    ? '例如：人物微微轉頭露出微笑，髮絲與衣擺隨海風自然飄動，攝影機緩慢推進，電影感柔和陽光'
                    : '例如：黃昏的海岸公路，一輛復古敞篷車緩緩駛向遠方，攝影機低角度跟拍，電影感光影與柔和波浪'
                }
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-3 text-sm leading-relaxed text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-indigo-500"
              />

              {!isImageToVideo && renderImagePickerBlock()}

              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>{prompt.length} 字</span>
                <button
                  onClick={handleClear}
                  disabled={!trimmedPrompt && !styleId}
                  className={`transition ${
                    trimmedPrompt || styleId
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'cursor-not-allowed text-zinc-700'
                  }`}
                >
                  清空
                </button>
              </div>

              {optimizeError && (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-300">
                  {optimizeError}
                </p>
              )}
              {optimizeNotice && (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300">
                  {optimizeNotice}
                </p>
              )}

              <div className="space-y-2 border-t border-zinc-800/80 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Layers className="h-3.5 w-3.5 text-indigo-400" />
                  風格預設
                </div>
                <div className="flex flex-wrap gap-2">
                  {VIDEO_STYLE_PRESETS.map((style) => {
                    const isActive = styleId === style.id
                    return (
                      <button
                        key={style.id}
                        onClick={() => handleToggleStyle(style)}
                        aria-pressed={isActive}
                        title={style.suffix}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                          isActive
                            ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-white/20'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {style.label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-zinc-600">
                  點選風格會自動把對應英文描述附加到提示詞後方，可再次點擊取消選取。
                </p>
              </div>
            </section>

            {/* 右側：生成參數 */}
            <section className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                生成參數
              </div>

              <TextToVideoSettingsFields
                idPrefix={idPrefix}
                modeKind={modeKind}
                models={models}
                starredIds={starredIds}
                endpointId={endpointId}
                onEndpointIdChange={setEndpointId}
                aspectId={aspectId}
                onAspectIdChange={setAspectId}
                durationSeconds={durationSeconds}
                onDurationSecondsChange={setDurationSeconds}
                resolution={resolution}
                onResolutionChange={setResolution}
                generateAudio={generateAudio}
                onGenerateAudioChange={setGenerateAudio}
                selectedModel={selectedModel}
              />

              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                title={generateDisabledReason || '產生影片'}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  canGenerate
                    ? 'border-indigo-500/60 bg-indigo-500 text-white hover:bg-indigo-400'
                    : 'cursor-not-allowed border-zinc-800 bg-zinc-800/60 text-zinc-500'
                }`}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isGenerating ? '生成中…' : `開始生成（${durationSeconds} 秒）`}
              </button>

              {estimatedCost && (
                <p className="text-[11px] text-zinc-500">
                  預估費用：{formatUsd(estimatedCost.costUsd)}（{estimatedCost.note}）
                </p>
              )}

              {generateError && (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-300">
                  {generateError}
                </p>
              )}
            </section>
          </div>

          {/* 生成結果預覽 */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                生成結果
              </h2>
              <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                {lastCostUsd !== undefined && (
                  <span>
                    本次費用：{formatUsd(lastCostUsd)}
                    {lastCostIsEstimated ? '（預估）' : ''}
                  </span>
                )}
                <span>
                  {aspectId} · {durationSeconds} 秒 · {resolution}
                </span>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="mt-3 flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 px-6 py-10 text-center">
                <Video className="h-7 w-7 text-zinc-700" />
                <p className="text-sm text-zinc-400">
                  {isGenerating ? '生成中…' : '生成的影片會顯示在這裡'}
                </p>
                <p className="text-[11px] text-zinc-600">
                  {isImageToVideo
                    ? '選擇來源圖片並設定動態描述與模型後，點擊「開始生成」即可產生動態影片。'
                    : '輸入提示詞並選擇模型後，點擊「開始生成」即可產生全新影片。'}
                </p>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {results.map((video, index) => (
                  <figure
                    key={`${video.url}-${index}`}
                    className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                  >
                    <button
                      onClick={() => setPreviewVideo(video)}
                      title="點擊放大播放"
                      className="relative block aspect-video w-full cursor-zoom-in overflow-hidden bg-zinc-900"
                    >
                      <video
                        src={video.url}
                        preload="metadata"
                        muted
                        className="h-full w-full object-contain transition duration-200 group-hover:scale-[1.03]"
                      />
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/35">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white shadow">
                          <Play className="h-3.5 w-3.5 fill-white" />
                        </span>
                      </span>
                    </button>

                    {/* 滑鼠移入時顯示的下載按鈕（右上角） */}
                    <button
                      onClick={() => handleDownload(video)}
                      disabled={downloadingId !== null}
                      title="儲存影片（另存新檔）"
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950/90 text-zinc-200 opacity-0 shadow transition hover:bg-indigo-500 hover:text-white group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {downloadingId === video.filePath ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <figcaption className="flex items-center justify-between gap-2 px-2.5 py-2 text-[10px] text-zinc-500">
                      <span className="truncate" title={video.fileName}>
                        {video.fileName}
                      </span>
                      <button
                        onClick={() => window.electronAPI.openPathInExplorer(video.filePath)}
                        title="在 Finder / 檔案總管顯示"
                        className="flex shrink-0 items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
                      >
                        <FolderOpen className="h-3 w-3" />
                        開啟
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>

          {downloadNotice && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300">
              {downloadNotice}
            </p>
          )}
        </div>

        {/* 對話模式：與 DeepSeek 討論後交接 fal.ai 生成 */}
        <div className={mode === 'chat' ? '' : 'hidden'}>
          <TextToVideoChat
            isActive={mode === 'chat'}
            modeKind={modeKind}
            models={models}
            starredIds={starredIds}
            endpointId={endpointId}
            onEndpointIdChange={setEndpointId}
            aspectId={aspectId}
            onAspectIdChange={setAspectId}
            durationSeconds={durationSeconds}
            onDurationSecondsChange={setDurationSeconds}
            resolution={resolution}
            onResolutionChange={setResolution}
            generateAudio={generateAudio}
            onGenerateAudioChange={setGenerateAudio}
            selectedModel={selectedModel}
            onVideosGenerated={refreshOutputs}
            onPreviewVideo={setPreviewVideo}
          />
        </div>
      </div>

      {/* 放大預覽 Lightbox */}
      {previewVideo && (
        <div
          onClick={() => setPreviewVideo(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-8"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setPreviewVideo(null)}
            title="關閉"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/80 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <video
            src={previewVideo.url}
            controls
            autoPlay
            loop
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </main>
  )
}

export const TextToVideoPage: React.FC = () => {
  const store = useTextToVideoStore()
  return <VideoGenerationPage modeKind="text-to-video" store={store} />
}
