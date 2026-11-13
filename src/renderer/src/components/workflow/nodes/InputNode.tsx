import React from 'react'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { CheckCircle2, Clock, FileImage, Loader2, Sparkles, XCircle } from 'lucide-react'
import { getNodeStatusStyles, InputNodeData, WorkflowNodeStatus } from '../workflowTypes'

function renderStatusIcon(status: WorkflowNodeStatus): React.ReactElement {
  switch (status) {
    case 'active':
      return <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
    case 'success':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    case 'error':
      return <XCircle className="w-3.5 h-3.5 text-rose-400" />
    default:
      return <Clock className="w-3.5 h-3.5 text-zinc-500" />
  }
}

export const InputNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as InputNodeData
  const styles = getNodeStatusStyles(nodeData.status)

  return (
    <div
      className={`w-64 rounded-2xl bg-zinc-900/95 backdrop-blur-md border-2 transition-all duration-300 overflow-hidden ${styles.border} ${styles.glow}`}
    >
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
            <FileImage className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-100">1. 輸入節點 (Input)</div>
            <div className="text-[10px] text-zinc-500">本地原始影像載入</div>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles.badgeBg} ${styles.badgeText}`}
        >
          {renderStatusIcon(nodeData.status)}
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2.5">
        <div className="aspect-video w-full rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center relative">
          {nodeData.previewUrl ? (
            <img
              src={nodeData.previewUrl}
              alt={nodeData.fileName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[11px] text-zinc-600">尚未選取圖片</span>
          )}
          {nodeData.customPrompt && (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-indigo-600/90 text-white text-[9px] flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              自訂 Prompt
            </span>
          )}
        </div>

        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-zinc-200 truncate" title={nodeData.fileName}>
            {nodeData.fileName || '未選擇檔案'}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono truncate" title={nodeData.filePath}>
            {nodeData.filePath || '請從左側清單點選圖片'}
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-indigo-500 !border-2 !border-zinc-950"
      />
    </div>
  )
}

