import React from 'react'
import { Gauge, Pause, Play, Square, Zap } from 'lucide-react'
import { MAX_BATCH_CONCURRENCY } from '@shared/concurrency'
import { useBatchStore } from '../store/useBatchStore'
import { formatUsd } from '../utils/cost'

export const BottomActionBar: React.FC = () => {
  const items = useBatchStore((s) => s.items)
  const appSettings = useBatchStore((s) => s.appSettings)
  const queueStatus = useBatchStore((s) => s.queueStatus)
  const startBatch = useBatchStore((s) => s.startBatch)
  const pauseBatch = useBatchStore((s) => s.pauseBatch)
  const resumeBatch = useBatchStore((s) => s.resumeBatch)
  const cancelAll = useBatchStore((s) => s.cancelAll)
  const setConcurrency = useBatchStore((s) => s.setConcurrency)

  const totalCount = items.length
  const completedCount = items.filter((i) => i.status === 'completed').length
  const activeCount = items.filter(
    (i) => i.status === 'uploading' || i.status === 'queued' || i.status === 'processing'
  ).length
  const pendingCount = items.filter(
    (i) => i.status === 'idle' || i.status === 'failed' || i.status === 'cancelled'
  ).length

  const isRunning = queueStatus.isRunning || activeCount > 0
  const overallPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const concurrency = appSettings?.concurrency ?? 2

  const costItems = items.filter((i) => typeof i.apiCostUsd === 'number')
  const totalCostUsd = costItems.reduce((sum, i) => sum + (i.apiCostUsd ?? 0), 0)
  const hasEstimatedCost = costItems.some((i) => i.apiCostIsEstimated)

  return (
    <footer className="h-16 shrink-0 bg-zinc-900/90 border-t border-zinc-800 px-5 flex items-center justify-between gap-6">
      {/* Left: Concurrency Control */}
      <div className="flex items-center gap-3 min-w-[220px]">
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <Gauge className="w-4 h-4 text-indigo-400" />
          <span>同時併發數</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
            {concurrency}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={MAX_BATCH_CONCURRENCY}
          step={1}
          value={concurrency}
          onChange={(e) => setConcurrency(parseInt(e.target.value, 10))}
          className="w-44 accent-indigo-500 cursor-pointer"
          title={`調整同時呼叫 fal.ai 生成的任務數量 (1~${MAX_BATCH_CONCURRENCY})；fal.ai 自助方案上限為 40，圖片上傳階段一律全部並行`}
        />
      </div>

      {/* Center: Overall Progress Bar */}
      <div className="flex-1 max-w-xl space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">
            整體進度：<strong className="text-white">{completedCount}</strong> / {totalCount} 張已完成
            {activeCount > 0 && (
              <span className="ml-2 text-indigo-400">({activeCount} 張正在處理中...)</span>
            )}
          </span>
          <span className="font-mono text-zinc-300 flex items-center gap-3">
            {costItems.length > 0 && (
              <span
                title={
                  hasEstimatedCost
                    ? '本批累計 fal.ai 費用（含預估費用：API Key 無帳務權限或帳務尚未入帳）'
                    : '本批累計 fal.ai 實際扣款金額'
                }
                className={`px-1.5 py-0.5 rounded border text-[11px] ${
                  hasEstimatedCost
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {hasEstimatedCost ? '預估費用 ' : 'API 費用 '}
                {hasEstimatedCost ? '~' : ''}
                {formatUsd(totalCostUsd)}
              </span>
            )}
            {overallPercent}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Right: Batch Execution Controls */}
      <div className="flex items-center gap-2.5">
        {isRunning && (
          <>
            {queueStatus.isPaused ? (
              <button
                onClick={resumeBatch}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                <Play className="w-4 h-4" />
                繼續佇列
              </button>
            ) : (
              <button
                onClick={pauseBatch}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition"
              >
                <Pause className="w-4 h-4" />
                暫停派發
              </button>
            )}

            <button
              onClick={cancelAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700/60 text-xs font-medium transition"
            >
              <Square className="w-3.5 h-3.5" />
              全部取消
            </button>
          </>
        )}

        <button
          onClick={startBatch}
          disabled={pendingCount === 0}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
            pendingCount > 0
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 cursor-pointer'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          <Zap className="w-4 h-4" />
          開始批量生成 ({pendingCount})
        </button>
      </div>
    </footer>
  )
}

