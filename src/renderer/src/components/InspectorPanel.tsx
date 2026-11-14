import React, { useRef, useState } from 'react'
import {
  Columns,
  ExternalLink,
  FileImage,
  RotateCcw,
  SplitSquareHorizontal,
  Terminal,
  X
} from 'lucide-react'
import { useBatchStore } from '../store/useBatchStore'
import { formatUsd } from '../utils/cost'

export const InspectorPanel: React.FC = () => {
  const items = useBatchStore((s) => s.items)
  const selectedItemId = useBatchStore((s) => s.selectedItemId)
  const selectItem = useBatchStore((s) => s.selectItem)
  const updateItemCustomPrompt = useBatchStore((s) => s.updateItemCustomPrompt)
  const retrySingleItem = useBatchStore((s) => s.retrySingleItem)

  const [compareMode, setCompareMode] = useState<'slider' | 'side-by-side'>('slider')
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const compareAreaRef = useRef<HTMLDivElement>(null)

  /** 依滑鼠 / 觸控的 X 座標更新分割位置 (0~100) */
  const updateSliderFromClientX = (clientX: number): void => {
    const el = compareAreaRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) return
    const pct = ((clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.min(100, Math.max(0, pct)))
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    updateSliderFromClientX(e.clientX)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!isDragging) return
    updateSliderFromClientX(e.clientX)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!isDragging) return
    setIsDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const item = items.find((i) => i.id === selectedItemId)

  if (!item) {
    return null
  }

  const outputUrl = item.savedPreviewUrl || item.outputImageUrl
  const hasOutput = Boolean(outputUrl)

  return (
    <aside className="w-96 shrink-0 bg-zinc-900/70 border-l border-zinc-800/80 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FileImage className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold text-zinc-200 truncate" title={item.sourceFileName}>
            {item.sourceFileName}
          </span>
        </div>
        <button
          onClick={() => selectItem(null)}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          title="關閉檢視面板"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Before / After Comparison Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {hasOutput ? '前後對比預覽 (Before / After)' : '原始圖片預覽'}
            </span>
            {hasOutput && (
              <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setCompareMode('slider')}
                  className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                    compareMode === 'slider'
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <SplitSquareHorizontal className="w-3 h-3" />
                  滑桿
                </button>
                <button
                  onClick={() => setCompareMode('side-by-side')}
                  className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                    compareMode === 'side-by-side'
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Columns className="w-3 h-3" />
                  並排
                </button>
              </div>
            )}
          </div>

          {!hasOutput ? (
            <div className="aspect-square rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
              <img
                src={item.sourcePreviewUrl}
                alt={item.sourceFileName}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : compareMode === 'slider' ? (
            <div className="space-y-2">
              <div
                ref={compareAreaRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`group relative aspect-square rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden select-none touch-none cursor-ew-resize ${
                  isDragging ? 'ring-1 ring-indigo-500/60' : ''
                }`}
              >
                {/* After (AI Result) as full base layer */}
                <img
                  src={outputUrl}
                  alt="AI Output"
                  className="absolute inset-0 w-full h-full object-contain"
                />

                {/* Before (Original) clipped by sliderPos */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={item.sourcePreviewUrl}
                    alt="Original Input"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Divider Line */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-[11px] text-white font-bold shadow transition-transform group-hover:scale-110">
                    ↔
                  </div>
                </div>

                <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-zinc-200">
                  Before (原圖)
                </span>
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-indigo-600/80 text-[10px] text-white">
                  After (AI)
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-ew-resize"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="aspect-square rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden">
                  <img
                    src={item.sourcePreviewUrl}
                    alt="Before"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[10px] text-center text-zinc-400">原始圖片</div>
              </div>
              <div className="space-y-1">
                <div className="aspect-square rounded-lg bg-zinc-950 border border-emerald-500/40 overflow-hidden">
                  <img src={outputUrl} alt="After" className="w-full h-full object-contain" />
                </div>
                <div className="text-[10px] text-center text-emerald-400">AI 生成結果</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick File Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.electronAPI.openPathInExplorer(item.sourceFilePath)}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 flex items-center justify-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            開啟原圖位置
          </button>
          {item.savedFilePath && (
            <button
              onClick={() => window.electronAPI.openPathInExplorer(item.savedFilePath!)}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center justify-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              開啟輸出圖位置
            </button>
          )}
        </div>

        <div className="h-px bg-zinc-800" />

        {/* Per-Image Custom Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300">
              單張專屬提示詞 (Custom Prompt)
            </label>
            {item.customPrompt && (
              <button
                onClick={() => updateItemCustomPrompt(item.id, '')}
                className="text-[10px] text-zinc-500 hover:text-zinc-300"
              >
                清除覆寫
              </button>
            )}
          </div>
          <textarea
            rows={3}
            value={item.customPrompt || ''}
            onChange={(e) => updateItemCustomPrompt(item.id, e.target.value)}
            placeholder="留空則使用左側全域提示詞；填寫後此圖片將優先使用此專屬 Prompt..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Task Metadata & Retry */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">任務狀態</span>
            <span className="font-mono text-zinc-200 uppercase">{item.status}</span>
          </div>
          {item.startedAt && item.completedAt && (
            <div className="flex justify-between">
              <span className="text-zinc-500">處理耗時</span>
              <span className="font-mono text-emerald-400">
                {((item.completedAt - item.startedAt) / 1000).toFixed(2)} 秒
              </span>
            </div>
          )}
          {typeof item.apiCostUsd === 'number' && (
            <div className="flex justify-between">
              <span className="text-zinc-500">API 費用 ({item.apiCostCurrency ?? 'USD'})</span>
              <span className="font-mono text-amber-300">
                {item.apiCostIsEstimated ? '~' : ''}
                {formatUsd(item.apiCostUsd)}
                <span className="ml-1 text-[10px] text-zinc-500">
                  {item.apiCostIsEstimated ? '(預估費用)' : '(實際扣款)'}
                </span>
              </span>
            </div>
          )}
          {item.requestId && (
            <div className="flex justify-between gap-3">
              <span className="text-zinc-500 shrink-0">Request ID</span>
              <span className="font-mono text-[10px] text-zinc-400 truncate" title={item.requestId}>
                {item.requestId}
              </span>
            </div>
          )}
          {item.errorMessage && (
            <div className="pt-1 border-t border-zinc-800 text-rose-400 text-[11px] break-words">
              錯誤原因：{item.errorMessage}
            </div>
          )}
          <button
            onClick={() => retrySingleItem(item.id)}
            className="w-full mt-2 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            單獨生成 / 重新執行此圖片
          </button>
        </div>

        {/* Real-time Logs */}
        {item.logs && item.logs.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              fal.ai 執行日誌
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 max-h-36 overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1">
              {item.logs.map((log, idx) => (
                <div key={idx} className="truncate">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

