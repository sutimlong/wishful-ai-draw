import React, { useEffect } from 'react'
import { useBatchStore } from './store/useBatchStore'
import { useAuthStore } from './store/useAuthStore'
import { useAppViewStore } from './store/useAppViewStore'
import { LoginGate } from './components/LoginGate'
import { TopBar } from './components/TopBar'
import { SidebarConfig } from './components/SidebarConfig'
import { BatchWorkspace } from './components/BatchWorkspace'
import { InspectorPanel } from './components/InspectorPanel'
import { BottomActionBar } from './components/BottomActionBar'
import { SettingsModal } from './components/SettingsModal'
import { VideoTrimmer } from './components/VideoTrimmer'
import { TextToImagePage } from './components/TextToImagePage'
import { TextToVideoPage } from './components/TextToVideoPage'
import { ImageToVideoPage } from './components/ImageToVideoPage'

export function App(): React.ReactElement {
  const initStore = useBatchStore((s) => s.initStore)
  const authStatus = useAuthStore((s) => s.status)
  const initAuth = useAuthStore((s) => s.initAuth)
  const activeView = useAppViewStore((s) => s.activeView)

  // 初始化登入狀態（並訂閱主程序推送的狀態變更）
  useEffect(() => {
    let cleanup: (() => void) | undefined
    initAuth().then((unsub) => {
      cleanup = unsub
    })
    return () => {
      if (cleanup) cleanup()
    }
  }, [initAuth])

  // 登入後才初始化批次 store（避免未登入時讀取設定與查詢額度）
  useEffect(() => {
    if (authStatus !== 'authenticated') return

    let disposed = false
    let cleanup: (() => void) | undefined
    initStore().then((unsub) => {
      if (disposed) unsub()
      else cleanup = unsub
    })

    return () => {
      disposed = true
      if (cleanup) cleanup()
    }
  }, [authStatus, initStore])

  // 強制登入：未登入（或檢查中）時只顯示登入畫面
  if (authStatus !== 'authenticated') {
    return <LoginGate />
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col select-none">
      {/* 1. Top Header Bar */}
      <TopBar />

      {/* 三個主要工作區保持掛載，切換頁面時只隱藏，避免中斷背景生成與遺失進度 */}
      <div
        className={
          activeView === 'stylize'
            ? 'flex-1 flex flex-col overflow-hidden'
            : 'hidden'
        }
      >
        {/* 2. Main Three-Column Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: AI Model & Parameters Sidebar */}
          <SidebarConfig />

          {/* Center: Batch Drag & Drop Grid Workspace */}
          <BatchWorkspace />

          {/* Right: Before/After Inspector Drawer */}
          <InspectorPanel />
        </div>

        {/* 3. Bottom Concurrency & Batch Execution Bar */}
        <BottomActionBar />
      </div>

      <div
        className={
          activeView === 'text-to-image'
            ? 'flex-1 flex overflow-hidden'
            : 'hidden'
        }
      >
        {/* 文字生成圖片頁面 */}
        <TextToImagePage />
      </div>

      <div
        className={
          activeView === 'text-to-video'
            ? 'flex-1 flex overflow-hidden'
            : 'hidden'
        }
      >
        {/* 文字生成影片頁面 */}
        <TextToVideoPage />
      </div>

      <div
        className={
          activeView === 'image-to-video'
            ? 'flex-1 flex overflow-hidden'
            : 'hidden'
        }
      >
        {/* 圖片生成影片頁面 */}
        <ImageToVideoPage />
      </div>

      {/* 4. Settings & API Key Modal */}
      <SettingsModal />

      {/* 5. Video Trimmer & 8fps Frame Extractor Modal */}
      <VideoTrimmer />
    </div>
  )
}

export default App
