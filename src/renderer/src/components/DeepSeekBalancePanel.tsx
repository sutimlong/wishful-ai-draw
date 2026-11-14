import React from 'react'
import { ExternalLink, RefreshCw, Sparkles } from 'lucide-react'
import type { DeepSeekBalance } from '@shared/types'
import { useBatchStore } from '../store/useBatchStore'

type BalanceStatus = 'idle' | 'loading' | 'ready' | 'unauthorized' | 'error'

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', CNY: '¥' }

/** DeepSeek 餘額格式化（USD → $、CNY → ¥，其他幣別顯示幣別代碼） */
export function formatDeepSeekAmount(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  if (symbol) return `${symbol}${amount.toFixed(2)}`
  return `${amount.toFixed(2)} ${currency}`
}

/** 徽章顯示文字：金額優先，其次依查詢狀態顯示提示 */
export function getDeepSeekBadgeText(
  status: BalanceStatus,
  balance: DeepSeekBalance | null
): string {
  if (status === 'loading') return 'DeepSeek …'
  if (balance) return formatDeepSeekAmount(balance.totalBalance, balance.currency)
  if (status === 'unauthorized') return 'DeepSeek Key 無效'
  if (status === 'error') return 'DeepSeek 額度 ?'
  return 'DeepSeek Key'
}

/**
 * TopBar 的 DeepSeek 徽章：
 * - 常駐顯示目前餘額（GET https://api.deepseek.com/user/balance）
 * - 點擊展開面板，可直接填寫／更新 DeepSeek API Key 並重新整理餘額
 *
 * 金鑰經 IPC 送入 main process 後以 safeStorage 加密保存，
 * renderer 不會直接持有網路請求（也不會把金鑰寫進前端狀態以外的地方）。
 */
export const DeepSeekBalancePanel: React.FC = () => {
  const appSettings = useBatchStore((s) => s.appSettings)
  const updateAppSettings = useBatchStore((s) => s.updateAppSettings)
  const setSettingsOpen = useBatchStore((s) => s.setSettingsOpen)
  const balance = useBatchStore((s) => s.deepseekBalance)
  const status = useBatchStore((s) => s.deepseekBalanceStatus)
  const refreshBalance = useBatchStore((s) => s.refreshDeepSeekBalance)

  const [isOpen, setIsOpen] = React.useState(false)
  const [keyDraft, setKeyDraft] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isOpen) {
      setKeyDraft(appSettings?.deepseekApiKey || '')
    }
  }, [isOpen, appSettings?.deepseekApiKey])

  // 點擊面板外部或按 Esc 關閉
  React.useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: MouseEvent): void => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSaveKey = async (): Promise<void> => {
    setIsSaving(true)
    try {
      // 清空或填回預設 Key 時，主程序會自動回退到內建金鑰
      await updateAppSettings({ deepseekApiKey: keyDraft.trim() })
      setIsOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const badgeLabel = (
    <span
      className={
        status === 'loading' ? 'text-zinc-400' : balance ? 'font-mono' : undefined
      }
    >
      {getDeepSeekBadgeText(status, balance)}
    </span>
  )

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen((open) => !open)}
        title={
          balance
            ? `DeepSeek 餘額：${formatDeepSeekAmount(
                balance.totalBalance,
                balance.currency
              )}（點擊填寫 API Key 或重新整理）`
            : '填寫 DeepSeek API Key（用於 AI 優化提示詞與餘額查詢）'
        }
        className={`flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
          status === 'unauthorized'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            : status === 'error'
              ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              : isOpen
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-100'
                : 'bg-sky-500/10 border-sky-500/30 text-sky-200 hover:bg-sky-500/20'
        }`}
      >
        <Sparkles
          className={`w-3.5 h-3.5 ${
            status === 'unauthorized' ? 'text-amber-400' : 'text-sky-400'
          }`}
        />
        {badgeLabel}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-2xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-100">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              DeepSeek 提示詞優化
            </span>
            <button
              onClick={() => void refreshBalance()}
              title="重新查詢 DeepSeek 餘額"
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          {balance ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">目前餘額</span>
                <span className="font-mono text-emerald-300">
                  {formatDeepSeekAmount(balance.totalBalance, balance.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>
                  儲值 {formatDeepSeekAmount(balance.toppedUpBalance, balance.currency)}
                </span>
                <span>
                  贈送 {formatDeepSeekAmount(balance.grantedBalance, balance.currency)}
                </span>
              </div>
              {!balance.isAvailable && (
                <p className="text-[11px] text-amber-300">餘額不足，DeepSeek API 目前不可用。</p>
              )}
            </div>
          ) : (
            <p className="text-[11px] leading-relaxed text-zinc-500">
              {status === 'loading'
                ? '正在查詢餘額…'
                : status === 'unauthorized'
                  ? 'API Key 無效或已失效，請重新輸入。'
                  : status === 'error'
                    ? '無法取得餘額（網路或服務錯誤），可點右上角重新整理。'
                    : '尚未查詢餘額。'}
            </p>
          )}

          <div className="space-y-1.5">
            <label className="block font-semibold text-zinc-200">DeepSeek API Key</label>
            <input
              type="password"
              value={keyDraft}
              onChange={(event) => setKeyDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleSaveKey()
              }}
              placeholder="sk-..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-sky-500"
            />
            <p className="text-[10px] leading-relaxed text-zinc-500">
              金鑰僅儲存於本機（safeStorage 加密）。留空時會自動套用內建預設金鑰。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleSaveKey()}
              disabled={isSaving}
              className="flex-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-semibold transition"
            >
              {isSaving ? '儲存中…' : '儲存金鑰'}
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                setSettingsOpen(true)
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition flex items-center gap-1"
            >
              更多設定
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

