import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Code2,
  Cpu,
  MessageSquareText,
  Sliders,
  AlertCircle,
  Maximize
} from 'lucide-react'
import { DEFAULT_FAL_PRESETS } from '@shared/types'
import { useBatchStore } from '../store/useBatchStore'

export const SidebarConfig: React.FC = () => {
  const generationConfig = useBatchStore((s) => s.generationConfig)
  const updateGenerationConfig = useBatchStore((s) => s.updateGenerationConfig)
  const applyModelPreset = useBatchStore((s) => s.applyModelPreset)

  const [isCustomEndpoint, setIsCustomEndpoint] = useState(false)
  const [showAdvancedJson, setShowAdvancedJson] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)

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
            <select
              value={generationConfig.endpointId}
              onChange={(e) => applyModelPreset(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              {DEFAULT_FAL_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={generationConfig.endpointId}
                onChange={(e) => updateGenerationConfig({ endpointId: e.target.value })}
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
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <MessageSquareText className="w-3.5 h-3.5 text-indigo-400" />
            全域提示詞 (Global Prompt)
          </label>

          <div className="space-y-1.5">
            <textarea
              rows={4}
              value={generationConfig.prompt}
              onChange={(e) => updateGenerationConfig({ prompt: e.target.value })}
              placeholder="輸入套用至所有圖片的提示詞..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
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
                checked={generationConfig.upscaleEnabled}
                onChange={(e) => updateGenerationConfig({ upscaleEnabled: e.target.checked })}
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-600"
              />
              啟用放大
            </label>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-zinc-400">放大倍率</span>
            <select
              value={generationConfig.upscaleFactor}
              disabled={!generationConfig.upscaleEnabled}
              onChange={(e) =>
                updateGenerationConfig({ upscaleFactor: parseInt(e.target.value, 10) })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value={2}>2x（兩倍解析度）</option>
              <option value={4}>4x（四倍解析度）</option>
            </select>
          </div>

          <p className="text-[10px] text-zinc-500 leading-relaxed">
            勾選後，節點工作流會加入「放大圖片」節點；實際放大管線將於下一階段串接。
          </p>
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

