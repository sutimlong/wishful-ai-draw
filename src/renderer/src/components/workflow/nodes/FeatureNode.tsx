import React from 'react'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'
import { FeatureNodeData, getNodeStatusStyles, WorkflowNodeStatus } from '../workflowTypes'

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

/** 通用後處理功能節點：去背 / 縮放 / 臉部修復共用此元件。 */
export const FeatureNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as FeatureNodeData
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

      <div className="px-3.5 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-xs font-bold text-zinc-100">
            {nodeData.stepNumber}. {nodeData.title}
          </div>
          <div className="text-[10px] text-zinc-500 truncate">{nodeData.subtitle}</div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${styles.badgeBg} ${styles.badgeText}`}
        >
          {renderStatusIcon(nodeData.status)}
        </span>
      </div>

      <div className="p-3.5">
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed">
          {nodeData.detail}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-violet-500 !border-2 !border-zinc-950"
      />
    </div>
  )
}
