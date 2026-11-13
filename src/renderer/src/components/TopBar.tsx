import React from 'react'
import {
  CheckCircle2,
  FolderOpen,
  KeyRound,
  Settings,
  FlaskConical,
  ExternalLink
} from 'lucide-react'
import { useBatchStore } from '../store/useBatchStore'
import appIconUrl from '../assets/app-icon.png'

export const TopBar: React.FC = () => {
  const items = useBatchStore((s) => s.items)
  const appSettings = useBatchStore((s) => s.appSettings)
  const setSettingsOpen = useBatchStore((s) => s.setSettingsOpen)
  const updateAppSettings = useBatchStore((s) => s.updateAppSettings)

  const totalCount = items.length
  const completedCount = items.filter((i) => i.status === 'completed').length
  const activeCount = items.filter(
    (i) => i.status === 'uploading' || i.status === 'queued' || i.status === 'processing'
  ).length
  const failedCount = items.filter((i) => i.status === 'failed').length

  const handleOpenOutputFolder = (): void => {
    if (appSettings?.outputDirectory) {
      window.electronAPI.openPathInExplorer(appSettings.outputDirectory)
    }
  }

  const handleChangeOutputFolder = async (): Promise<void> => {
    const dir = await window.electronAPI.selectOutputDirectory(appSettings?.outputDirectory)
    if (dir) {
      await updateAppSettings({ outputDirectory: dir })
    }
  }

  return (
    <header className="h-14 shrink-0 bg-zinc-950 border-b border-zinc-800/80 px-4 flex items-center justify-between">
      {/* Left: Brand + Task Counters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <img
            src={appIconUrl}
            alt="Wishful AI Draw Icon"
            className="h-8 w-8 rounded-lg object-contain drop-shadow"
          />
          <div>
            <span className="text-sm font-bold tracking-tight text-white">Wishful AI Draw</span>
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              fal.ai Batch Studio
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-800" />

        {/* Task stats badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            總數 <strong className="text-white ml-1">{totalCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            完成 <strong className="ml-1">{completedCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-indigo-950/40 border border-indigo-500/30 text-indigo-300">
            處理中 <strong className="ml-1">{activeCount}</strong>
          </span>
          {failedCount > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-rose-950/40 border border-rose-500/30 text-rose-300">
              失敗 <strong className="ml-1">{failedCount}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Right: Mock Mode Toggle, Output Dir, API Key Status, Settings */}
      <div className="flex items-center gap-2.5">
        {/* Mock Mode Quick Toggle */}
        <button
          onClick={() => updateAppSettings({ mockMode: !appSettings?.mockMode })}
          title="開啟後可不消耗 fal.ai API 點數進行本地模擬批量測試"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
            appSettings?.mockMode
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          {appSettings?.mockMode ? '模擬測試模式 (ON)' : '模擬模式 (OFF)'}
        </button>

        {/* Output Directory Pill */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden text-xs">
          <button
            onClick={handleChangeOutputFolder}
            title={`點擊更換輸出目錄：${appSettings?.outputDirectory || ''}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-300 hover:bg-zinc-800 transition max-w-[200px]"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">
              {appSettings?.outputDirectory
                ? appSettings.outputDirectory.split(/[/\\]/).pop() || appSettings.outputDirectory
                : '選擇輸出資料夾'}
            </span>
          </button>
          <button
            onClick={handleOpenOutputFolder}
            title="在 Finder / 檔案總管開啟輸出資料夾"
            className="px-2 py-1.5 border-l border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* API Key Indicator */}
        <button
          onClick={() => setSettingsOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            appSettings?.hasApiKey
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
          }`}
        >
          {appSettings?.hasApiKey ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              API Key 已就緒
            </>
          ) : (
            <>
              <KeyRound className="w-3.5 h-3.5 text-rose-400" />
              未設定 API Key
            </>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition"
          title="應用程式設定"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

