import { BatchItem, GenerationConfig } from '@shared/types'

export type WorkflowNodeStatus = 'pending' | 'active' | 'success' | 'error'

export interface BaseWorkflowNodeData extends Record<string, unknown> {
  status: WorkflowNodeStatus
  title: string
  subtitle?: string
}

export interface InputNodeData extends BaseWorkflowNodeData {
  fileName: string
  filePath: string
  previewUrl?: string
  customPrompt?: string
}

export interface PreProcessNodeData extends BaseWorkflowNodeData {
  stepLabel: string
  remoteUrl?: string
  progress: number
  errorMessage?: string
}

export interface FalApiNodeData extends BaseWorkflowNodeData {
  endpointId: string
  prompt: string
  progress: number
  queuePosition?: number
  strength: number
  steps: number
  guidanceScale: number
  logs: string[]
  errorMessage?: string
}

export interface OutputNodeData extends BaseWorkflowNodeData {
  outputPreviewUrl?: string
  savedFilePath?: string
  outputFormat: string
  durationSec?: string
  stepNumber?: number
  errorMessage?: string
}

export interface UpscaleNodeData extends BaseWorkflowNodeData {
  /** 放大倍率（2 或 4） */
  factor: number
}

/** 通用後處理功能節點（去背 / 縮放 / 臉部修復共用） */
export interface FeatureNodeData extends BaseWorkflowNodeData {
  stepNumber: number
  subtitle: string
  detail: string
}

export function getNodeStatusStyles(status: WorkflowNodeStatus): {
  border: string
  badgeBg: string
  badgeText: string
  label: string
  glow: string
} {
  switch (status) {
    case 'active':
      return {
        border: 'border-indigo-500 ring-2 ring-indigo-500/40',
        badgeBg: 'bg-indigo-500/20 border-indigo-500/40',
        badgeText: 'text-indigo-300',
        label: '執行中 (Active)',
        glow: 'shadow-[0_0_30px_-4px_rgba(99,102,241,0.5)]'
      }
    case 'success':
      return {
        border: 'border-emerald-500/70',
        badgeBg: 'bg-emerald-500/20 border-emerald-500/40',
        badgeText: 'text-emerald-300',
        label: '完成 (Success)',
        glow: 'shadow-[0_0_20px_-6px_rgba(16,185,129,0.35)]'
      }
    case 'error':
      return {
        border: 'border-rose-500/80 ring-1 ring-rose-500/30',
        badgeBg: 'bg-rose-500/20 border-rose-500/40',
        badgeText: 'text-rose-300',
        label: '錯誤 (Error)',
        glow: 'shadow-[0_0_24px_-4px_rgba(244,63,94,0.4)]'
      }
    default:
      return {
        border: 'border-zinc-800',
        badgeBg: 'bg-zinc-800/80 border-zinc-700',
        badgeText: 'text-zinc-400',
        label: '等待中 (Pending)',
        glow: 'shadow-lg'
      }
  }
}

export interface DerivedWorkflowStageStates {
  inputStatus: WorkflowNodeStatus
  preProcessStatus: WorkflowNodeStatus
  falApiStatus: WorkflowNodeStatus
  outputStatus: WorkflowNodeStatus
  edgeInputToPreAnimated: boolean
  edgePreToFalAnimated: boolean
  edgeFalToOutputAnimated: boolean
}

export function deriveWorkflowStageStates(item: BatchItem | null): DerivedWorkflowStageStates {
  if (!item) {
    return {
      inputStatus: 'pending',
      preProcessStatus: 'pending',
      falApiStatus: 'pending',
      outputStatus: 'pending',
      edgeInputToPreAnimated: false,
      edgePreToFalAnimated: false,
      edgeFalToOutputAnimated: false
    }
  }

  switch (item.status) {
    case 'idle':
      return {
        inputStatus: 'success',
        preProcessStatus: 'pending',
        falApiStatus: 'pending',
        outputStatus: 'pending',
        edgeInputToPreAnimated: false,
        edgePreToFalAnimated: false,
        edgeFalToOutputAnimated: false
      }
    case 'uploading':
      return {
        inputStatus: 'success',
        preProcessStatus: 'active',
        falApiStatus: 'pending',
        outputStatus: 'pending',
        edgeInputToPreAnimated: true,
        edgePreToFalAnimated: false,
        edgeFalToOutputAnimated: false
      }
    case 'queued':
      return {
        inputStatus: 'success',
        preProcessStatus: 'success',
        falApiStatus: 'active',
        outputStatus: 'pending',
        edgeInputToPreAnimated: false,
        edgePreToFalAnimated: true,
        edgeFalToOutputAnimated: false
      }
    case 'processing': {
      const isSavingStage = item.progress >= 88
      return {
        inputStatus: 'success',
        preProcessStatus: 'success',
        falApiStatus: 'active',
        outputStatus: isSavingStage ? 'active' : 'pending',
        edgeInputToPreAnimated: false,
        edgePreToFalAnimated: !isSavingStage,
        edgeFalToOutputAnimated: isSavingStage
      }
    }
    case 'completed':
      return {
        inputStatus: 'success',
        preProcessStatus: 'success',
        falApiStatus: 'success',
        outputStatus: 'success',
        edgeInputToPreAnimated: false,
        edgePreToFalAnimated: false,
        edgeFalToOutputAnimated: false
      }
    case 'failed':
    case 'cancelled': {
      const uploadedOk = Boolean(item.remoteInputUrl)
      return {
        inputStatus: 'success',
        preProcessStatus: uploadedOk ? 'success' : 'error',
        falApiStatus: uploadedOk ? 'error' : 'pending',
        outputStatus: 'error',
        edgeInputToPreAnimated: false,
        edgePreToFalAnimated: false,
        edgeFalToOutputAnimated: false
      }
    }
  }
}

export function getEffectivePrompt(item: BatchItem | null, config: GenerationConfig): string {
  if (item?.customPrompt && item.customPrompt.trim()) {
    return item.customPrompt.trim()
  }
  return config.prompt
}

