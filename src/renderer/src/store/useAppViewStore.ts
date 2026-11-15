import { create } from 'zustand'
import { useSyncExternalStore } from 'react'

/** 應用程式的主要工作頁面 */
export type AppView = 'stylize' | 'text-to-image' | 'text-to-video' | 'image-to-video'

export interface AppViewMeta {
  id: AppView
  label: string
  /** 滑鼠移入時的說明文字 */
  description: string
}

/** TopBar 頁面切換按鈕的顯示順序與文案（集中管理，避免多處文案不同步） */
export const APP_VIEWS: AppViewMeta[] = [
  {
    id: 'stylize',
    label: '影像風格化',
    description: '上傳圖片並套用 AI 風格化工作流（批次處理）'
  },
  {
    id: 'text-to-image',
    label: '文字生成圖片',
    description: '以文字提示詞直接生成全新圖片'
  },
  {
    id: 'text-to-video',
    label: '文字生成影片',
    description: '調用 fal.ai 文生影片模型以文字生成影片'
  },
  {
    id: 'image-to-video',
    label: '圖片生成影片',
    description: '調用 fal.ai 圖生影片模型讓圖片動起來'
  }
]

interface AppViewState {
  activeView: AppView
  setActiveView: (view: AppView) => void
}

const appViewStore = create<AppViewState>((set) => ({
  // 預設維持既有行為：登入後先進入影像風格化頁面
  activeView: 'stylize',
  setActiveView: (activeView) => set({ activeView })
}))

/**
 * 使用 useSyncExternalStore 自訂 SSR snapshot：
 * Zustand 預設的 server snapshot 會固定回傳「初始狀態」，
 * 這會讓伺服器渲染測試無法反映 setActiveView 後的結果。
 * 這裡讓 server/client 都讀取目前狀態，行為與原本的 selectors 相同。
 */
const useAppViewSelector = <T,>(selector: (state: AppViewState) => T): T =>
  useSyncExternalStore(
    appViewStore.subscribe,
    () => selector(appViewStore.getState()),
    () => selector(appViewStore.getState())
  )

export const useAppViewStore = Object.assign(
  useAppViewSelector,
  appViewStore
) as unknown as typeof appViewStore
