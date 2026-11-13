import { describe, expect, it } from 'vitest'
import { deriveWorkflowStageStates } from '../src/renderer/src/components/workflow/workflowTypes'
import { BatchItem } from '../src/shared/types'

const baseItem: BatchItem = {
  id: 'wf-1',
  sourceFilePath: '/tmp/test.png',
  sourceFileName: 'test.png',
  sourcePreviewUrl: 'local-media://image?path=/tmp/test.png',
  status: 'idle',
  progress: 0
}

describe('deriveWorkflowStageStates', () => {
  it('maps uploading status to active PreProcessNode and animated first edge', () => {
    const state = deriveWorkflowStageStates({
      ...baseItem,
      status: 'uploading',
      progress: 20
    })

    expect(state.inputStatus).toBe('success')
    expect(state.preProcessStatus).toBe('active')
    expect(state.falApiStatus).toBe('pending')
    expect(state.outputStatus).toBe('pending')
    expect(state.edgeInputToPreAnimated).toBe(true)
    expect(state.edgePreToFalAnimated).toBe(false)
  })

  it('maps processing status to active FalApiNode and animated edges', () => {
    const midProcessing = deriveWorkflowStageStates({
      ...baseItem,
      status: 'processing',
      progress: 55
    })
    expect(midProcessing.preProcessStatus).toBe('success')
    expect(midProcessing.falApiStatus).toBe('active')
    expect(midProcessing.edgePreToFalAnimated).toBe(true)
    expect(midProcessing.edgeFalToOutputAnimated).toBe(false)

    const savingStage = deriveWorkflowStageStates({
      ...baseItem,
      status: 'processing',
      progress: 92
    })
    expect(savingStage.outputStatus).toBe('active')
    expect(savingStage.edgeFalToOutputAnimated).toBe(true)
  })

  it('maps completed status to all success nodes and stops edge animations', () => {
    const done = deriveWorkflowStageStates({
      ...baseItem,
      status: 'completed',
      progress: 100
    })
    expect(done.inputStatus).toBe('success')
    expect(done.preProcessStatus).toBe('success')
    expect(done.falApiStatus).toBe('success')
    expect(done.outputStatus).toBe('success')
    expect(done.edgeInputToPreAnimated).toBe(false)
    expect(done.edgePreToFalAnimated).toBe(false)
    expect(done.edgeFalToOutputAnimated).toBe(false)
  })
})

