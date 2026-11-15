import React, { useMemo, useState } from 'react'
import {
  FAL_TEXT_TO_VIDEO_MODELS,
  STARRED_TEXT_TO_VIDEO_IDS
} from '../../../shared/falTextToVideoModels'
import { describeModelPricing, formatModelPriceTag } from '../../../shared/falPricing'
import type { FalModelPreset, TextToVideoAspect } from '../../../shared/types'
import { buildModelGroups, hasModelSearchResults } from '../utils/modelOptions'
import {
  VIDEO_ASPECT_RATIOS,
  VIDEO_DURATION_OPTIONS,
  VIDEO_RESOLUTION_OPTIONS,
  describeVideoModelSupport
} from '../utils/textToVideoOptions'

export type VideoSettingsModeKind = 'text-to-video' | 'image-to-video'

function formatVideoModelOptionSuffix(
  model: FalModelPreset,
  modeKind: VideoSettingsModeKind
): string {
  if (modeKind === 'image-to-video') {
    if (model.isArrayImageInput) return '（可多張圖）'
    if (model.requiresEndImage) return '（需首尾幀）'
    if (model.endImageField) return '（支援尾幀）'
    return ''
  }
  return model.referenceImageField && !model.name.includes('可參考圖') ? '（可參考圖）' : ''
}

export interface TextToVideoSettingsFieldsProps {
  /** 同一頁面可能同時存在提示詞／對話兩種模式，需使用不同 id */
  idPrefix: string
  /** 文生影片或圖生影片模式（影響預設清單與選項標註） */
  modeKind?: VideoSettingsModeKind
  /** 可供選擇的模型清單（預設使用文字生成影片模型清單） */
  models?: FalModelPreset[]
  /** 精選置頂模型 ID 集合 */
  starredIds?: Iterable<string>
  endpointId: string
  onEndpointIdChange: (endpointId: string) => void
  aspectId: TextToVideoAspect
  onAspectIdChange: (aspectId: TextToVideoAspect) => void
  durationSeconds: number
  onDurationSecondsChange: (seconds: number) => void
  resolution: string
  onResolutionChange: (resolution: string) => void
  generateAudio: boolean
  onGenerateAudioChange: (enabled: boolean) => void
  selectedModel?: FalModelPreset
}

/**
 * 提示詞模式與對話模式共用的 fal.ai 影片模型（文生影片／圖生影片）／比例／秒數／畫質／音效設定。
 */
export const TextToVideoSettingsFields: React.FC<TextToVideoSettingsFieldsProps> = ({
  idPrefix,
  modeKind = 'text-to-video',
  models = FAL_TEXT_TO_VIDEO_MODELS,
  starredIds = STARRED_TEXT_TO_VIDEO_IDS,
  endpointId,
  onEndpointIdChange,
  aspectId,
  onAspectIdChange,
  durationSeconds,
  onDurationSecondsChange,
  resolution,
  onResolutionChange,
  generateAudio,
  onGenerateAudioChange,
  selectedModel
}) => {
  const [modelQuery, setModelQuery] = useState('')
  const modelGroups = useMemo(
    () => buildModelGroups(models, modelQuery, endpointId, starredIds),
    [models, modelQuery, endpointId, starredIds]
  )
  const selectedAspect =
    VIDEO_ASPECT_RATIOS.find((ratio) => ratio.id === aspectId) ?? VIDEO_ASPECT_RATIOS[0]
  const supportNotes = useMemo(() => describeVideoModelSupport(selectedModel), [selectedModel])

  const supportsDuration = !selectedModel?.unsupportedFields?.includes('duration')
  const supportsResolution = !selectedModel?.unsupportedFields?.includes('resolution')
  const supportsAudio = Boolean(selectedModel?.audioField)

  return (
    <div className="space-y-5">
      {/* 模型選擇 */}
      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-model`} className="text-[11px] text-zinc-400">
          AI 模型（{models.length} 個 fal.ai{' '}
          {modeKind === 'image-to-video' ? '圖生影片' : '文生影片'}模型）
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
                  {formatVideoModelOptionSuffix(model, modeKind)} —{' '}
                  {formatModelPriceTag(model.pricing)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {!hasModelSearchResults(modelGroups) && (
          <p className="text-[11px] text-zinc-500">沒有符合「{modelQuery}」的模型</p>
        )}
        <p className="text-[11px] text-zinc-600">
          計價基準：{describeModelPricing(selectedModel?.pricing)}
        </p>
        {supportNotes.length > 0 && (
          <p className="text-[10px] leading-relaxed text-zinc-500">{supportNotes.join(' · ')}</p>
        )}
      </div>

      {/* 畫面比例 */}
      <div className="space-y-2">
        <span className="text-[11px] text-zinc-400">畫面比例</span>
        <div className="grid grid-cols-3 gap-1.5">
          {VIDEO_ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.id}
              type="button"
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

      {/* 影片長度 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">影片長度</span>
          {!supportsDuration && <span className="text-[10px] text-zinc-600">此模型固定秒數</span>}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {VIDEO_DURATION_OPTIONS.map((sec) => (
            <button
              key={sec}
              type="button"
              disabled={!supportsDuration}
              onClick={() => onDurationSecondsChange(sec)}
              aria-pressed={durationSeconds === sec}
              className={`rounded-lg border py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                durationSeconds === sec
                  ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {sec} 秒
            </button>
          ))}
        </div>
      </div>

      {/* 輸出畫質 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">輸出畫質</span>
          {!supportsResolution && (
            <span className="text-[10px] text-zinc-600">依模型預設畫質</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {VIDEO_RESOLUTION_OPTIONS.map((res) => (
            <button
              key={res}
              type="button"
              disabled={!supportsResolution}
              onClick={() => onResolutionChange(res)}
              aria-pressed={resolution === res}
              className={`rounded-lg border py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                resolution === res
                  ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* 原生音效 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">原生音效</span>
          {!supportsAudio && (
            <span className="text-[10px] text-zinc-600">此模型不支援音效欄位</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { value: false, label: '關閉音效' },
            { value: true, label: '開啟原生音效' }
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              disabled={!supportsAudio}
              onClick={() => onGenerateAudioChange(option.value)}
              aria-pressed={supportsAudio && generateAudio === option.value}
              className={`rounded-lg border py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                supportsAudio && generateAudio === option.value
                  ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
