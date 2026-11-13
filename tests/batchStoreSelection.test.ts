import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BatchItem, TaskStatus } from '../src/shared/types'

/** 驗證批次佇列的「複選」狀態管理與「統一刪除所選」流程。 */

const electronAPI = {
  cancelBatchItem: vi.fn()
}

;(globalThis as unknown as Record<string, unknown>).window = { electronAPI }

function makeItem(id: string, status: TaskStatus = 'idle'): BatchItem {
  return {
    id,
    sourceFilePath: `/tmp/${id}.png`,
    sourceFileName: `${id}.png`,
    sourcePreviewUrl: `local-media://image?path=%2Ftmp%2F${id}.png`,
    status,
    progress: 0
  }
}

async function loadStore(items: BatchItem[]) {
  vi.resetModules()
  const mod = await import('../src/renderer/src/store/useBatchStore')
  mod.useBatchStore.setState({
    items: items.map((item) => ({ ...item })),
    selectedItemIds: [],
    selectedItemId: items[0]?.id ?? null
  })
  return mod.useBatchStore
}

describe('useBatchStore - 複選與批次刪除', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    electronAPI.cancelBatchItem.mockResolvedValue({ cancelledId: 'x' })
  })

  it('toggleItemSelected 可來回切換複選狀態，clearSelection 清空選取', async () => {
    const store = await loadStore([makeItem('a'), makeItem('b'), makeItem('c')])

    store.getState().toggleItemSelected('a')
    store.getState().toggleItemSelected('b')
    expect(store.getState().selectedItemIds).toEqual(['a', 'b'])

    store.getState().toggleItemSelected('a')
    expect(store.getState().selectedItemIds).toEqual(['b'])

    store.getState().clearSelection()
    expect(store.getState().selectedItemIds).toEqual([])
  })

  it('removeItems 直接移除非進行中的項目，不呼叫取消', async () => {
    const store = await loadStore([
      makeItem('a', 'completed'),
      makeItem('b', 'failed'),
      makeItem('c', 'idle')
    ])
    store.getState().setSelectedItemIds(['a', 'b'])

    await store.getState().removeItems(['a', 'b'])

    expect(store.getState().items.map((i) => i.id)).toEqual(['c'])
    expect(electronAPI.cancelBatchItem).not.toHaveBeenCalled()
    expect(store.getState().selectedItemIds).toEqual([])
  })

  it('removeItems 會先取消進行中的項目再移除，並同步整理複選狀態', async () => {
    const store = await loadStore([
      makeItem('a', 'processing'),
      makeItem('b', 'queued'),
      makeItem('c', 'completed')
    ])
    store.getState().setSelectedItemIds(['a', 'b'])

    await store.getState().removeItems(['a', 'b'])

    expect(electronAPI.cancelBatchItem).toHaveBeenCalledTimes(2)
    expect(electronAPI.cancelBatchItem.mock.calls.map((c) => c[0])).toEqual(['a', 'b'])
    expect(store.getState().items.map((i) => i.id)).toEqual(['c'])
    expect(store.getState().selectedItemIds).toEqual([])
  })

  it('刪除目前單一選取的項目時，自動改選剩餘第一張', async () => {
    const store = await loadStore([makeItem('a'), makeItem('b')])
    store.setState({ selectedItemId: 'a' })

    await store.getState().removeItems(['a'])

    expect(store.getState().items.map((i) => i.id)).toEqual(['b'])
    expect(store.getState().selectedItemId).toBe('b')
  })
})
