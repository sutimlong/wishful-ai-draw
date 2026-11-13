import React, { useEffect } from 'react'
import { useBatchStore } from './store/useBatchStore'
import { TopBar } from './components/TopBar'
import { SidebarConfig } from './components/SidebarConfig'
import { BatchWorkspace } from './components/BatchWorkspace'
import { InspectorPanel } from './components/InspectorPanel'
import { BottomActionBar } from './components/BottomActionBar'
import { SettingsModal } from './components/SettingsModal'
import { VideoTrimmer } from './components/VideoTrimmer'

export function App(): React.ReactElement {
  const initStore = useBatchStore((s) => s.initStore)

  useEffect(() => {
    let cleanup: (() => void) | undefined
    initStore().then((unsub) => {
      cleanup = unsub
    })
    return () => {
      if (cleanup) cleanup()
    }
  }, [initStore])

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col select-none">
      {/* 1. Top Header Bar */}
      <TopBar />

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

      {/* 4. Settings & API Key Modal */}
      <SettingsModal />

      {/* 5. Video Trimmer & 8fps Frame Extractor Modal */}
      <VideoTrimmer />
    </div>
  )
}

export default App
