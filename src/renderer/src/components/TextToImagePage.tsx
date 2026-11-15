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
  Sparkles,
  Wand2,
  X
} from 'lucide-react'
import { FAL_TEXT_TO_IMAGE_MODELS } from '@shared/falTextToImageModels'
import { estimateBatchCostUsd } from '@shared/falPricing'
import { formatUsd } from '../utils/cost'
import {
  ASPECT_RATIOS,
  MAX_REFERENCE_IMAGES,
  type TextToImageOutputFormat
} from '../utils/textToImageOptions'
import type { BatchItem, TextToImageAspect, TextToImageFileEntry } from '@shared/types'
import { TextToImageSettingsFields } from './TextToImageSettingsFields'
import { TextToImageChat } from './TextToImageChat'

/** 常用風格預設：點選後把對應英文描述附加到提示詞後方 */
const STYLE_PRESETS: { id: string; label: string; suffix: string }[] = [
  {
    id: 'cinematic',
    label: '電影感',
    suffix:
      'cinematic lighting, dramatic composition, shallow depth of field, 35mm film grain, color graded'
  },
  {
    id: 'anime',
    label: '動漫插畫',
    suffix:
      'anime illustration, clean line art, vibrant cel shading, expressive eyes, detailed background'
  },
  {
    id: 'photo',
    label: '寫實攝影',
    suffix: 'photorealistic, natural lighting, ultra detailed textures, 85mm lens, high dynamic range'
  },
  {
    id: 'render3d',
    label: '3D 渲染',
    suffix: 'stylized 3D render, soft global illumination, subsurface scattering, octane render, 8k'
  },
  {
    id: 'watercolor',
    label: '水彩手繪',
    suffix: 'loose watercolor painting, visible paper texture, soft pigment bleeding, hand-painted'
  }
]

/** 預設選用的文生圖模型：Nano Banana 2.1（Google，支援多種比例與 4K） */
function resolveDefaultEndpoint(): string {
  const prefer = 'google/nano-banana-2.1'
  if (FAL_TEXT_TO_IMAGE_MODELS.some((model) => model.id === prefer)) return prefer
  return FAL_TEXT_TO_IMAGE_MODELS[0]?.id ?? ''
}

type TextToImageMode = 'prompt' | 'chat'

export const TextToImagePage: React.FC = () => {
  const [mode, setMode] = useState<TextToImageMode>('prompt')
  const [prompt, setPrompt] = useState('')
  const [styleId, setStyleId] = useState<string | null>(null)
  const [endpointId, setEndpointId] = useState<string>(() => resolveDefaultEndpoint())
  const [aspectId, setAspectId] = useState<TextToImageAspect>(ASPECT_RATIOS[0].id)
  const [imageCount, setImageCount] = useState<number>(1)
  const [outputFormat, setOutputFormat] = useState<TextToImageOutputFormat>('png')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizeError, setOptimizeError] = useState<string | null>(null)
  const [optimizeNotice, setOptimizeNotice] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [results, setResults] = useState<TextToImageFileEntry[]>([])
  const [lastCost, setLastCost] = useState<{ costUsd?: number; costIsEstimated?: boolean }>({})
  const [previewImage, setPreviewImage] = useState<TextToImageFileEntry | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null)
  const [referenceImages, setReferenceImages] = useState<BatchItem[]>([])

  const selectedModel = useMemo(
    () => FAL_TEXT_TO_IMAGE_MODELS.find((model) => model.id === endpointId),
    [endpointId]
  )
  const selectedAspect = ASPECT_RATIOS.find((ratio) => ratio.id === aspectId) ?? ASPECT_RATIOS[0]
  const trimmedPrompt = prompt.trim()
  const canOptimize = trimmedPrompt.length > 0 && !isOptimizing
  // 陣列欄位模型可放多張；單一欄位模型只接受 1 張
  const referenceLimit = selectedModel?.isArrayReferenceImage ? MAX_REFERENCE_IMAGES : 1
  const referenceUnsupported =
    referenceImages.length > 0 && !selectedModel?.referenceImageField
  const referenceRequiredMissing =
    Boolean(selectedModel?.requiresReferenceImage) && referenceImages.length === 0
  const referenceOverLimit = referenceImages.length > referenceLimit
  const canGenerate =
    trimmedPrompt.length > 0 && !isGenerating && !referenceUnsupported && !referenceRequiredMissing
  const generateDisabledReason = isGenerating
    ? ''
    : trimmedPrompt.length === 0
      ? '請先輸入提示詞'
      : referenceUnsupported
        ? '目前選用的模型不支援參考圖'
        : referenceRequiredMissing
          ? '此模型必須提供參考圖'
          : ''
  const estimatedTotal = selectedModel ? estimateBatchCostUsd(selectedModel, imageCount) : undefined

  // 按 Esc 關閉放大預覽
  useEffect(() => {
    if (!previewImage) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setPreviewImage(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [previewImage])

  // 讀取「文生圖」資料夾的所有圖片並顯示
  const refreshOutputs = async (): Promise<void> => {
    const result = await window.electronAPI.listTextToImageOutputs()
    if (result.ok) setResults(result.files)
  }

  // 每次進入頁面時載入資料夾既有的生成結果
  useEffect(() => {
    void refreshOutputs()
  }, [])

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

  const handleToggleStyle = (style: (typeof STYLE_PRESETS)[number]): void => {
    setOptimizeNotice(null)
    if (styleId === style.id) {
      setStyleId(null)
      // 取消選取時一併移除先前附加的風格描述
      setPrompt((current) =>
        current
          .replace(`, ${style.suffix}`, '')
          .replace(`${style.suffix}, `, '')
          .replace(style.suffix, '')
          .trim()
      )
      return
    }
    setStyleId(style.id)
    // 避免重複附加相同風格描述
    setPrompt((current) =>
      current.includes(style.suffix)
        ? current
        : `${current.trim()}${current.trim() ? ', ' : ''}${style.suffix}`
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
    setLastCost({})
    try {
      const result = await window.electronAPI.generateTextToImage({
        endpointId,
        prompt: trimmedPrompt,
        aspectId,
        numImages: imageCount,
        outputFormat,
        referenceImageFilePaths: referenceImages.map((image) => image.sourceFilePath)
      })
      if (result.ok) {
        // 生成後重新讀取「文生圖」資料夾，顯示包含舊結果在內的所有圖片
        setLastCost({ costUsd: result.costUsd, costIsEstimated: result.costIsEstimated })
        await refreshOutputs()
      } else {
        setGenerateError(result.message)
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : '文字生成圖片失敗，請稍後再試')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectReference = async (): Promise<void> => {
    const items = await window.electronAPI.selectReferenceImages()
    if (items.length === 0) return

    setReferenceImages((prev) => {
      // 單一欄位模型只保留 1 張（新選的圖取代舊圖）
      if (!selectedModel?.isArrayReferenceImage) {
        return [items[0]]
      }
      const merged = [...prev]
      for (const item of items) {
        if (merged.some((existing) => existing.sourceFilePath === item.sourceFilePath)) continue
        if (merged.length >= MAX_REFERENCE_IMAGES) break
        merged.push(item)
      }
      return merged
    })
  }

  const handleRemoveReference = (index: number): void => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDownload = async (image: TextToImageFileEntry): Promise<void> => {
    if (downloadingId) return
    setDownloadingId(image.filePath)
    setDownloadNotice(null)
    try {
      const result = await window.electronAPI.saveTextToImageAs(image.filePath)
      if (result.ok) {
        setDownloadNotice('已儲存圖片')
      } else if (!result.canceled) {
        setDownloadNotice(result.message)
      }
    } catch (err) {
      setDownloadNotice(err instanceof Error ? err.message : '儲存失敗，請稍後再試')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-zinc-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-7 space-y-6">
        {/* 頁面標題與模式切換 */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 to-fuchsia-500/15 border border-indigo-500/30 text-indigo-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">文字生成圖片</h1>
              <p className="mt-0.5 text-xs text-zinc-400">
                {mode === 'prompt'
                  ? '輸入提示詞即可從零生成全新圖片，不需要先準備素材圖。'
                  : '先和 DeepSeek 討論想法、上傳參考圖，確認後由 AI 選擇模型並交給 fal.ai 生成。'}
              </p>
            </div>
          </div>

          {/* Prompt / Chat 模式切換 */}
          <div
            aria-label="文字生成圖片模式切換"
            className="flex shrink-0 items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/70 p-1"
          >
            <button
              onClick={() => setMode('prompt')}
              aria-pressed={mode === 'prompt'}
              title="使用提示詞直接生成圖片"
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

        {/* 提示詞模式（保留原本的工作流程，切到對話模式時僅隱藏） */}
        <div className={mode === 'prompt' ? 'space-y-6' : 'hidden'}>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* 左側：提示詞與風格 */}
          <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="text-to-image-prompt"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                <Palette className="h-3.5 w-3.5 text-indigo-400" />
                提示詞 (Prompt)
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
              id="text-to-image-prompt"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                setOptimizeNotice(null)
              }}
              rows={7}
              placeholder="例如：黃昏的海岸公路，一輛復古敞篷車駛向遠方，電影感色調，細節豐富"
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-3 text-sm leading-relaxed text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-indigo-500"
            />

            {/* 參考圖（選用） */}
            <div className="space-y-2 border-t border-zinc-800/80 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <ImagePlus className="h-3.5 w-3.5 text-indigo-400" />
                  參考圖（選用）
                </div>
                {referenceImages.length > 0 && (
                  <span className="text-[11px] text-zinc-500">
                    {referenceImages.length} / {referenceLimit} 張
                  </span>
                )}
              </div>

              {referenceImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {referenceImages.map((image, index) => (
                    <div
                      key={image.sourceFilePath}
                      title={image.sourceFileName}
                      className="group relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
                    >
                      <img
                        src={image.sourcePreviewUrl}
                        alt={`參考圖 ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-1 top-1 rounded bg-black/70 px-1 text-[9px] font-semibold text-zinc-200">
                        {index + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveReference(index)}
                        title="移除參考圖"
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded bg-black/70 text-zinc-300 opacity-0 transition hover:bg-rose-500/80 hover:text-white group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {referenceImages.length < referenceLimit ? (
                <button
                  onClick={handleSelectReference}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 px-3 py-3 text-xs text-zinc-400 transition hover:border-indigo-500 hover:text-indigo-200"
                >
                  <ImagePlus className="h-4 w-4" />
                  {referenceImages.length === 0
                    ? selectedModel?.isArrayReferenceImage
                      ? '加入參考圖（可多選）'
                      : '加入參考圖'
                    : '再加入參考圖'}
                </button>
              ) : (
                <p className="text-[11px] text-zinc-600">
                  {selectedModel?.isArrayReferenceImage
                    ? `已達上限 ${MAX_REFERENCE_IMAGES} 張`
                    : '此模型僅支援 1 張參考圖，若要更換請先移除'}
                </p>
              )}

              {referenceImages.length > 0 && (
                <p className="text-[11px] text-zinc-600">
                  AI 會參考這 {referenceImages.length} 張圖生成新圖片
                  {referenceOverLimit ? '（此模型僅支援 1 張，將只使用第 1 張）' : ''}
                </p>
              )}

              {referenceUnsupported && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
                  目前選用的模型不支援參考圖，請改用下拉選單中標示「（可參考圖）」的模型。
                </p>
              )}

              {referenceRequiredMissing && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
                  此模型必須提供參考圖才能生成，請先加入參考圖。
                </p>
              )}
            </div>

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
                {STYLE_PRESETS.map((style) => {
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

            <TextToImageSettingsFields
              idPrefix="text-to-image"
              endpointId={endpointId}
              onEndpointIdChange={setEndpointId}
              aspectId={aspectId}
              onAspectIdChange={setAspectId}
              imageCount={imageCount}
              onImageCountChange={setImageCount}
              outputFormat={outputFormat}
              onOutputFormatChange={setOutputFormat}
              selectedModel={selectedModel}
            />

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              title={generateDisabledReason || '產生圖片'}
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
              {isGenerating ? '生成中…' : `開始生成（${imageCount} 張）`}
            </button>

            {estimatedTotal !== undefined && (
              <p className="text-[11px] text-zinc-500">
                預估費用：{formatUsd(estimatedTotal)}
                {selectedModel?.pricing?.isEstimate ? '（依 1024×1024 換算）' : ''}
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
              {lastCost.costUsd !== undefined && (
                <span>
                  本次費用：{formatUsd(lastCost.costUsd)}
                  {lastCost.costIsEstimated ? '（預估）' : ''}
                </span>
              )}
              <span>
                {selectedAspect.width} × {selectedAspect.height} · {outputFormat.toUpperCase()}
              </span>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="mt-3 flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 px-6 py-10 text-center">
              <ImagePlus className="h-7 w-7 text-zinc-700" />
              <p className="text-sm text-zinc-400">
                {isGenerating ? '生成中…' : '生成的圖片會顯示在這裡'}
              </p>
              <p className="text-[11px] text-zinc-600">
                輸入提示詞並選擇模型後，點擊「開始生成」即可產生全新圖片。
              </p>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((image, index) => (
                <figure
                  key={`${image.url}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                >
                  <button
                    onClick={() => setPreviewImage(image)}
                    title="點擊放大"
                    className="block aspect-square w-full cursor-zoom-in overflow-hidden bg-zinc-900"
                  >
                    <img
                      src={image.url}
                      alt={`生成結果 ${index + 1}`}
                      className="h-full w-full object-contain transition duration-200 group-hover:scale-[1.03]"
                    />
                  </button>

                  {/* 滑鼠移入時顯示的下載按鈕（右上角） */}
                  <button
                    onClick={() => handleDownload(image)}
                    disabled={downloadingId !== null}
                    title="儲存圖片（另存新檔）"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950/90 text-zinc-200 opacity-0 shadow transition hover:bg-indigo-500 hover:text-white group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {downloadingId === image.filePath ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <figcaption className="flex items-center justify-between gap-2 px-2.5 py-2 text-[10px] text-zinc-500">
                    <span className="truncate" title={image.fileName}>
                      {image.fileName}
                    </span>
                    <button
                      onClick={() => window.electronAPI.openPathInExplorer(image.filePath)}
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
          <TextToImageChat
            isActive={mode === 'chat'}
            endpointId={endpointId}
            onEndpointIdChange={setEndpointId}
            aspectId={aspectId}
            onAspectIdChange={setAspectId}
            imageCount={imageCount}
            onImageCountChange={setImageCount}
            outputFormat={outputFormat}
            onOutputFormatChange={setOutputFormat}
            selectedModel={selectedModel}
            onImagesGenerated={refreshOutputs}
            onPreviewImage={setPreviewImage}
          />
        </div>
      </div>

      {/* 放大預覽 Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-8"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setPreviewImage(null)}
            title="關閉"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/80 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={previewImage.url}
            alt="放大預覽"
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </main>
  )
}
