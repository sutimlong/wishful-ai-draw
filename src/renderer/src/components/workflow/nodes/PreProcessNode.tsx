import React from 'react'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { CheckCircle2, Clock, CloudUpload, FileCode2, Loader2, XCircle } from 'lucide-react'
import { getNodeStatusStyles, PreProcessNodeData, WorkflowNodeStatus } from '../workflowTypes'

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

export const PreProcessNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as PreProcessNodeData
  const styles = getNodeStatusStyles(nodeData.status)

  return (
    <div
      className={`w-64 rounded-2xl bg-zinc-900/95 backdrop-blur-md border-2 transition-all duration-300 overflow-hidden ${styles.border} ${styles.glow}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-indigo-500 !border-2 !border-zinc-950"
      />

      {/* Header */}
      <div className="px-3.5 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
            <FileCode2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-100">2. 預處理節點 (PreProcess)</div>
            <div className="text-[10px] text-zinc-500">讀取編碼與雲端暫存上傳</div>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles.badgeBg} ${styles.badgeText}`}
        >
          {renderStatusIcon(nodeData.status)}
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-3 text-xs">
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <CloudUpload className="w-3.5 h-3.5 text-sky-400" />
              步驟狀態
            </span>
            <span className={`font-semibold ${styles.badgeText}`}>{styles.label}</span>
          </div>
          <div className="text-[11px] text-zinc-300 leading-relaxed">{nodeData.stepLabel}</div>
        </div>

        {/* Active Progress Bar */}
        {nodeData.status === 'active' && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-sky-300">
              <span>正在讀取並編碼上傳...</span>
              <span>{nodeData.progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-950 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300 animate-pulse"
                style={{ width: `${Math.max(20, nodeData.progress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Remote URL badge when uploaded */}
        {nodeData.remoteUrl && (
          <div className="px-2.5 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono truncate">
            ✓ URL: {nodeData.remoteUrl}
          </div>
        )}

        {nodeData.errorMessage && nodeData.status === 'error' && (
          <div className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-[10px] text-rose-300 break-words">
            {nodeData.errorMessage}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-sky-500 !border-2 !border-zinc-950"
      />
    </div>
  )
}

