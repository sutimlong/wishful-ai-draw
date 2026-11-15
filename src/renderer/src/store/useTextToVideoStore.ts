import { create } from 'zustand'
import { DEFAULT_IMAGE_TO_VIDEO_MODEL_ID } from '../../../shared/falImageToVideoModels'
import { DEFAULT_TEXT_TO_VIDEO_MODEL_ID } from '../../../shared/falTextToVideoModels'
import type {
  TextToImageChatMessage,
  TextToVideoAspect,
  TextToVideoFileEntry
} from '../../../shared/types'

export type TextToVideoMode = 'prompt' | 'chat'

export interface VideoChatTurn extends TextToImageChatMessage {
  id: string
  suggestedModelId?: string
  suggestedModelIds?: string[]
  generatedModelName?: string
  generatedPrompt?: string
  videoUrl?: string
  filePath?: string
  costUsd?: number
  costIsEstimated?: boolean
}

export interface TextToVideoState {
  mode: TextToVideoMode
  prompt: string
  negativePrompt: string
  endpointId: string
  aspectId: TextToVideoAspect
  durationSeconds: number
  resolution: string
  generateAudio: boolean
  referenceImagePaths: string[]
  isGenerating: boolean
  isOptimizing: boolean
  error: string | null
  statusMessage: string | null
  lastCostUsd: number | undefined
  lastCostIsEstimated: boolean | undefined
  outputs: TextToVideoFileEntry[]
  chatMessages: VideoChatTurn[]
  chatLoading: boolean

  setMode: (mode: TextToVideoMode) => void
  setPrompt: (prompt: string) => void
  setNegativePrompt: (negativePrompt: string) => void
  setEndpointId: (endpointId: string) => void
  setAspectId: (aspectId: TextToVideoAspect) => void
  setDurationSeconds: (durationSeconds: number) => void
  setResolution: (resolution: string) => void
  setGenerateAudio: (generateAudio: boolean) => void
  setReferenceImagePaths: (paths: string[]) => void
  setIsGenerating: (isGenerating: boolean) => void
  setIsOptimizing: (isOptimizing: boolean) => void
  setError: (error: string | null) => void
  setStatusMessage: (statusMessage: string | null) => void
  setLastCost: (costUsd?: number, costIsEstimated?: boolean) => void
  setOutputs: (outputs: TextToVideoFileEntry[]) => void
  appendChatMessage: (msg: VideoChatTurn) => void
  setChatLoading: (loading: boolean) => void
  clearChat: () => void
}

function createVideoGenerationStore(defaultEndpointId: string) {
  return create<TextToVideoState>((set) => ({
    mode: 'prompt',
    prompt: '',
    negativePrompt: '',
    endpointId: defaultEndpointId,
    aspectId: '16:9',
    durationSeconds: 5,
    resolution: '720p',
    generateAudio: false,
    referenceImagePaths: [],
    isGenerating: false,
    isOptimizing: false,
    error: null,
    statusMessage: null,
    lastCostUsd: undefined,
    lastCostIsEstimated: undefined,
    outputs: [],
    chatMessages: [],
    chatLoading: false,

    setMode: (mode) => set({ mode }),
    setPrompt: (prompt) => set({ prompt }),
    setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
    setEndpointId: (endpointId) => set({ endpointId }),
    setAspectId: (aspectId) => set({ aspectId }),
    setDurationSeconds: (durationSeconds) => set({ durationSeconds }),
    setResolution: (resolution) => set({ resolution }),
    setGenerateAudio: (generateAudio) => set({ generateAudio }),
    setReferenceImagePaths: (referenceImagePaths) => set({ referenceImagePaths }),
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    setIsOptimizing: (isOptimizing) => set({ isOptimizing }),
    setError: (error) => set({ error }),
    setStatusMessage: (statusMessage) => set({ statusMessage }),
    setLastCost: (lastCostUsd, lastCostIsEstimated) => set({ lastCostUsd, lastCostIsEstimated }),
    setOutputs: (outputs) => set({ outputs }),
    appendChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
    setChatLoading: (chatLoading) => set({ chatLoading }),
    clearChat: () => set({ chatMessages: [] })
  }))
}

export const useTextToVideoStore = createVideoGenerationStore(DEFAULT_TEXT_TO_VIDEO_MODEL_ID)

export const useImageToVideoStore = createVideoGenerationStore(DEFAULT_IMAGE_TO_VIDEO_MODEL_ID)
