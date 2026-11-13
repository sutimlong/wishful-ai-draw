import React from 'react'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { CheckCircle2, Clock, Cpu, Loader2, Sparkles, Terminal, XCircle } from 'lucide-react'
import { FalApiNodeData, getNodeStatusStyles, WorkflowNodeStatus } from '../workflowTypes'

function renderStatusIcon(status: WorkflowNodeStatus): React.ReactElement {
  switch (status) {
    case 'active':
      return <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-300" />
    case 'success':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    case 'error':
      return <XCircle className="w-3.5 h-3.5 text-rose-400" />
    default:
      return <Clock className="w-3.5 h-3.5 text-zinc-500" />
  }
}

export const FalApiNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as FalApiNodeData
  const styles = getNodeStatusStyles(nodeData.status)
  const isActive = nodeData.status === 'active'

  return (
    <div
      className={`w-80 rounded-2xl bg-zinc-900/95 backdrop-blur-md border-2 transition-all duration-300 overflow-hidden ${
        isActive
          ? 'border-indigo-400 ring-4 ring-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.55)]'
          : `${styles.border} ${styles.glow}`
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-sky-500 !border-2 !border-zinc-950"
      />

      {/* Header */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between ${
          isActive
            ? 'bg-gradient-to-r from-indigo-950/90 via-violet-950/80 to-zinc-950 border-indigo-500/40'
            : 'bg-zinc-950/80 border-zinc-800/80'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg ${
              isActive
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 animate-pulse'
                : 'bg-violet-500/15 text-violet-400'
            }`}
          >
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              3. AI 運算節點 (Fal.ai API)
              {isActive && <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-bounce" />}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[170px]">
              {nodeData.endpointId}
            </div>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles.badgeBg} ${styles.badgeText}`}
        >
          {renderStatusIcon(nodeData.status)}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 text-xs">
        {/* Active glowing spinner banner */}
        {isActive && (
          <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-200 text-[11px] font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
              <span>
                {nodeData.queuePosition && nodeData.queuePosition > 0
                  ? `雲端佇列排隊中 (#${nodeData.queuePosition})...`
                  : 'GPU 正在執行擴散模型推論...'}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-300">
              {nodeData.progress}%
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 w-full rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                nodeData.status === 'success'
                  ? 'bg-emerald-500'
                  : nodeData.status === 'error'
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500'
              }`}
              style={{
                width: `${
                  nodeData.status === 'success'
                    ? 100
                    : nodeData.status === 'active'
                      ? Math.max(15, nodeData.progress)
                      : 0
                }%`
              }}
            />
          </div>
        </div>

        {/* Parameter Badges */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <div className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
            <div className="text-zinc-500">Strength</div>
            <div className="font-mono font-semibold text-zinc-200">
              {nodeData.strength.toFixed(2)}
            </div>
          </div>
          <div className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
            <div className="text-zinc-500">Steps</div>
            <div className="font-mono font-semibold text-zinc-200">{nodeData.steps}</div>
          </div>
          <div className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
            <div className="text-zinc-500">CFG</div>
            <div className="font-mono font-semibold text-zinc-200">
              {nodeData.guidanceScale.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Prompt snippet */}
        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-0.5">
          <div className="text-[10px] text-zinc-500">套用提示詞 (Effective Prompt):</div>
          <div className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
            {nodeData.prompt || '(未設定提示詞)'}
          </div>
        </div>

        {/* Live Logs */}
        {nodeData.logs && nodeData.logs.length > 0 && (
          <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-zinc-400 space-y-0.5 max-h-20 overflow-y-auto">
            <div className="flex items-center gap-1 text-indigo-400 mb-0.5">
              <Terminal className="w-3 h-3" />
              <span>即時推論日誌</span>
            </div>
            {nodeData.logs.slice(-3).map((log, i) => (
              <div key={i} className="truncate">
                {log}
              </div>
            ))}
          </div>
        )}

        {nodeData.errorMessage && nodeData.status === 'error' && (
          <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/40 text-[10px] text-rose-300 break-words">
            ⚠️ {nodeData.errorMessage}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-violet-500 !border-2 !border-zinc-950"
      />
    </div>
  )
}

