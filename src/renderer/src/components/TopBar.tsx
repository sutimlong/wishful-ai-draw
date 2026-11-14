import React from 'react'
import {
  Brush,
  CheckCircle2,
  FolderOpen,
  KeyRound,
  LogOut,
  Settings,
  FlaskConical,
  ExternalLink,
  Type,
  Wallet
} from 'lucide-react'
import type { AuthUser } from '@shared/types'
import { isAdminRole, normalizeRoleLabel } from '@shared/userRole'
import { useBatchStore } from '../store/useBatchStore'
import { useAuthStore } from '../store/useAuthStore'
import { APP_VIEWS, useAppViewStore } from '../store/useAppViewStore'
import type { AppView } from '../store/useAppViewStore'
import { formatUsd } from '../utils/cost'
import { DeepSeekBalancePanel } from './DeepSeekBalancePanel'
import appIconUrl from '../assets/app-icon.png'

/** 登入使用者的頭像（載入失敗時退回姓名首字） */
const UserAvatar: React.FC<{ user: AuthUser }> = ({ user }) => {
  const [failed, setFailed] = React.useState(false)

  if (!user.pictureUrl || failed) {
    return (
      <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-200 text-[11px] font-semibold flex items-center justify-center shrink-0">
        {(user.name || user.email).slice(0, 1).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={user.pictureUrl}
      alt={user.name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="w-6 h-6 rounded-full ring-1 ring-zinc-700 shrink-0"
    />
  )
}

/** 頁面切換按鈕使用的圖示 */
const VIEW_ICONS: Record<AppView, React.FC<{ className?: string }>> = {
  stylize: Brush,
  'text-to-image': Type
}

export const TopBar: React.FC = () => {
  const items = useBatchStore((s) => s.items)
  const appSettings = useBatchStore((s) => s.appSettings)
  const setSettingsOpen = useBatchStore((s) => s.setSettingsOpen)
  const updateAppSettings = useBatchStore((s) => s.updateAppSettings)
  const apiCreditBalance = useBatchStore((s) => s.apiCreditBalance)
  const apiCreditStatus = useBatchStore((s) => s.apiCreditStatus)
  const refreshApiCreditBalance = useBatchStore((s) => s.refreshApiCreditBalance)
  const activeView = useAppViewStore((s) => s.activeView)
  const setActiveView = useAppViewStore((s) => s.setActiveView)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  // 使用者身份（讀自 Google 試算表「工作表3」B 欄；管理員以金色顯示）
  const roleLabel = user ? normalizeRoleLabel(user.role) : ''
  const isAdmin = isAdminRole(user?.role)

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

  const handleCreditClick = (): void => {
    // 無帳務權限時引導使用者到設定更換 Key，其餘狀態點擊即重新整理
    if (apiCreditStatus === 'unauthorized') {
      setSettingsOpen(true)
      return
    }
    void refreshApiCreditBalance()
  }

  return (
    <header className="h-14 shrink-0 bg-zinc-950 border-b border-zinc-800/80 px-4 flex items-center justify-between">
      {/* Left: Brand + Task Counters */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src={appIconUrl}
            alt="Wishful AI Draw Icon"
            className="h-8 w-8 rounded-lg object-contain drop-shadow"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
                Wishful AI Draw
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 tracking-wide whitespace-nowrap">
              小融AI與你同在
            </span>
          </div>
        </div>

        {/* 主功能頁面切換：影像風格化 / 文字生成圖片 */}
        <nav
          aria-label="主功能頁面切換"
          className="flex shrink-0 items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/80 p-1"
        >
          {APP_VIEWS.map((view) => {
            const Icon = VIEW_ICONS[view.id]
            const isActive = activeView === view.id
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                aria-pressed={isActive}
                title={view.description}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-950/60'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {view.label}
              </button>
            )
          })}
        </nav>

        {/* 批次任務統計僅與影像風格化頁面有關，切換到文字生成圖片時隱藏 */}
        {activeView === 'stylize' && (
          <>
            <div className="h-4 w-px bg-zinc-800" />

            {/* Task stats badges */}
            <div className="hidden xl:flex shrink-0 items-center gap-2 text-xs whitespace-nowrap">
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
          </>
        )}
      </div>

      {/* Right: Mock Mode Toggle, Output Dir, API Key Status, Settings */}
      <div className="flex items-center gap-2.5">
        {/* Mock Mode Quick Toggle */}
        <button
          onClick={() => updateAppSettings({ mockMode: !appSettings?.mockMode })}
          title="開啟後可不消耗 fal.ai API 點數進行本地模擬批量測試"
          className={`hidden min-[1700px]:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
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
            <span className="hidden min-[1600px]:inline truncate">
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

        {/* DeepSeek 餘額 + API Key */}
        <DeepSeekBalancePanel />

        {/* fal.ai Remaining Credits */}
        {appSettings?.hasApiKey && (
          <button
            onClick={handleCreditClick}
            title={
              apiCreditStatus === 'unauthorized'
                ? '目前 API Key 沒有 billing:usage:read 權限，無法查詢剩餘額度。請改用 BILLING / READONLY / FULL 類型的 Key（點擊開啟設定）。'
                : apiCreditStatus === 'error'
                  ? '暫時無法取得剩餘額度（網路或服務錯誤）。點擊可重新整理。'
                  : 'fal.ai 剩餘額度（點擊重新整理）'
            }
            className={`flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              apiCreditStatus === 'unauthorized'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : apiCreditStatus === 'error'
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/20'
            }`}
          >
            <Wallet
              className={`w-3.5 h-3.5 ${
                apiCreditStatus === 'unauthorized' ? 'text-amber-400' : 'text-indigo-400'
              }`}
            />
            {apiCreditStatus === 'loading' ? (
              <span className="text-zinc-400">額度 …</span>
            ) : apiCreditBalance ? (
              <>
                <span className="font-mono">{formatUsd(apiCreditBalance.currentBalance)}</span>
                <span className="text-[10px] text-indigo-300/70">{apiCreditBalance.currency}</span>
              </>
            ) : apiCreditStatus === 'unauthorized' ? (
              <span>額度：需帳務權限</span>
            ) : apiCreditStatus === 'error' ? (
              <span>額度：無法讀取</span>
            ) : (
              <span>額度 —</span>
            )}
          </button>
        )}

        {/* API Key Indicator */}
        <button
          onClick={() => setSettingsOpen(true)}
          className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
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

        {/* 登入使用者資訊與登出 */}
        {user && (
          <div
            title={user.serial ? `序號：${user.serial}` : user.email}
            className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <UserAvatar user={user} />
            <div className="hidden xl:flex flex-col leading-none max-w-[150px]">
              <span className="text-[11px] font-medium text-zinc-200 truncate">{user.name}</span>
              <span className="text-[10px] text-zinc-500 truncate whitespace-nowrap">
                {user.serial ? `序號 ${user.serial}` : user.email}
              </span>
            </div>
            <span
              title="使用者身份（Google 試算表・工作表3 B 欄）"
              className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
                isAdmin
                  ? 'border-amber-400/60 bg-amber-400/15 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.25)]'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-300'
              }`}
            >
              {roleLabel}
            </span>
            <button
              onClick={() => void logout()}
              title="登出目前帳號"
              className="p-1.5 rounded-md text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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

