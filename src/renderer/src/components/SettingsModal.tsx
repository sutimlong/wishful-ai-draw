import React, { useEffect, useState } from 'react'
import { CheckCircle2, FolderOpen, KeyRound, X, FlaskConical } from 'lucide-react'
import type { OutputDirectories } from '@shared/types'
import { useBatchStore } from '../store/useBatchStore'
import { formatDeepSeekAmount } from './DeepSeekBalancePanel'

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useBatchStore((s) => s.isSettingsOpen)
  const setSettingsOpen = useBatchStore((s) => s.setSettingsOpen)
  const appSettings = useBatchStore((s) => s.appSettings)
  const updateAppSettings = useBatchStore((s) => s.updateAppSettings)
  const deepseekBalance = useBatchStore((s) => s.deepseekBalance)
  const deepseekBalanceStatus = useBatchStore((s) => s.deepseekBalanceStatus)

  const [apiKey, setApiKey] = useState('')
  const [deepseekApiKey, setDeepseekApiKey] = useState('')
  const [namingPattern, setNamingPattern] = useState('{original_name}_ai_{timestamp}')
  const [autoSaveOutput, setAutoSaveOutput] = useState(true)
  const [mockMode, setMockMode] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [outputDirectories, setOutputDirectories] = useState<OutputDirectories | null>(null)

  useEffect(() => {
    if (appSettings && isSettingsOpen) {
      setApiKey(appSettings.falApiKey || '')
      setDeepseekApiKey(appSettings.deepseekApiKey || '')
      setNamingPattern(appSettings.namingPattern || '{original_name}_ai_{timestamp}')
      setAutoSaveOutput(appSettings.autoSaveOutput)
      setMockMode(appSettings.mockMode)
      setStatusMessage(null)
    }
  }, [appSettings, isSettingsOpen])

  // 讀取（並確保存在）兩個預設輸出資料夾
  useEffect(() => {
    if (!isSettingsOpen) return

    let disposed = false
    window.electronAPI
      .getOutputDirectories()
      .then((directories) => {
        if (!disposed) setOutputDirectories(directories)
      })
      .catch((err) => {
        console.error('取得預設輸出資料夾失敗：', err)
      })
    return () => {
      disposed = true
    }
  }, [isSettingsOpen])

  if (!isSettingsOpen) return null

  const handleSelectDir = async (): Promise<void> => {
    const selected = await window.electronAPI.selectOutputDirectory(appSettings?.outputDirectory)
    if (selected) {
      await updateAppSettings({ outputDirectory: selected })
    }
  }

  const handleSave = async (): Promise<void> => {
    if (apiKey.trim()) {
      const check = await window.electronAPI.verifyApiKeyFormat(apiKey)
      if (!check.valid) {
        setStatusMessage(`⚠️ ${check.message}`)
        return
      }
    }

    await updateAppSettings({
      falApiKey: apiKey.trim(),
      deepseekApiKey: deepseekApiKey.trim(),
      namingPattern: namingPattern.trim() || '{original_name}_ai_{timestamp}',
      autoSaveOutput,
      mockMode
    })
    setStatusMessage('✅ 設定已安全儲存')
    setTimeout(() => {
      setSettingsOpen(false)
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            系統與 API 設定
          </h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
          {/* API Key */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-200 block">
              fal.ai API Key (使用 macOS Keychain / safeStorage 本地加密儲存)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="輸入 key_id:key_secret..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-zinc-500">
              可前往 <span className="text-indigo-400">https://fal.ai/dashboard/keys</span> 建立並複製您的 API Key。
            </p>
          </div>

          {/* DeepSeek API Key */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-200 block">
              DeepSeek API Key（AI 優化提示詞、對話看圖與餘額查詢）
            </label>
            <input
              type="password"
              value={deepseekApiKey}
              onChange={(e) => setDeepseekApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-sky-500"
            />
            <p className="text-[11px] text-zinc-500">
              可前往 <span className="text-sky-400">https://platform.deepseek.com/api_keys</span>{' '}
              建立 API Key；留空會使用內建預設金鑰。
              {deepseekBalance
                ? ` 目前餘額 ${formatDeepSeekAmount(
                    deepseekBalance.totalBalance,
                    deepseekBalance.currency
                  )}。`
                : deepseekBalanceStatus === 'loading'
                  ? ' 正在查詢餘額…'
                  : ''}
            </p>
          </div>

          {/* Mock Mode */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4" />
                模擬測試模式 (Dry-Run Mock Mode)
              </div>
              <p className="text-[11px] text-zinc-400">
                開啟時不需消耗真實 API 點數，主程序會模擬上傳、排隊與生成並輸出圖片至目標資料夾。
                <br />
                使用記錄仍會寫入 Google 試算表，事件標記為{' '}
                <code className="text-amber-300/90">image_generated_SIM</code>（花費欄位留空）。
              </p>
            </div>
            <input
              type="checkbox"
              checked={mockMode}
              onChange={(e) => setMockMode(e.target.checked)}
              className="h-4 w-4 accent-amber-500 cursor-pointer shrink-0"
            />
          </div>

          {/* Output Directory（影像風格化） */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-200 block">
              影像風格化預設輸出資料夾
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 truncate">
                {appSettings?.outputDirectory || outputDirectories?.stylize || '載入中…'}
              </div>
              <button
                onClick={handleSelectDir}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center gap-1.5 shrink-0"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                瀏覽...
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              預設為 <code>圖片 / Wishful_Ai_Draw</code>；每次開始批量生成前仍可選擇其他資料夾。
            </p>
          </div>

          {/* Output Directory（文字生成圖片，固定路徑） */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-200 block">
              文字生成圖片輸出資料夾（固定）
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 truncate">
                {outputDirectories?.textToImage || '載入中…'}
              </div>
              <button
                onClick={() => {
                  if (outputDirectories) {
                    window.electronAPI.openPathInExplorer(outputDirectories.textToImage)
                  }
                }}
                disabled={!outputDirectories}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center gap-1.5 shrink-0 disabled:cursor-default disabled:opacity-50"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                開啟
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              生成結果會自動儲存在 <code>圖片 / Wishful_Ai_Draw / 文生圖</code>。
            </p>
          </div>

          {/* Naming Pattern */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-200 block">自動存檔命名規則</label>
            <input
              type="text"
              value={namingPattern}
              onChange={(e) => setNamingPattern(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-zinc-500">
              支援變數：<code>{'{original_name}'}</code>、<code>{'{timestamp}'}</code>、
              <code>{'{index}'}</code>
            </p>
          </div>

          {/* Auto Save */}
          <label className="flex items-center justify-between cursor-pointer pt-1">
            <span className="text-zinc-300 font-medium">
              影像風格化完成後自動下載儲存至輸出資料夾
            </span>
            <input
              type="checkbox"
              checked={autoSaveOutput}
              onChange={(e) => setAutoSaveOutput(e.target.checked)}
              className="h-4 w-4 accent-indigo-500"
            />
          </label>

          {statusMessage && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-4 h-4" />
              {statusMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950/60 border-t border-zinc-800 flex justify-end gap-2">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            儲存設定
          </button>
        </div>
      </div>
    </div>
  )
}

