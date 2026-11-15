import React, { useMemo, useState } from 'react'
import { FAL_TEXT_TO_IMAGE_MODELS } from '@shared/falTextToImageModels'
import { describeModelPricing, formatModelPriceTag } from '@shared/falPricing'
import type { FalModelPreset, TextToImageAspect } from '@shared/types'
import { buildModelGroups, hasModelSearchResults } from '../utils/modelOptions'
import {
  ASPECT_RATIOS,
  IMAGE_COUNTS,
  OUTPUT_FORMATS,
  type TextToImageOutputFormat
} from '../utils/textToImageOptions'

interface TextToImageSettingsFieldsProps {
  /** 同一頁面可能同時存在提示詞／對話兩種模式，需使用不同 id */
  idPrefix: string
  endpointId: string
  onEndpointIdChange: (endpointId: string) => void
  aspectId: TextToImageAspect
  onAspectIdChange: (aspectId: TextToImageAspect) => void
  imageCount: number
  onImageCountChange: (count: number) => void
  outputFormat: TextToImageOutputFormat
  onOutputFormatChange: (format: TextToImageOutputFormat) => void
  selectedModel?: FalModelPreset
}

/**
 * 提示詞模式與對話模式共用的 fal.ai 模型／比例／張數／輸出格式設定。
 * 模型清單與既有生成參數完全一致，確保使用者在兩種模式看到同一份資料庫。
 */
export const TextToImageSettingsFields: React.FC<TextToImageSettingsFieldsProps> = ({
  idPrefix,
  endpointId,
  onEndpointIdChange,
  aspectId,
  onAspectIdChange,
  imageCount,
  onImageCountChange,
  outputFormat,
  onOutputFormatChange,
  selectedModel
}) => {
  const [modelQuery, setModelQuery] = useState('')
  const modelGroups = useMemo(
    () => buildModelGroups(FAL_TEXT_TO_IMAGE_MODELS, modelQuery, endpointId),
    [modelQuery, endpointId]
  )
  const selectedAspect = ASPECT_RATIOS.find((ratio) => ratio.id === aspectId) ?? ASPECT_RATIOS[0]

  return (
    <div className="space-y-5">
      {/* 模型選擇 */}
      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-model`} className="text-[11px] text-zinc-400">
          AI 模型（{FAL_TEXT_TO_IMAGE_MODELS.length} 個 fal.ai 文生圖模型）
        </label>
        <input
          type="text"
          value={modelQuery}
          onChange={(e) => setModelQuery(e.target.value)}
          placeholder="搜尋模型名稱 / 端點 / 實驗室"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[11px] text-zinc-200 placeholder-zinc-600 outline-none focus:border-indigo-500"
        />
        <select
          id={`${idPrefix}-model`}
          value={endpointId}
          onChange={(e) => onEndpointIdChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-zinc-100 outline-none focus:border-indigo-500"
        >
          {modelGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                  {model.referenceImageField && !model.name.includes('可參考圖')
                    ? '（可參考圖）'
                    : ''}{' '}
                  — {formatModelPriceTag(model.pricing)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {!hasModelSearchResults(modelGroups) && (
          <p className="text-[11px] text-zinc-500">沒有符合「{modelQuery}」的模型</p>
        )}
        <p className="text-[11px] text-zinc-600">
          一張圖片預估：{describeModelPricing(selectedModel?.pricing)}
        </p>
      </div>

      <div className="space-y-2">
        <span className="text-[11px] text-zinc-400">畫面比例</span>
        <div className="grid grid-cols-5 gap-1.5">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.id}
              onClick={() => onAspectIdChange(ratio.id)}
              aria-pressed={aspectId === ratio.id}
              title={ratio.hint}
              className={`rounded-lg border py-1.5 text-[11px] font-semibold transition ${
                aspectId === ratio.id
                  ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-zinc-600">{selectedAspect.hint}</p>
      </div>

      <div className="space-y-2">
        <span className="text-[11px] text-zinc-400">生成張數</span>
        <div className="grid grid-cols-3 gap-1.5">
          {IMAGE_COUNTS.map((count) => (
            <button
              key={count}
              onClick={() => onImageCountChange(count)}
              aria-pressed={imageCount === count}
              className={`rounded-lg border py-1.5 text-[11px] font-semibold transition ${
                imageCount === count
                  ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {count} 張
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-format`} className="text-[11px] text-zinc-400">
          輸出格式
        </label>
        <select
          id={`${idPrefix}-format`}
          value={outputFormat}
          onChange={(e) => onOutputFormatChange(e.target.value as TextToImageOutputFormat)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-indigo-500"
        >
          {OUTPUT_FORMATS.map((format) => (
            <option key={format} value={format}>
              {format.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
