import React from 'react'
import { ArrowRightLeft, Check } from 'lucide-react'
import { formatModelPriceTag } from '../../../shared/falPricing'
import type { FalModelPreset } from '../../../shared/types'

interface ChatSuggestedModelsBarProps {
  suggestedModelId?: string
  suggestedModelIds?: string[]
  models: FalModelPreset[]
  currentEndpointId: string
  onSelectModel: (endpointId: string) => void
}

/** 將 DeepSeek 推薦的單一或多個模型轉換為訊息下方的快速切換按鈕列 */
export const ChatSuggestedModelsBar: React.FC<ChatSuggestedModelsBarProps> = ({
  suggestedModelId,
  suggestedModelIds,
  models,
  currentEndpointId,
  onSelectModel
}) => {
  const candidateIds = [
    ...(suggestedModelIds ?? []),
    ...(suggestedModelId ? [suggestedModelId] : [])
  ]
  const suggestedModels: FalModelPreset[] = []
  const seen = new Set<string>()
  for (const id of candidateIds) {
    if (!id || seen.has(id)) continue
    seen.add(id)
    const found = models.find((model) => model.id === id)
    if (found) suggestedModels.push(found)
  }

  if (suggestedModels.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-0.5" aria-label="推薦模型切換">
      {suggestedModels.map((model) => {
        const isCurrent = model.id === currentEndpointId
        const priceTag = formatModelPriceTag(model.pricing)
        if (isCurrent) {
          return (
            <span
              key={model.id}
              title={`目前選用的模型：${model.name}（${model.id}）`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-300"
            >
              <Check className="h-3 w-3 shrink-0" />
              <span>已切換至建議模型：{model.name}</span>
            </span>
          )
        }
        return (
          <button
            key={model.id}
            type="button"
            onClick={() => onSelectModel(model.id)}
            title={`點擊切換為 ${model.name}（${model.id}）`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-1.5 text-[11px] font-medium text-indigo-200 transition hover:border-indigo-400/50 hover:bg-indigo-500/25 active:scale-[0.99]"
          >
            <ArrowRightLeft className="h-3 w-3 shrink-0 text-indigo-300" />
            <span>切換模型：{model.name}</span>
            {priceTag && priceTag !== '依實際用量計算' && (
              <span className="rounded bg-indigo-950/70 px-1.5 py-0.5 text-[10px] font-normal text-indigo-300/90">
                {priceTag}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
