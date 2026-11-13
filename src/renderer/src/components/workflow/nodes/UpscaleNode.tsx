import React from 'react'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { CheckCircle2, Clock, Loader2, Maximize, XCircle } from 'lucide-react'
import { getNodeStatusStyles, UpscaleNodeData, WorkflowNodeStatus } from '../workflowTypes'

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

export const UpscaleNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as UpscaleNodeData
  const styles = getNodeStatusStyles(nodeData.status)

  return (
    <div
      className={`w-64 rounded-2xl bg-zinc-900/95 backdrop-blur-md border-2 transition-all duration-300 overflow-hidden ${styles.border} ${styles.glow}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-violet-500 !border-2 !border-zinc-950"
      />

      {/* Header */}
      <div className="px-3.5 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/15 text-violet-400">
            <Maximize className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-100">4. 放大圖片 (Upscale)</div>
            <div className="text-[10px] text-zinc-500">高清放大與細節增強</div>
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
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-400">放大倍率</span>
          <span className="font-mono font-bold text-violet-300">{nodeData.factor}x</span>
        </div>
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          使用 fal.ai 高清放大模型（Clarity Upscaler）將生成結果放大。
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-violet-500 !border-2 !border-zinc-950"
      />
    </div>
  )
}
