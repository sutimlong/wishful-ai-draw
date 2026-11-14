import React from 'react'
import { AlertCircle, KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import appIconUrl from '../assets/app-icon.png'
import { LoginBackdrop } from './LoginBackdrop'

/** Google 官方風格的「G」標誌 */
const GoogleGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
)

type LoginMode = 'google' | 'serial'

const inputClass =
  'w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60'

/**
 * 登入畫面（Google 帳號或序號）。
 * 未登入時整個 App 內容都不會掛載，確保所有使用行為都對應到已登入帳號。
 */
export const LoginGate: React.FC = () => {
  const status = useAuthStore((s) => s.status)
  const error = useAuthStore((s) => s.error)
  const isLoggingIn = useAuthStore((s) => s.isLoggingIn)
  const isSubmittingSerial = useAuthStore((s) => s.isSubmittingSerial)
  const login = useAuthStore((s) => s.login)
  const loginWithSerial = useAuthStore((s) => s.loginWithSerial)
  const clearError = useAuthStore((s) => s.clearError)

  const [mode, setMode] = React.useState<LoginMode>('google')
  const [serial, setSerial] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [name, setName] = React.useState('')

  const isBusy = status === 'loading' || isLoggingIn || isSubmittingSerial
  const isSerialMode = mode === 'serial'

  const switchMode = (next: LoginMode): void => {
    if (next === mode || isBusy) return
    clearError()
    setMode(next)
  }

  const handleSerialSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isBusy) return
    void loginWithSerial({ serial, email, name })
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 flex items-center justify-center select-none">
      <LoginBackdrop />

      <div className="relative z-10 w-full max-w-md mx-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {/* 標誌後方緩慢旋轉的 conic 光環 + 呼吸光暈 */}
            <div
              className="absolute -inset-5 rounded-full opacity-[0.65] blur-2xl animate-spin-slow motion-reduce:animate-none"
              style={{
                background: 'conic-gradient(from 0deg, #6366f1, #d946ef, #22d3ee, #6366f1)'
              }}
            />
            <div className="absolute -inset-2 rounded-[26px] bg-indigo-500/30 blur-xl animate-pulse-glow motion-reduce:animate-none" />
            <img
              src={appIconUrl}
              alt="Wishful AI Draw"
              className="relative w-20 h-20 rounded-2xl shadow-2xl shadow-indigo-950/60 ring-1 ring-white/10"
              draggable={false}
            />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 via-white to-fuchsia-200 bg-[length:200%_auto] bg-clip-text text-transparent animate-shine motion-reduce:animate-none">
            Wishful AI Draw
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            請先登入（Google 帳號或序號），才能開始使用 AI 圖片批次生成功能。
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur px-6 py-7 shadow-2xl shadow-black/40">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>登入僅用於辨識使用者，並記錄圖片生成數量與 API 花費額度。</span>
          </div>

          {/* 登入方式切換 */}
          <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-zinc-800 bg-zinc-950/70 p-1">
            <button
              type="button"
              onClick={() => switchMode('google')}
              disabled={isBusy}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                !isSerialMode ? 'bg-white text-zinc-900 shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Google 登入
            </button>
            <button
              type="button"
              onClick={() => switchMode('serial')}
              disabled={isBusy}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isSerialMode ? 'bg-white text-zinc-900 shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              序號登入
            </button>
          </div>
          {!isSerialMode ? (
            <>
              <button
                type="button"
                onClick={() => void login()}
                disabled={isBusy}
                className="mt-5 w-full flex items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
                    正在連線至 Google…
                  </>
                ) : (
                  <>
                    <GoogleGlyph className="w-5 h-5" />
                    使用 Google 帳戶登入
                  </>
                )}
              </button>

              {isBusy && (
                <p className="mt-3 text-center text-xs text-zinc-500">
                  已開啟瀏覽器，完成 Google 授權後會自動切換回此視窗。
                </p>
              )}
            </>
          ) : (
            <form onSubmit={handleSerialSubmit} className="mt-5 space-y-3">
              <div>
                <label
                  className="mb-1.5 block text-[11px] font-medium text-zinc-400"
                  htmlFor="serial-key"
                >
                  序號
                </label>
                <input
                  id="serial-key"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  disabled={isBusy}
                  placeholder="例如 WAD-2026-0001"
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus
                  className={`${inputClass} font-mono tracking-wide`}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-[11px] font-medium text-zinc-400"
                  htmlFor="serial-email"
                >
                  Email
                </label>
                <input
                  id="serial-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isBusy}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-[11px] font-medium text-zinc-400"
                  htmlFor="serial-name"
                >
                  名稱
                </label>
                <input
                  id="serial-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isBusy}
                  placeholder="顯示在試算表的使用者名稱"
                  autoComplete="name"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingSerial ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    驗證序號中…
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    使用序號登入
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-zinc-500">
                序號由管理員提供，登入時會線上驗證；使用記錄會以「名稱（序號）」寫入試算表。
              </p>
            </form>
          )}

          {error && !isBusy && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2.5 text-xs leading-relaxed text-rose-300">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-600">
          登入狀態會加密保存在本機，下次開啟 App 將自動登入。
        </p>
      </div>
    </div>
  )
}
