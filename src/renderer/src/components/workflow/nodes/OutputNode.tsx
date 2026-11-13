import React from 'react'
import { Handle, NodeProps, Position } from '@xyflow/react'
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  HardDriveDownload,
  Loader2,
  XCircle
} from 'lucide-react'
import { getNodeStatusStyles, OutputNodeData, WorkflowNodeStatus } from '../workflowTypes'

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

export const OutputNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as OutputNodeData
  const styles = getNodeStatusStyles(nodeData.status)

  return (
    <div
      className={`w-64 rounded-2xl bg-zinc-900/95 backdrop-blur-md border-2 transition-all duration-300 overflow-hidden ${styles.border} ${styles.glow}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-zinc-950"
      />

      {/* Header */}
      <div className="px-3.5 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
            <HardDriveDownload className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-100">
              {nodeData.stepNumber ?? 4}. 輸出節點 (Output)
            </div>
            <div className="text-[10px] text-zinc-500">結果預覽與本地自動存檔</div>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles.badgeBg} ${styles.badgeText}`}
        >
          {renderStatusIcon(nodeData.status)}
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2.5 text-xs">
        <div className="aspect-video w-full rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center relative">
          {nodeData.outputPreviewUrl ? (
            <img
              src={nodeData.outputPreviewUrl}
              alt="AI Generated Output"
              className="w-full h-full object-cover"
            />
          ) : nodeData.status === 'active' ? (
            <div className="flex flex-col items-center gap-1.5 text-indigo-400">
              <Download className="w-5 h-5 animate-bounce" />
              <span className="text-[10px]">正在寫入磁碟...</span>
            </div>
          ) : (
            <span className="text-[11px] text-zinc-600">等待 AI 運算完成</span>
          )}

          {nodeData.durationSec && (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-600/90 text-white font-mono text-[9px]">
              {nodeData.durationSec}s
            </span>
          )}
        </div>

        {nodeData.savedFilePath ? (
          <div className="space-y-1.5">
            <div
              className="text-[10px] text-emerald-400 font-mono truncate"
              title={nodeData.savedFilePath}
            >
              ✓ 已儲存：{nodeData.savedFilePath.split(/[/\\]/).pop()}
            </div>
            <button
              onClick={() => window.electronAPI.openPathInExplorer(nodeData.savedFilePath!)}
              className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
            >
              <ExternalLink className="w-3 h-3" />
              在檔案總管開啟
            </button>
          </div>
        ) : (
          <div className="text-[10px] text-zinc-500 flex items-center justify-between">
            <span>目標格式：{nodeData.outputFormat.toUpperCase()}</span>
            <span>{nodeData.status === 'success' ? '已生成' : '尚未產生檔案'}</span>
          </div>
        )}
      </div>
    </div>
  )
}

