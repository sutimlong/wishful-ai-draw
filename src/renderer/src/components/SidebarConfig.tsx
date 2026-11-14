import React, { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Coins,
  Code2,
  Cpu,
  MessageSquareText,
  Sliders,
  AlertCircle,
  Maximize,
  Scissors,
  Expand,
  Loader2,
  Smile,
  Wand2
} from 'lucide-react'
import { FAL_MODEL_CATALOG } from '@shared/falModelCatalog'
import { describeModelPricing, formatModelPriceTag } from '@shared/falPricing'
import { useBatchStore } from '../store/useBatchStore'
import { buildModelGroups, hasModelSearchResults } from '../utils/modelOptions'

export const SidebarConfig: React.FC = () => {
  const generationConfig = useBatchStore((s) => s.generationConfig)
  const updateGenerationConfig = useBatchStore((s) => s.updateGenerationConfig)
  const applyModelPreset = useBatchStore((s) => s.applyModelPreset)

  const [isCustomEndpoint, setIsCustomEndpoint] = useState(false)
  const [showAdvancedJson, setShowAdvancedJson] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [modelQuery, setModelQuery] = useState('')
  // 全域提示詞 AI 優化（DeepSeek）狀態
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false)
  const [optimizeError, setOptimizeError] = useState<string | null>(null)
  const [optimizeNotice, setOptimizeNotice] = useState<string | null>(null)

  // 目前選用的模型（可能來自目錄，也可能是自訂 / 已下架的端點）
  const selectedModel = useMemo(
    () => FAL_MODEL_CATALOG.find((preset) => preset.id === generationConfig.endpointId),
    [generationConfig.endpointId]
  )

  // 依分組整理目錄，並套用搜尋關鍵字（名稱 / 端點 / 實驗室）
  const modelGroups = useMemo(
    () => buildModelGroups(FAL_MODEL_CATALOG, modelQuery, generationConfig.endpointId),
    [modelQuery, generationConfig.endpointId]
  )

  const handleJsonChange = (val: string): void => {
    updateGenerationConfig({ customJsonParams: val })
    if (!val.trim()) {
      setJsonError(null)
      return
    }
    try {
      const parsed = JSON.parse(val)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setJsonError('必須為有效的 JSON Object (例如 {"upscale_factor": 2})')
      } else {
        setJsonError(null)
      }
    } catch {
      setJsonError('JSON 語法格式錯誤')
    }
  }

  /** 呼叫 DeepSeek 將全域提示詞優化並翻譯成英文，成功後直接覆寫欄位內容 */
  const handleOptimizePrompt = async (): Promise<void> => {
    const source = generationConfig.prompt.trim()
    if (!source || isOptimizingPrompt) return

    setIsOptimizingPrompt(true)
    setOptimizeError(null)
    setOptimizeNotice(null)
    try {
      const result = await window.electronAPI.optimizePrompt(source)
      if (result.ok) {
        updateGenerationConfig({ prompt: result.prompt })
        setOptimizeNotice('已優化並翻譯為英文提示詞')
      } else {
        setOptimizeError(result.message)
      }
    } catch (err) {
      setOptimizeError(err instanceof Error ? err.message : '提示詞優化失敗，請稍後再試')
    } finally {
      setIsOptimizingPrompt(false)
    }
  }

  return (
    <aside className="w-80 shrink-0 bg-zinc-900/60 border-r border-zinc-800/80 flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* 1. Model Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              AI 模型選擇 (fal.ai)
            </label>
            <button
              onClick={() => setIsCustomEndpoint(!isCustomEndpoint)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
            >
              {isCustomEndpoint ? '使用預設清單' : '自訂 Endpoint'}
            </button>
          </div>

          {!isCustomEndpoint ? (
            <div className="space-y-2">
              <input
                type="text"
                value={modelQuery}
                onChange={(e) => setModelQuery(e.target.value)}
                placeholder={`搜尋 ${FAL_MODEL_CATALOG.length} 個 fal.ai 模型（名稱 / 端點 / 實驗室）`}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={generationConfig.endpointId}
                onChange={(e) => applyModelPreset(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                {/* 自訂或已下架的端點不在目錄中，補一個選項避免下拉顯示空白 */}
                {!selectedModel && (
                  <option value={generationConfig.endpointId}>
                    {generationConfig.endpointId}（不在目錄中）
                  </option>
                )}
                {modelGroups.map((group) => (
                  <optgroup key={group.label} label={`${group.label} (${group.models.length})`}>
                    {group.models.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name} — {formatModelPriceTag(preset.pricing)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {modelQuery.trim() !== '' && !hasModelSearchResults(modelGroups) && (
                <p className="text-[11px] text-amber-400">找不到符合「{modelQuery}」的模型</p>
              )}
              {selectedModel?.description && (
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  {selectedModel.description}
                </p>
              )}
              {selectedModel && (
                <p
                  className="flex items-start gap-1.5 text-[11px] leading-relaxed text-emerald-300/90"
                  title="生成一張圖片的預估費用（依 fal.ai 公布價格換算；`~` 表示估算值）"
                >
                  <Coins className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{describeModelPricing(selectedModel.pricing)}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={generationConfig.endpointId}
                onChange={(e) =>
                  // 自訂端點沒有 schema 資訊，清掉上一個模型帶來的參數過濾規則
                  updateGenerationConfig({
                    endpointId: e.target.value,
                    unsupportedFields: undefined
                  })
                }
                placeholder="例如 fal-ai/flux/dev/image-to-image"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generationConfig.imageInputField}
                  onChange={(e) => updateGenerationConfig({ imageInputField: e.target.value })}
                  placeholder="圖片欄位名 (預設 image_url)"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300"
                />
                <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generationConfig.isArrayImageInput}
                    onChange={(e) =>
                      updateGenerationConfig({ isArrayImageInput: e.target.checked })
                    }
                    className="rounded border-zinc-700 bg-zinc-900 text-indigo-600"
                  />
                  陣列格式
                </label>
              </div>
            </div>
          )}

          <p className="text-[11px] text-zinc-500 font-mono truncate">
            Endpoint: {generationConfig.endpointId}
          </p>
        </div>

        <div className="h-px bg-zinc-800/80" />

        {/* 2. Global Prompt & Negative Prompt */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="min-w-0 text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <MessageSquareText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">
                全域提示詞
                <span className="ml-1 normal-case tracking-normal text-[10px] font-medium text-zinc-500">
                  (Global Prompt)
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={handleOptimizePrompt}
              disabled={isOptimizingPrompt || !generationConfig.prompt.trim()}
              title="使用 DeepSeek 改寫並翻譯成適合影像生成模型的英文提示詞"
              className="shrink-0 whitespace-nowrap flex items-center gap-1 rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2 py-1 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 disabled:border-zinc-800 disabled:bg-transparent disabled:text-zinc-600 disabled:cursor-not-allowed transition"
            >
              {isOptimizingPrompt ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
              {isOptimizingPrompt ? '優化中…' : 'AI 優化'}
            </button>
          </div>

          <div className="space-y-1.5">
            <textarea
              rows={4}
              value={generationConfig.prompt}
              onChange={(e) => updateGenerationConfig({ prompt: e.target.value })}
              placeholder="輸入套用至所有圖片的提示詞..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
            {optimizeError && (
              <p className="text-[11px] text-rose-400 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{optimizeError}</span>
              </p>
            )}
            {!optimizeError && optimizeNotice && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Wand2 className="w-3 h-3 shrink-0" />
                {optimizeNotice}
              </p>
            )}
            <p className="text-[11px] text-zinc-500">
              提示：點擊右側單張圖片可設定專屬覆蓋提示詞 (Custom Prompt)。
            </p>
          </div>

          {generationConfig.includeDiffusionParams !== false && (
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-400">負面提示詞 (Negative Prompt，選填)</span>
              <textarea
                rows={2}
                value={generationConfig.negativePrompt || ''}
                onChange={(e) => updateGenerationConfig({ negativePrompt: e.target.value })}
                placeholder="blurry, low quality, watermark..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          )}
        </div>

        <div className="h-px bg-zinc-800/80" />

        {/* 3. Core Generation Parameters */}
        <div className="space-y-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            生成參數設定
          </label>

          {generationConfig.includeDiffusionParams === false ? (
            <p className="text-[11px] text-zinc-500 leading-relaxed p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
              此模型（OpenAI GPT Image 系列）採用原生參數，不支援 Strength / Steps / CFG
              / Seed 與負面提示詞。如需指定 quality、image_size、num_images
              等參數，請使用下方「進階 JSON 參數覆寫」。
            </p>
          ) : (
            <>
              {/* Strength */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300">重繪幅度 (Strength)</span>
                  <span className="font-mono text-indigo-400">
                    {generationConfig.strength.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={1.0}
                  step={0.01}
                  value={generationConfig.strength}
                  onChange={(e) =>
                    updateGenerationConfig({ strength: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Inference Steps */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300">採樣步數 (Steps)</span>
                  <span className="font-mono text-indigo-400">
                    {generationConfig.numInferenceSteps}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={generationConfig.numInferenceSteps}
                  onChange={(e) =>
                    updateGenerationConfig({ numInferenceSteps: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Guidance Scale */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300">提示詞引導係數 (CFG Scale)</span>
                  <span className="font-mono text-indigo-400">
                    {generationConfig.guidanceScale.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={20.0}
                  step={0.5}
                  value={generationConfig.guidanceScale}
                  onChange={(e) =>
                    updateGenerationConfig({ guidanceScale: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Format & Seed */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-400">輸出格式</span>
              <select
                value={generationConfig.outputFormat}
                onChange={(e) =>
                  updateGenerationConfig({
                    outputFormat: e.target.value as 'png' | 'jpeg' | 'webp'
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="png">PNG (無損)</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-zinc-400">固定種子 (Seed)</span>
              <input
                type="number"
                value={generationConfig.seed ?? ''}
                disabled={generationConfig.includeDiffusionParams === false}
                onChange={(e) =>
                  updateGenerationConfig({
                    seed: e.target.value === '' ? null : parseInt(e.target.value, 10)
                  })
                }
                placeholder={
                  generationConfig.includeDiffusionParams === false ? '此模型不支援' : '隨機'
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* 模型原生參數 */}
        {generationConfig.includeDiffusionParams === false ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              模型原生參數 (GPT Image)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[11px] text-zinc-400">品質</span>
                <select
                  value={generationConfig.quality ?? 'auto'}
                  onChange={(e) =>
                    updateGenerationConfig({
                      quality: e.target.value as 'low' | 'medium' | 'high' | 'auto'
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-200"
                >
                  <option value="auto">auto</option>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-zinc-400">尺寸</span>
                <select
                  value={generationConfig.imageSize ?? 'auto'}
                  onChange={(e) => updateGenerationConfig({ imageSize: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-200"
                >
                  <option value="auto">auto</option>
                  <option value="1024x1024">1024x1024</option>
                  <option value="1024x1536">1024x1536</option>
                  <option value="1536x1024">1536x1024</option>
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-zinc-400">數量</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={generationConfig.numImages ?? 1}
                  onChange={(e) =>
                    updateGenerationConfig({ numImages: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-200"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-zinc-400">安全容忍度</span>
                <select
                  value={generationConfig.safetyTolerance ?? '2'}
                  onChange={(e) => updateGenerationConfig({ safetyTolerance: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-200"
                >
                  <option value="1">1（最嚴格）</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6（最寬鬆）</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <span className="text-[11px] text-zinc-400">Scheduler（選填）</span>
            <input
              type="text"
              value={generationConfig.scheduler ?? ''}
              onChange={(e) => updateGenerationConfig({ scheduler: e.target.value })}
              placeholder="例如 dpmpp_2m"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-200"
            />
          </div>
        )}

        <div className="h-px bg-zinc-800/80" />

        {/* 3.5 影像放大 (Upscale) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Maximize className="w-3.5 h-3.5 text-indigo-400" />
              影像放大 (Upscale)
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={generationConfig.upscale.enabled}
                onChange={(e) =>
                  updateGenerationConfig({ upscale: { ...generationConfig.upscale, enabled: e.target.checked } })
                }
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-600"
              />
              啟用
            </label>
          </div>

          {generationConfig.upscale.enabled && (
            <div className="space-y-2 pl-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">放大倍率</span>
                <select
                  value={generationConfig.upscale.factor}
                  onChange={(e) =>
                    updateGenerationConfig({ upscale: { ...generationConfig.upscale, factor: parseInt(e.target.value, 10) } })
                  }
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200"
                >
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">創造力</span>
                  <span className="font-mono text-indigo-400">{generationConfig.upscale.creativity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={generationConfig.upscale.creativity}
                  onChange={(e) =>
                    updateGenerationConfig({ upscale: { ...generationConfig.upscale, creativity: parseFloat(e.target.value) } })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">相似度</span>
                  <span className="font-mono text-indigo-400">{generationConfig.upscale.resemblance.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={generationConfig.upscale.resemblance}
                  onChange={(e) =>
                    updateGenerationConfig({ upscale: { ...generationConfig.upscale, resemblance: parseFloat(e.target.value) } })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* 去背 (Background Removal) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-indigo-400" />
              去背 (Background Removal)
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={generationConfig.backgroundRemoval.enabled}
                onChange={(e) =>
                  updateGenerationConfig({
                    backgroundRemoval: { ...generationConfig.backgroundRemoval, enabled: e.target.checked }
                  })
                }
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-600"
              />
              啟用
            </label>
          </div>

          {generationConfig.backgroundRemoval.enabled && (
            <div className="space-y-2 pl-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">模型</span>
                <select
                  value={generationConfig.backgroundRemoval.model}
                  onChange={(e) =>
                    updateGenerationConfig({
                      backgroundRemoval: {
                        ...generationConfig.backgroundRemoval,
                        model: e.target.value as typeof generationConfig.backgroundRemoval.model
                      }
                    })
                  }
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200"
                >
                  <option value="General Use (Light)">General Use (Light)</option>
                  <option value="General Use (Heavy)">General Use (Heavy)</option>
                  <option value="Portrait">Portrait</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">運算解析度</span>
                <select
                  value={generationConfig.backgroundRemoval.operatingResolution}
                  onChange={(e) =>
                    updateGenerationConfig({
                      backgroundRemoval: {
                        ...generationConfig.backgroundRemoval,
                        operatingResolution: e.target.value as '1024x1024' | '2048x2048'
                      }
                    })
                  }
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200"
                >
                  <option value="1024x1024">1024x1024</option>
                  <option value="2048x2048">2048x2048</option>
                </select>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generationConfig.backgroundRemoval.refineForeground}
                  onChange={(e) =>
                    updateGenerationConfig({
                      backgroundRemoval: {
                        ...generationConfig.backgroundRemoval,
                        refineForeground: e.target.checked
                      }
                    })
                  }
                  className="rounded border-zinc-700 bg-zinc-900 text-indigo-600"
                />
                前景細化
              </label>
            </div>
          )}
        </div>

        {/* 縮放 (Resize) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Expand className="w-3.5 h-3.5 text-indigo-400" />
              縮放 (Resize)
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={generationConfig.resize.enabled}
                onChange={(e) =>
                  updateGenerationConfig({ resize: { ...generationConfig.resize, enabled: e.target.checked } })
                }
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-600"
              />
              啟用
            </label>
          </div>

          {generationConfig.resize.enabled && (
            <div className="space-y-2 pl-1">
              <div className="grid grid-cols-2 gap-2">
                {(['width', 'height'] as const).map((key) => (
                  <div key={key} className="space-y-1">
                    <span className="text-[11px] text-zinc-400">{key === 'width' ? '寬度' : '高度'}</span>
                    <input
                      type="number"
                      value={generationConfig.resize[key]}
                      onChange={(e) =>
                        updateGenerationConfig({
                          resize: { ...generationConfig.resize, [key]: parseInt(e.target.value, 10) || 0 }
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-200"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">縮放模式</span>
                <select
                  value={generationConfig.resize.fit}
                  onChange={(e) =>
                    updateGenerationConfig({
                      resize: { ...generationConfig.resize, fit: e.target.value as typeof generationConfig.resize.fit }
                    })
                  }
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200"
                >
                  <option value="cover">cover</option>
                  <option value="contain">contain</option>
                  <option value="fill">fill</option>
                  <option value="inside">inside</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 臉部修復 (Face Restore) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-indigo-400" />
              臉部修復 (Face Restore)
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={generationConfig.faceRestore.enabled}
                onChange={(e) =>
                  updateGenerationConfig({ faceRestore: { ...generationConfig.faceRestore, enabled: e.target.checked } })
                }
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-600"
              />
              啟用
            </label>
          </div>

          {generationConfig.faceRestore.enabled && (
            <div className="space-y-2 pl-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">保真度</span>
                  <span className="font-mono text-indigo-400">{generationConfig.faceRestore.fidelity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={generationConfig.faceRestore.fidelity}
                  onChange={(e) =>
                    updateGenerationConfig({
                      faceRestore: { ...generationConfig.faceRestore, fidelity: parseFloat(e.target.value) }
                    })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">放大倍率</span>
                <input
                  type="number"
                  value={generationConfig.faceRestore.upscaleFactor}
                  onChange={(e) =>
                    updateGenerationConfig({
                      faceRestore: { ...generationConfig.faceRestore, upscaleFactor: parseInt(e.target.value, 10) || 1 }
                    })
                  }
                  className="w-20 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-mono text-zinc-200"
                />
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generationConfig.faceRestore.faceUpscale}
                  onChange={(e) =>
                    updateGenerationConfig({
                      faceRestore: { ...generationConfig.faceRestore, faceUpscale: e.target.checked }
                    })
                  }
                  className="rounded border-zinc-700 bg-zinc-900 text-indigo-600"
                />
                放大臉部
              </label>
            </div>
          )}
        </div>

        <div className="h-px bg-zinc-800/80" />

        {/* 4. Collapsible Advanced JSON Override */}
        <div className="space-y-2">
          <button
            onClick={() => setShowAdvancedJson(!showAdvancedJson)}
            className="w-full flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
          >
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              進階 JSON 參數覆寫
            </span>
            {showAdvancedJson ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {showAdvancedJson && (
            <div className="space-y-1.5 pt-1">
              <textarea
                rows={4}
                value={generationConfig.customJsonParams || ''}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder='{"safety_tolerance": "2", "num_images": 1}'
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
              {jsonError && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {jsonError}
                </p>
              )}
              <p className="text-[10px] text-zinc-500">
                此處定義的 JSON 屬性將直接合併至傳送給 fal.ai 的 input payload。
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

