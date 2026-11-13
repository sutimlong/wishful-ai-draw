import React, { useState } from 'react'
import {
  Check,
  CheckCheck,
  CheckSquare,
  Columns,
  Film,
  FolderOpen,
  ImagePlus,
  LayoutGrid,
  RotateCcw,
  Trash2,
  UploadCloud,
  Workflow
} from 'lucide-react'
import { FilterTab, useBatchStore } from '../store/useBatchStore'
import { BatchGridCard } from './BatchGridCard'
import { BatchItemContextMenu, useItemContextMenu } from './BatchItemContextMenu'
import { WorkflowGraph } from './workflow/WorkflowGraph'

type WorkspaceViewMode = 'split' | 'workflow' | 'grid'

export const BatchWorkspace: React.FC = () => {
  const items = useBatchStore((s) => s.items)
  const selectedItemId = useBatchStore((s) => s.selectedItemId)
  const selectItem = useBatchStore((s) => s.selectItem)
  const filterTab = useBatchStore((s) => s.filterTab)
  const setFilterTab = useBatchStore((s) => s.setFilterTab)
  const importImagesDialog = useBatchStore((s) => s.importImagesDialog)
  const importFolderDialog = useBatchStore((s) => s.importFolderDialog)
  const openVideoDialog = useBatchStore((s) => s.openVideoDialog)
  const importDroppedFiles = useBatchStore((s) => s.importDroppedFiles)
  const clearCompleted = useBatchStore((s) => s.clearCompleted)
  const clearAll = useBatchStore((s) => s.clearAll)
  const retryFailed = useBatchStore((s) => s.retryFailed)
  const selectedItemIds = useBatchStore((s) => s.selectedItemIds)
  const toggleItemSelected = useBatchStore((s) => s.toggleItemSelected)
  const setSelectedItemIds = useBatchStore((s) => s.setSelectedItemIds)
  const clearSelection = useBatchStore((s) => s.clearSelection)
  const removeItems = useBatchStore((s) => s.removeItems)

  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>('split')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const confirmTimerRef = React.useRef<number | null>(null)
  const { state: listMenu, open: openListMenu, close: closeListMenu } = useItemContextMenu()

  const filteredItems = items.filter((item) => {
    if (filterTab === 'all') return true
    if (filterTab === 'idle') return item.status === 'idle'
    if (filterTab === 'active')
      return (
        item.status === 'uploading' || item.status === 'queued' || item.status === 'processing'
      )
    if (filterTab === 'completed') return item.status === 'completed'
    if (filterTab === 'failed') return item.status === 'failed' || item.status === 'cancelled'
    return true
  })

  const counts = {
    all: items.length,
    idle: items.filter((i) => i.status === 'idle').length,
    active: items.filter(
      (i) => i.status === 'uploading' || i.status === 'queued' || i.status === 'processing'
    ).length,
    completed: items.filter((i) => i.status === 'completed').length,
    failed: items.filter((i) => i.status === 'failed' || i.status === 'cancelled').length
  }

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await importDroppedFiles(e.dataTransfer.files)
    }
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: counts.all },
    { key: 'idle', label: '等待中', count: counts.idle },
    { key: 'active', label: '處理中', count: counts.active },
    { key: 'completed', label: '已完成', count: counts.completed },
    { key: 'failed', label: '失敗/取消', count: counts.failed }
  ]

  const selectedCount = selectedItemIds.length
  const allVisibleSelected =
    filteredItems.length > 0 && filteredItems.every((i) => selectedItemIds.includes(i.id))

  const handleToggleSelectAll = (): void => {
    if (allVisibleSelected) {
      setSelectedItemIds(selectedItemIds.filter((id) => !filteredItems.some((i) => i.id === id)))
    } else {
      setSelectedItemIds(
        Array.from(new Set([...selectedItemIds, ...filteredItems.map((i) => i.id)]))
      )
    }
  }

  const handleDeleteSelected = async (): Promise<void> => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current)
      confirmTimerRef.current = window.setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current)
    confirmTimerRef.current = null
    setConfirmDelete(false)
    await removeItems(selectedItemIds)
  }

  return (
    <main
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative"
    >
      {/* Drag & Drop Full Overlay */}
      {isDragging && (
        <div className="absolute inset-3 z-40 rounded-2xl border-2 border-dashed border-indigo-500 bg-indigo-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 pointer-events-none">
          <UploadCloud className="w-12 h-12 text-indigo-400 animate-bounce" />
          <div className="text-base font-bold text-white">放開滑鼠以批量匯入圖片或資料夾</div>
          <div className="text-xs text-indigo-300">支援 PNG, JPG, JPEG, WebP</div>
        </div>
      )}

      {/* Workspace Action Toolbar */}
      <div className="px-4 py-2.5 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 bg-zinc-900/30">
        {/* Left: Import Buttons + Filter Tabs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              onClick={importImagesDialog}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              新增圖片
            </button>
            <button
              onClick={importFolderDialog}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              匯入資料夾
            </button>
            <button
              onClick={openVideoDialog}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-200 text-xs font-medium border border-violet-500/40 transition"
              title="匯入影片並以 8 fps 擷取序列影像"
            >
              <Film className="w-3.5 h-3.5 text-violet-400" />
              匯入影片 (8fps)
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Filter Tabs */}
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
                  filterTab === tab.key
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterTab === tab.key
                      ? 'bg-indigo-600/30 text-indigo-300'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: View Mode Switcher & Cleanup Actions */}
        <div className="flex items-center gap-2 text-xs">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setViewMode('split')}
              title="左側圖片列表 + 右側 AI 節點工作流畫布"
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'split'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              列表 + 節點流
            </button>
            <button
              onClick={() => setViewMode('workflow')}
              title="全畫面 AI 節點工作流畫布 (@xyflow/react)"
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'workflow'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              節點畫布
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="傳統網格卡片畫廊"
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              網格畫廊
            </button>
          </div>

          {items.length > 0 && (
            <>
              <div className="h-4 w-px bg-zinc-800" />
              {counts.failed > 0 && (
                <button
                  onClick={retryFailed}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  重試 ({counts.failed})
                </button>
              )}
              {counts.completed > 0 && (
                <button
                  onClick={clearCompleted}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  清除完成
                </button>
              )}
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-800 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清空
              </button>
            </>
          )}
        </div>
      </div>

      {/* Multi-select Action Bar */}
      {selectedCount > 0 && (
        <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-500/30 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <CheckSquare className="w-4 h-4" />
            已選取 <strong className="font-mono">{selectedCount}</strong> 張圖片
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSelectAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs border border-zinc-700 transition"
            >
              {allVisibleSelected ? '取消全選' : '全選目前篩選'}
            </button>
            <button
              onClick={clearSelection}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-700 transition"
            >
              清除選取
            </button>
            <button
              onClick={() => void handleDeleteSelected()}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                confirmDelete
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
                  : 'bg-rose-950/60 hover:bg-rose-900 text-rose-200 border-rose-700/60'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmDelete ? `確認刪除 ${selectedCount} 張？` : `刪除所選 (${selectedCount})`}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area based on ViewMode */}
      {viewMode === 'workflow' ? (
        <div className="flex-1 overflow-hidden">
          <WorkflowGraph />
        </div>
      ) : viewMode === 'split' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Batch Queue List */}
          <div className="w-64 shrink-0 border-r border-zinc-800/80 bg-zinc-900/30 overflow-y-auto p-3 space-y-2">
            <div className="text-[11px] font-semibold text-zinc-400 px-1 flex items-center justify-between">
              <span>批次圖片佇列 ({filteredItems.length})</span>
              <span className="text-[10px] text-zinc-500">點擊切換節點圖</span>
            </div>

            {items.length === 0 ? (
              <div className="p-5 rounded-xl border border-dashed border-zinc-800 text-center space-y-2">
                <UploadCloud className="w-6 h-6 text-indigo-400 mx-auto" />
                <div className="text-xs text-zinc-400">拖曳或點擊「新增圖片」開始</div>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItemId === item.id
                const isChecked = selectedItemIds.includes(item.id)
                const isActive =
                  item.status === 'uploading' ||
                  item.status === 'queued' ||
                  item.status === 'processing'
                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) {
                        toggleItemSelected(item.id)
                        return
                      }
                      selectItem(item.id)
                    }}
                    onContextMenu={(e) => openListMenu(e, item)}
                    className={`p-2 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                      isSelected || isChecked
                        ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/40'
                        : 'bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleItemSelected(item.id)
                      }}
                      title={isChecked ? '取消選取' : '選取此圖片（可複選）'}
                      className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition ${
                        isChecked
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'border-zinc-600 text-transparent hover:border-indigo-400'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <img
                      src={
                        item.sourcePreviewUrl.startsWith('local-media://')
                          ? `${item.sourcePreviewUrl}&thumb=1`
                          : item.sourcePreviewUrl
                      }
                      alt={item.sourceFileName}
                      className="w-11 h-11 rounded-lg object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-xs font-medium text-zinc-200 truncate">
                        {item.sourceFileName}
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span
                          className={
                            item.status === 'completed'
                              ? 'text-emerald-400'
                              : item.status === 'failed'
                                ? 'text-rose-400'
                                : isActive
                                  ? 'text-indigo-400 font-semibold'
                                  : 'text-zinc-500'
                          }
                        >
                          {item.status.toUpperCase()}
                        </span>
                        {isActive && (
                          <span className="font-mono text-indigo-300">{item.progress}%</span>
                        )}
                      </div>
                      {isActive && (
                        <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${Math.max(10, item.progress)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right: Live Node-Based Workflow Graph */}
          <div className="flex-1 overflow-hidden">
            <WorkflowGraph />
          </div>
        </div>
      ) : (
        /* Grid Mode */
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="h-full min-h-[360px] border-2 border-dashed border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-zinc-200 mb-1">
                拖曳圖片或資料夾至此處開始批量處理
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mb-6">
                支援一次匯入數十至數百張 PNG、JPG、JPEG、WebP 圖片，自動透過 fal.ai 高併發佇列處理並儲存至指定輸出目錄。
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={importImagesDialog}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-lg shadow-indigo-600/20"
                >
                  <ImagePlus className="w-4 h-4" />
                  選擇多張圖片
                </button>
                <button
                  onClick={importFolderDialog}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 transition"
                >
                  <FolderOpen className="w-4 h-4 text-indigo-400" />
                  匯入整個資料夾
                </button>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
              目前篩選分類下沒有對應的圖片項目。
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <BatchGridCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {listMenu && <BatchItemContextMenu state={listMenu} onClose={closeListMenu} />}
    </main>
  )
}
