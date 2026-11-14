import { create } from 'zustand'
import { AuthState, AuthUser, SerialLoginInput } from '@shared/types'

interface AuthStore {
  /** 目前登入狀態（loading 表示正在檢查或登入中） */
  status: AuthState['status']
  user: AuthUser | null
  error: string | null
  /** Google 登入流程是否進行中（開啟瀏覽器等待授權） */
  isLoggingIn: boolean
  /** 序號登入是否送出中 */
  isSubmittingSerial: boolean

  /** 初始化登入狀態並訂閱主程序廣播；回傳取消訂閱函式 */
  initAuth: () => Promise<() => void>
  /** 開啟 Google 登入流程 */
  login: () => Promise<void>
  /** 以序號登入（序號 + Email + 名稱） */
  loginWithSerial: (input: SerialLoginInput) => Promise<void>
  /** 登出並回到登入畫面 */
  logout: () => Promise<void>
  /** 套用主程序推送的登入狀態 */
  applyAuthState: (state: AuthState) => void
  /** 清除錯誤訊息（切換登入方式時使用） */
  clearError: () => void
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

/** 將主程序的 AuthState 轉成 store 欄位 */
function fromAuthState(state: AuthState): Pick<AuthStore, 'status' | 'user' | 'error'> {
  return { status: state.status, user: state.user, error: state.error ?? null }
}

export const useAuthStore = create<AuthStore>((set) => ({
  status: 'loading',
  user: null,
  error: null,
  isLoggingIn: false,
  isSubmittingSerial: false,

  applyAuthState: (state) => set(fromAuthState(state)),

  clearError: () => set({ error: null }),

  initAuth: async () => {
    const unsubscribe = window.electronAPI.onAuthChanged((state) => {
      set({
        status: state.status,
        user: state.user,
        error: state.error ?? null
      })
    })

    try {
      const state = await window.electronAPI.getAuthState()
      set({
        status: state.status,
        user: state.user,
        error: state.error ?? null
      })
    } catch (err) {
      set({ status: 'unauthenticated', user: null, error: toErrorMessage(err) })
    }

    return unsubscribe
  },

  login: async () => {
    set({ isLoggingIn: true, error: null })
    try {
      const result = await window.electronAPI.startGoogleLogin()
      if (result.ok) {
        set({ status: 'authenticated', user: result.user, error: null })
      } else {
        set({ status: 'unauthenticated', user: null, error: result.error })
      }
    } catch (err) {
      set({ status: 'unauthenticated', user: null, error: toErrorMessage(err) })
    } finally {
      set({ isLoggingIn: false })
    }
  },

  loginWithSerial: async (input) => {
    set({ isSubmittingSerial: true, error: null })
    try {
      const result = await window.electronAPI.loginWithSerial(input)
      if (result.ok) {
        set({ status: 'authenticated', user: result.user, error: null })
      } else {
        set({ status: 'unauthenticated', user: null, error: result.error })
      }
    } catch (err) {
      set({ status: 'unauthenticated', user: null, error: toErrorMessage(err) })
    } finally {
      set({ isSubmittingSerial: false })
    }
  },

  logout: async () => {
    try {
      const state = await window.electronAPI.logout()
      set({ ...fromAuthState(state), isLoggingIn: false, isSubmittingSerial: false })
    } catch (err) {
      set({
        status: 'unauthenticated',
        user: null,
        error: toErrorMessage(err),
        isLoggingIn: false,
        isSubmittingSerial: false
      })
    }
  }
}))
