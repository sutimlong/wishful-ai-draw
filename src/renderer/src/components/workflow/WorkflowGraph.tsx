import React, { useEffect, useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MarkerType,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState
} from '@xyflow/react'
import { Play, Workflow } from 'lucide-react'
import { useBatchStore } from '../../store/useBatchStore'
import { InputNode } from './nodes/InputNode'
import { PreProcessNode } from './nodes/PreProcessNode'
import { FalApiNode } from './nodes/FalApiNode'
import { UpscaleNode } from './nodes/UpscaleNode'
import { OutputNode } from './nodes/OutputNode'
import {
  deriveWorkflowStageStates,
  FalApiNodeData,
  getEffectivePrompt,
  InputNodeData,
  OutputNodeData,
  PreProcessNodeData,
  UpscaleNodeData,
  WorkflowNodeStatus
} from './workflowTypes'

const nodeTypes = {
  inputNode: InputNode,
  preProcessNode: PreProcessNode,
  falApiNode: FalApiNode,
  upscaleNode: UpscaleNode,
  outputNode: OutputNode
}

function getEdgeStrokeColor(sourceStatus: WorkflowNodeStatus, animated: boolean): string {
  if (animated) return '#818cf8' // glowing indigo
  if (sourceStatus === 'success') return '#10b981' // emerald
  if (sourceStatus === 'error') return '#f43f5e' // rose
  return '#3f3f46' // zinc-700
}

const initialNodePositions: Record<string, { x: number; y: number }> = {
  'node-input': { x: 40, y: 120 },
  'node-preprocess': { x: 360, y: 120 },
  'node-fal': { x: 680, y: 85 },
  'node-upscale': { x: 1020, y: 120 },
  'node-output': { x: 1060, y: 120 }
}

export const WorkflowGraph: React.FC = () => {
  const items = useBatchStore((s) => s.items)
  const selectedItemId = useBatchStore((s) => s.selectedItemId)
  const generationConfig = useBatchStore((s) => s.generationConfig)
  const retrySingleItem = useBatchStore((s) => s.retrySingleItem)

  // Pick selected item, or fallback to first active item, or first item in list
  const activeItem = useMemo(() => {
    if (selectedItemId) {
      const found = items.find((i) => i.id === selectedItemId)
      if (found) return found
    }
    const processingItem = items.find(
      (i) => i.status === 'uploading' || i.status === 'queued' || i.status === 'processing'
    )
    return processingItem || items[0] || null
  }, [items, selectedItemId])

  const stageStates = useMemo(() => deriveWorkflowStageStates(activeItem), [activeItem])

  const upscaleEnabled = generationConfig.upscaleEnabled
  // 放大節點狀態：以 engine 寫入的 upscaleStatus 為準（實際放大管線）
  const upscaleStatus: WorkflowNodeStatus = (() => {
    if (!activeItem) return 'pending'
    switch (activeItem.upscaleStatus) {
      case 'processing':
        return 'active'
      case 'completed':
        return 'success'
      case 'failed':
        return 'error'
      default:
        return 'pending'
    }
  })()

  const computedNodes: Node[] = useMemo(() => {
    const inputData: InputNodeData = {
      status: stageStates.inputStatus,
      title: 'Input',
      fileName: activeItem?.sourceFileName || '尚未選取圖片',
      filePath: activeItem?.sourceFilePath || '',
      previewUrl: activeItem?.sourcePreviewUrl,
      customPrompt: activeItem?.customPrompt
    }

    const preProcessData: PreProcessNodeData = {
      status: stageStates.preProcessStatus,
      title: 'PreProcess',
      stepLabel:
        stageStates.preProcessStatus === 'active'
          ? '正在讀取本地影像並上傳至 fal.storage...'
          : stageStates.preProcessStatus === 'success'
            ? '本地影像已成功編碼並取得雲端輸入 URL'
            : stageStates.preProcessStatus === 'error'
              ? '讀取或上傳影像時發生錯誤'
              : '等待啟動預處理與編碼上傳',
      remoteUrl: activeItem?.remoteInputUrl,
      progress: activeItem?.status === 'uploading' ? activeItem.progress : 0,
      errorMessage:
        stageStates.preProcessStatus === 'error' ? activeItem?.errorMessage : undefined
    }

    const falApiData: FalApiNodeData = {
      status: stageStates.falApiStatus,
      title: 'Fal.ai API',
      endpointId: generationConfig.endpointId,
      prompt: getEffectivePrompt(activeItem, generationConfig),
      progress: activeItem?.progress || 0,
      queuePosition: activeItem?.queuePosition,
      strength: generationConfig.strength,
      steps: generationConfig.numInferenceSteps,
      guidanceScale: generationConfig.guidanceScale,
      logs: activeItem?.logs || [],
      errorMessage: stageStates.falApiStatus === 'error' ? activeItem?.errorMessage : undefined
    }

    const durationSec =
      activeItem?.completedAt && activeItem?.startedAt
        ? ((activeItem.completedAt - activeItem.startedAt) / 1000).toFixed(1)
        : undefined

    const outputData: OutputNodeData = {
      status: stageStates.outputStatus,
      title: 'Output',
      outputPreviewUrl: activeItem?.savedPreviewUrl || activeItem?.outputImageUrl,
      savedFilePath: activeItem?.savedFilePath,
      outputFormat: generationConfig.outputFormat,
      durationSec,
      stepNumber: upscaleEnabled ? 5 : 4,
      errorMessage: stageStates.outputStatus === 'error' ? activeItem?.errorMessage : undefined
    }

    const upscaleData: UpscaleNodeData = {
      status: upscaleStatus,
      title: 'Upscale',
      factor: generationConfig.upscaleFactor
    }

    const nodes: Node[] = [
      {
        id: 'node-input',
        type: 'inputNode',
        position: initialNodePositions['node-input'],
        data: inputData
      },
      {
        id: 'node-preprocess',
        type: 'preProcessNode',
        position: initialNodePositions['node-preprocess'],
        data: preProcessData
      },
      {
        id: 'node-fal',
        type: 'falApiNode',
        position: initialNodePositions['node-fal'],
        data: falApiData
      }
    ]

    if (upscaleEnabled) {
      nodes.push({
        id: 'node-upscale',
        type: 'upscaleNode',
        position: initialNodePositions['node-upscale'],
        data: upscaleData
      })
    }

    nodes.push({
      id: 'node-output',
      type: 'outputNode',
      position: {
        x: upscaleEnabled ? 1300 : initialNodePositions['node-output'].x,
        y: initialNodePositions['node-output'].y
      },
      data: outputData
    })

    return nodes
  }, [activeItem, generationConfig, stageStates, upscaleEnabled, upscaleStatus])

  const computedEdges: Edge[] = useMemo(() => {
    const e1Color = getEdgeStrokeColor(
      stageStates.inputStatus,
      stageStates.edgeInputToPreAnimated
    )
    const e2Color = getEdgeStrokeColor(
      stageStates.preProcessStatus,
      stageStates.edgePreToFalAnimated
    )
    const e3Color = getEdgeStrokeColor(
      stageStates.falApiStatus,
      stageStates.edgeFalToOutputAnimated
    )
    const upscaleEdgeColor = getEdgeStrokeColor(upscaleStatus, false)

    const edges: Edge[] = [
      {
        id: 'e-input-pre',
        source: 'node-input',
        target: 'node-preprocess',
        animated: stageStates.edgeInputToPreAnimated,
        label: stageStates.edgeInputToPreAnimated ? '讀取編碼中...' : 'Image Stream',
        labelStyle: { fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#18181b', fillOpacity: 0.85 },
        style: {
          stroke: e1Color,
          strokeWidth: stageStates.edgeInputToPreAnimated ? 3 : 2
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: e1Color }
      },
      {
        id: 'e-pre-fal',
        source: 'node-preprocess',
        target: 'node-fal',
        animated: stageStates.edgePreToFalAnimated,
        label: stageStates.edgePreToFalAnimated ? 'API 推論傳輸中...' : 'fal.storage URL',
        labelStyle: { fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#18181b', fillOpacity: 0.85 },
        style: {
          stroke: e2Color,
          strokeWidth: stageStates.edgePreToFalAnimated ? 3 : 2
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: e2Color }
      }
    ]

    if (upscaleEnabled) {
      edges.push(
        {
          id: 'e-fal-upscale',
          source: 'node-fal',
          target: 'node-upscale',
          animated: false,
          label: 'Generated Image',
          labelStyle: { fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' },
          labelBgStyle: { fill: '#18181b', fillOpacity: 0.85 },
          style: { stroke: e3Color, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: e3Color }
        },
        {
          id: 'e-upscale-output',
          source: 'node-upscale',
          target: 'node-output',
          animated: false,
          label: `${generationConfig.upscaleFactor}x 放大`,
          labelStyle: { fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' },
          labelBgStyle: { fill: '#18181b', fillOpacity: 0.85 },
          style: { stroke: upscaleEdgeColor, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: upscaleEdgeColor }
        }
      )
    } else {
      edges.push({
        id: 'e-fal-output',
        source: 'node-fal',
        target: 'node-output',
        animated: stageStates.edgeFalToOutputAnimated,
        label: stageStates.edgeFalToOutputAnimated ? '寫入本地磁碟...' : 'Generated Image',
        labelStyle: { fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#18181b', fillOpacity: 0.85 },
        style: {
          stroke: e3Color,
          strokeWidth: stageStates.edgeFalToOutputAnimated ? 3 : 2
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: e3Color }
      })
    }

    return edges
  }, [stageStates, upscaleEnabled, upscaleStatus, generationConfig.upscaleFactor])

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges)

  // 節點位置為固定佈局（唯讀監控），只需同步節點資料與連線動畫狀態
  useEffect(() => {
    setNodes(computedNodes)
  }, [computedNodes, setNodes])

  useEffect(() => {
    setEdges(computedEdges)
  }, [computedEdges, setEdges])

  return (
    <div className="w-full h-full relative bg-zinc-950 overflow-hidden">
      {/* Top Floating Banner inside Canvas */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto px-3.5 py-2 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-lg flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
            <Workflow className="w-4 h-4" />
            <span>AI 節點工作流即時監控 (Node Pipeline)</span>
          </div>
          <div className="h-3.5 w-px bg-zinc-800" />
          {activeItem ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400">當前監控圖片：</span>
              <span className="font-semibold text-white truncate max-w-[200px]">
                {activeItem.sourceFileName}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono uppercase text-indigo-300">
                {activeItem.status} ({activeItem.progress}%)
              </span>
            </div>
          ) : (
            <span className="text-xs text-zinc-500">請先匯入並選擇一張圖片以檢視節點流程</span>
          )}
        </div>

        {activeItem && (
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => retrySingleItem(activeItem.id)}
              disabled={
                activeItem.status === 'uploading' ||
                activeItem.status === 'queued' ||
                activeItem.status === 'processing'
              }
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5" />
              單獨執行此圖片節點流
            </button>
          </div>
        )}
      </div>

      {/* Bottom Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none px-3 py-1.5 rounded-lg bg-zinc-900/85 border border-zinc-800 flex items-center gap-4 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-500" /> Pending (等待中)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" /> Active (執行中 + 動態流線)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Success (完成)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" /> Error (錯誤)
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        // 節點圖為唯讀監控面板：節點不可拖曳、不可連線、不可選取（仍可縮放與平移畫布）
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        minZoom={0.4}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#27272a" />
        <Controls className="!bg-zinc-900 !border-zinc-800 !rounded-xl !overflow-hidden [&>button]:!bg-zinc-900 [&>button]:!border-zinc-800 [&>button]:!text-zinc-300 hover:[&>button]:!bg-zinc-800" />
      </ReactFlow>
    </div>
  )
}
