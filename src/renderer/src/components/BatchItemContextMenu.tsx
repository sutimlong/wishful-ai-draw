import React, { useCallback, useState } from 'react'
import { Copy, Eye, FolderOpen, RotateCcw, Trash2, XCircle } from 'lucide-react'
import { BatchItem } from '@shared/types'
import { useBatchStore } from '../store/useBatchStore'
import { ContextMenu, ContextMenuItem } from './ContextMenu'
import { formatItemCost } from '../utils/cost'

export interface ItemContextMenuState {
  x: number
  y: number
  item: BatchItem
}

/** 批次項目右鍵選單的開啟/關閉狀態（在每個元件內各建立一份 instance）。 */
export function useItemContextMenu(): {
  state: ItemContextMenuState | null
  open: (e: React.MouseEvent, item: BatchItem) => void
  close: () => void
} {
  const [state, setState] = useState<ItemContextMenuState | null>(null)

  const open = useCallback((e: React.MouseEvent, item: BatchItem) => {
    e.preventDefault()
    e.stopPropagation()
    setState({ x: e.clientX, y: e.clientY, item })
  }, [])

  const close = useCallback(() => setState(null), [])

  return { state, open, close }
}

interface Props {
  state: ItemContextMenuState
  onClose: () => void
}

/** 依項目狀態與可用資料動態產生選單項目，並處理「刪除」的取消流程。 */
export const BatchItemContextMenu: React.FC<Props> = ({ state, onClose }) => {
  const selectItem = useBatchStore((s) => s.selectItem)
  const cancelItem = useBatchStore((s) => s.cancelItem)
  const retrySingleItem = useBatchStore((s) => s.retrySingleItem)
  const removeItem = useBatchStore((s) => s.removeItem)

  const { item } = state
  const isActive =
    item.status === 'uploading' || item.status === 'queued' || item.status === 'processing'
  const costLabel = formatItemCost(item)

  const handleDelete = async (): Promise<void> => {
    // 進行中的任務須先通知 main 端中止，避免前端移除後 main 仍在生成（看不到卻繼續扣費）
    if (isActive) {
      await cancelItem(item.id)
    }
    removeItem(item.id)
  }

  const items: ContextMenuItem[] = [
    {
      label: '選取並檢視詳細',
      icon: <Eye className="w-3.5 h-3.5 shrink-0" />,
      onClick: () => selectItem(item.id)
    }
  ]

  if (item.savedFilePath) {
    items.push({
      label: '開啟輸出檔案位置',
      icon: <FolderOpen className="w-3.5 h-3.5 shrink-0" />,
      onClick: () => void window.electronAPI.openPathInExplorer(item.savedFilePath!)
    })
  }

  if (item.requestId) {
    items.push({
      label: '複製 Request ID',
      icon: <Copy className="w-3.5 h-3.5 shrink-0" />,
      onClick: () => void navigator.clipboard.writeText(item.requestId!)
    })
  }

  if (costLabel) {
    items.push({
      label: `複製 API 費用（${costLabel}）`,
      icon: <Copy className="w-3.5 h-3.5 shrink-0" />,
      onClick: () => void navigator.clipboard.writeText(costLabel)
    })
  }

  if (isActive) {
    items.push({
      label: '取消此任務',
      icon: <XCircle className="w-3.5 h-3.5 shrink-0" />,
      onClick: () => void cancelItem(item.id)
    })
  } else if (
    item.status === 'failed' ||
    item.status === 'cancelled' ||
    item.status === 'completed'
  ) {
    items.push({
      label: '重新生成此圖片',
      icon: <RotateCcw className="w-3.5 h-3.5 shrink-0" />,
      onClick: () => void retrySingleItem(item.id)
    })
  }

  items.push({ separator: true })
  items.push({
    label: '刪除',
    icon: <Trash2 className="w-3.5 h-3.5 shrink-0" />,
    danger: true,
    onClick: () => void handleDelete()
  })

  return <ContextMenu x={state.x} y={state.y} items={items} onClose={onClose} />
}
