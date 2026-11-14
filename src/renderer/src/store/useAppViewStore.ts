import { create } from 'zustand'

/** 應用程式的主要工作頁面 */
export type AppView = 'stylize' | 'text-to-image'

export interface AppViewMeta {
  id: AppView
  label: string
  /** 滑鼠移入時的說明文字 */
  description: string
}

/** TopBar 頁面切換按鈕的顯示順序與文案（集中管理，避免兩處文案不同步） */
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
  }
]

interface AppViewState {
  activeView: AppView
  setActiveView: (view: AppView) => void
}

export const useAppViewStore = create<AppViewState>((set) => ({
  // 預設維持既有行為：登入後先進入影像風格化頁面
  activeView: 'stylize',
  setActiveView: (activeView) => set({ activeView })
}))
