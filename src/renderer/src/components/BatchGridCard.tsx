import React from 'react'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  FolderOpen,
  Loader2,
  RotateCcw,
  Trash2,
  XCircle,
  Sparkles
} from 'lucide-react'
import { BatchItem } from '@shared/types'
import { useBatchStore } from '../store/useBatchStore'
import { formatItemCost } from '../utils/cost'
import { BatchItemContextMenu, useItemContextMenu } from './BatchItemContextMenu'

interface Props {
  item: BatchItem
}

export const BatchGridCard: React.FC<Props> = ({ item }) => {
  const selectedItemId = useBatchStore((s) => s.selectedItemId)
  const selectedItemIds = useBatchStore((s) => s.selectedItemIds)
  const selectItem = useBatchStore((s) => s.selectItem)
  const toggleItemSelected = useBatchStore((s) => s.toggleItemSelected)
  const removeItem = useBatchStore((s) => s.removeItem)
  const cancelItem = useBatchStore((s) => s.cancelItem)
  const retrySingleItem = useBatchStore((s) => s.retrySingleItem)

  const isSelected = selectedItemId === item.id
  const isChecked = selectedItemIds.includes(item.id)
  const isActive =
    item.status === 'uploading' || item.status === 'queued' || item.status === 'processing'
  const costLabel = item.status === 'completed' ? formatItemCost(item) : null
  const { state: menuState, open: openMenu, close: closeMenu } = useItemContextMenu()

  const handleCardClick = (e: React.MouseEvent): void => {
    if (e.metaKey || e.ctrlKey) {
      toggleItemSelected(item.id)
      return
    }
    selectItem(item.id)
  }

  const rawDisplayUrl =
    item.status === 'completed' && (item.savedPreviewUrl || item.outputImageUrl)
      ? item.savedPreviewUrl || item.outputImageUrl
      : item.sourcePreviewUrl

  const displayImageUrl =
    rawDisplayUrl && rawDisplayUrl.startsWith('local-media://')
      ? `${rawDisplayUrl}&thumb=1`
      : rawDisplayUrl

  const getStatusBadge = (): React.ReactElement => {
    switch (item.status) {
      case 'uploading':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Loader2 className="w-3 h-3 animate-spin" />
            上傳中
          </span>
        )
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            排隊中 {item.queuePosition !== undefined ? `#${item.queuePosition}` : ''}
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <Loader2 className="w-3 h-3 animate-spin" />
            AI 生成中 {item.progress}%
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            已完成
          </span>
        )
      case 'failed':
        return (
          <span
            title={item.errorMessage}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40"
          >
            <AlertTriangle className="w-3 h-3" />
            失敗
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-700/60 text-zinc-300">
            <XCircle className="w-3 h-3" />
            已取消
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800/90 text-zinc-400">
            等待中
          </span>
        )
    }
  }

  const borderClass = isSelected || isChecked
    ? 'ring-2 ring-indigo-500 border-indigo-500'
    : item.status === 'completed'
      ? 'border-emerald-500/40 hover:border-emerald-500/70'
      : item.status === 'failed'
        ? 'border-rose-500/50 hover:border-rose-500/80'
        : isActive
          ? 'border-indigo-500/50'
          : 'border-zinc-800 hover:border-zinc-700'

  return (
    <>
      <div
        onClick={handleCardClick}
        onContextMenu={(e) => openMenu(e, item)}
        className={`group relative rounded-xl bg-zinc-900/90 border overflow-hidden cursor-pointer transition-all flex flex-col ${borderClass}`}
      >
      {/* Image Container */}
      <div className="aspect-square bg-zinc-950 relative overflow-hidden">
        <img
          src={displayImageUrl}
          alt={item.sourceFileName}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Multi-select checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleItemSelected(item.id)
          }}
          title={isChecked ? '取消選取' : '選取此圖片（可複選）'}
          className={`absolute top-2 left-2 z-20 h-5 w-5 rounded-md border flex items-center justify-center transition ${
            isChecked
              ? 'bg-indigo-500 border-indigo-500 text-white'
              : 'bg-zinc-900/70 border-zinc-500 text-transparent hover:border-indigo-400'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
        </button>

        {/* Top-left Status Badge */}
        <div className="absolute top-2 left-9 z-10">{getStatusBadge()}</div>

        {/* Custom prompt indicator */}
        {item.customPrompt && (
          <div
            title={`自訂 Prompt: ${item.customPrompt}`}
            className="absolute bottom-2 left-2 z-10 px-1.5 py-0.5 rounded bg-indigo-600/80 text-white text-[10px] flex items-center gap-1"
          >
            <Sparkles className="w-2.5 h-2.5" />
            專屬提示詞
          </div>
        )}

        {/* Top-right Hover Quick Actions */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {item.savedFilePath && (
            <button
              onClick={() => window.electronAPI.openPathInExplorer(item.savedFilePath!)}
              title="在檔案總管中顯示輸出圖片"
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
          )}

          {(item.status === 'failed' || item.status === 'cancelled' || item.status === 'completed') && (
            <button
              onClick={() => retrySingleItem(item.id)}
              title="重新生成此圖片"
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-indigo-600 text-zinc-200 border border-zinc-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {isActive ? (
            <button
              onClick={() => cancelItem(item.id)}
              title="取消此任務"
              className="p-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-600 text-rose-200 border border-rose-700"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => removeItem(item.id)}
              title="從清單移除"
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-rose-600 text-zinc-300 hover:text-white border border-zinc-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Active Progress Bar Overlay */}
        {isActive && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-950/80">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${Math.max(8, item.progress)}%` }}
            />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 flex flex-col gap-0.5">
        <div className="text-xs font-medium text-zinc-200 truncate" title={item.sourceFileName}>
          {item.sourceFileName}
        </div>
        {item.errorMessage ? (
          <div className="text-[11px] text-rose-400 truncate" title={item.errorMessage}>
            {item.errorMessage}
          </div>
        ) : (
          <div className="text-[10px] text-zinc-500 flex items-center justify-between gap-2">
            <span>{item.status === 'completed' ? 'AI 已輸出' : '原始輸入圖'}</span>
            <span className="flex items-center gap-1.5 shrink-0">
              {costLabel && (
                <span
                  title={
                    item.apiCostIsEstimated
                      ? `fal.ai 預估費用（${item.apiCostCurrency ?? 'USD'}）：API Key 無帳務權限或帳務尚未入帳時以歷史均價估算`
                      : `fal.ai 實際扣款金額（${item.apiCostCurrency ?? 'USD'}）`
                  }
                  className={`px-1.5 py-0.5 rounded font-mono ${
                    item.apiCostIsEstimated
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {costLabel}
                </span>
              )}
              {item.completedAt && item.startedAt && (
                <span>{((item.completedAt - item.startedAt) / 1000).toFixed(1)}s</span>
              )}
            </span>
          </div>
        )}
      </div>
      </div>
      {menuState && <BatchItemContextMenu state={menuState} onClose={closeMenu} />}
    </>
  )
}

