import { app, safeStorage, shell } from 'electron'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'
import { createHash, randomBytes } from 'crypto'
import { createServer } from 'http'
import type { AddressInfo } from 'net'
import {
  AuthState,
  AuthUser,
  GoogleLoginResult,
  GoogleUser,
  SerialLoginInput,
  SerialLoginResult
} from '../../shared/types'
import { allowedAccountsService } from './allowedAccounts'
import { loadGoogleCredentials, resetGoogleCredentialsCache } from './googleConfig'
import { base64Url, buildAuthUrl, renderResultPage } from './googleOAuthPkce'
import { serialKeyService } from './serialKeyService'
import { buildSerialAuthUser, validateSerialInput, validateSerialLogin } from './serialAuth'
import { userRoleService } from './userRoleService'
import { DEFAULT_USER_ROLE_LABEL } from '../../shared/userRole'
import { focusAppWindows } from './appWindowFocus'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke'
const LOGIN_TIMEOUT_MS = 5 * 60 * 1000
/** 呼叫 Google API 的單次請求逾時（避免登入畫面卡在檢查狀態） */
const GOOGLE_FETCH_TIMEOUT_MS = 15 * 1000
/** access token 提前 60 秒視為過期，避免邊界失效 */
const ACCESS_TOKEN_SAFETY_WINDOW_MS = 60 * 1000
/** 未列在「工作表3」授權清單內的 Google 帳號顯示的訊息 */
export const ACCOUNT_NOT_ALLOWED_MESSAGE =
  '此 Google 帳號尚未開通。請聯絡小融，幫你開通帳號 sutimlong@gmail.com 0979-891-727'

interface PersistedSession {
  refreshToken: string
  user: AuthUser
}

/** 序號登入保存於 userData/serial-auth.json 的工作階段 */
interface PersistedSerialSession {
  user: AuthUser
}

interface TokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
}

/** Google OAuth 錯誤；fatal 表示必須重新登入（token 已失效／被撤銷） */
class GoogleAuthError extends Error {
  public readonly fatal: boolean

  constructor(message: string, fatal = false) {
    super(message)
    this.name = 'GoogleAuthError'
    this.fatal = fatal
  }
}

/** 依 Google token 端點回傳的錯誤，組出可操作的錯誤訊息 */
function describeTokenError(payload: TokenResponse | null, status: number): string {
  const detail = payload?.error_description || payload?.error || `HTTP ${status}`
  const combined = `${payload?.error ?? ''} ${payload?.error_description ?? ''}`

  if (/client[_ ]?secret/i.test(combined) && /missing|required/i.test(combined)) {
    return (
      '此 OAuth 用戶端需要 client_secret：請在 resources/google-credentials.json 的 ' +
      `oauthClientSecret 填入「電腦版應用程式」用戶端的用戶端密碼後重試（${detail}）`
    )
  }
  if (payload?.error === 'invalid_client') {
    return `OAuth Client ID 或 Client Secret 不正確，請重新確認（${detail}）`
  }
  if (payload?.error === 'redirect_uri_mismatch') {
    return 'redirect URI 不符：請確認 OAuth 用戶端類型為「電腦版應用程式（Desktop app）」'
  }
  return detail
}

/**
 * Google OAuth 登入服務（Loopback + PKCE）。
 * 流程：
 * 1. 啟動本機 127.0.0.1 隨機埠的 HTTP server 作為 redirect URI。
 * 2. 以系統瀏覽器開啟 Google 同意畫面。
 * 3. 擷取授權碼後交換 access / refresh token。
 * 4. 取得使用者 profile（email / name / picture）並以 safeStorage 加密保存 refresh token。
 *
 * refresh token 會保存於 userData/google-auth.json，App 重啟後可自動還原登入狀態。
 */
export class GoogleAuthService {
  private state: AuthState = { status: 'loading', user: null }
  private user: AuthUser | null = null
  private refreshToken: string | null = null
  private accessToken: string | null = null
  private accessTokenExpiresAt = 0
  private initPromise: Promise<AuthState> | null = null
  private loginInFlight: Promise<GoogleLoginResult> | null = null

  private get sessionFilePath(): string {
    return join(app.getPath('userData'), 'google-auth.json')
  }

  /** 序號登入的工作階段檔（與 Google 分開保存，登入時互斥） */
  private get serialSessionFilePath(): string {
    return join(app.getPath('userData'), 'serial-auth.json')
  }

  public getState(): AuthState {
    return this.state
  }

  /** 目前登入的使用者（未登入時為 null） */
  public getCurrentUser(): AuthUser | null {
    return this.state.status === 'authenticated' ? this.user : null
  }

  /** 依 Email 補上使用者身份（讀取失敗時沿用既有資料，不影響登入） */
  private async withRole(user: AuthUser): Promise<AuthUser> {
    const role = await userRoleService.getRole(user.email, true)
    return role ? { ...user, role } : user
  }

  /**
   * 以序號登入。
   * 序號需存在於雲端序號試算表（預設「工作表二」A 欄，由 Service Account 讀取），
   * Email 與名稱由使用者自行填寫；成功後工作階段會加密保存，重啟可自動登入。
   */
  public async loginWithSerial(input: SerialLoginInput): Promise<SerialLoginResult> {
    // 先檢查輸入格式，格式錯誤時不必呼叫雲端
    const inputCheck = validateSerialInput(input)
    if (!inputCheck.ok) {
      this.state = { status: 'unauthenticated', user: null, error: inputCheck.error }
      return { ok: false, error: inputCheck.error }
    }

    // 重新讀取憑證與連線設定，讓修改 google-credentials.json 後不需重啟 App
    resetGoogleCredentialsCache()
    serialKeyService.resetCache()
    userRoleService.resetCache()

    // 每次登入都向雲端重新確認序號，確保管理員更新試算表後可立即生效
    let validKeys: string[]
    try {
      validKeys = await serialKeyService.getSerialKeys(true)
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      this.state = { status: 'unauthenticated', user: null, error }
      return { ok: false, error }
    }

    const validation = validateSerialLogin(input, validKeys)
    if (!validation.ok) {
      this.state = { status: 'unauthenticated', user: null, error: validation.error }
      return { ok: false, error: validation.error }
    }

    // 序號登入一律視為一般使用者（不讀取試算表 B 欄身份）
    const user = buildSerialAuthUser(input, validation.serial)
    this.user = user
    this.refreshToken = null
    this.accessToken = null
    this.accessTokenExpiresAt = 0
    // 清除先前的 Google 工作階段，避免下次啟動還原成 Google 身分
    this.removeSessionFile(this.sessionFilePath)
    this.persistSerialSession()
    this.state = { status: 'authenticated', user }

    // 背景回填名字／Email／登入時間到序號試算表（best-effort，不影響登入結果）
    void serialKeyService.recordSerialLogin(validation.serial, user.name, user.email)

    return { ok: true, user }
  }

  /** 確保已嘗試還原上次登入狀態（僅執行一次） */
  public ensureRestored(): Promise<AuthState> {
    if (!this.initPromise) {
      this.initPromise = this.restoreSession()
    }
    return this.initPromise
  }

  /** 取得有效的 access token（必要時自動以 refresh token 更新） */
  public async getAccessToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt - ACCESS_TOKEN_SAFETY_WINDOW_MS) {
      return this.accessToken
    }
    try {
      const refreshed = await this.refreshAccessToken()
      this.accessToken = refreshed.accessToken
      this.accessTokenExpiresAt = refreshed.expiresAt
      return this.accessToken
    } catch {
      return null
    }
  }

  private async restoreSession(): Promise<AuthState> {
    // 序號登入優先還原（兩種工作階段互斥，登入時會清除另一方）
    const serialUser = this.loadPersistedSerialSession()
    if (serialUser) {
      try {
        // 向雲端重新確認序號是否仍有效（序號被移出清單後即失效）
        const validKeys = await serialKeyService.getSerialKeys()
        if (serialUser.serial && validKeys.includes(serialUser.serial)) {
          // 序號登入一律為一般使用者
          const user = { ...serialUser, role: DEFAULT_USER_ROLE_LABEL }
          this.user = user
          this.state = { status: 'authenticated', user }
          return this.state
        }

        this.removeSessionFile(this.serialSessionFilePath)
        this.state = {
          status: 'unauthenticated',
          user: null,
          error: '序號已失效，請使用有效的序號重新登入。'
        }
        return this.state
      } catch (err) {
        // 無法連線或尚未設定憑證時保留登入，避免使用者因暫時性問題被強制登出；
        // 只有雲端明確回報「序號不在清單」時才清除工作階段。
        console.warn('無法線上驗證序號，暫時保留登入狀態：', err)
        // 序號登入一律為一般使用者
        const user = { ...serialUser, role: DEFAULT_USER_ROLE_LABEL }
        this.user = user
        this.state = { status: 'authenticated', user }
        return this.state
      }
    }

    try {
      const persisted = this.loadPersistedSession()
      if (!persisted) {
        this.state = { status: 'unauthenticated', user: null }
        return this.state
      }
      this.user = await this.withRole({ ...persisted.user, authMethod: 'google' })
      this.refreshToken = persisted.refreshToken

      const refreshed = await this.refreshAccessToken()
      this.accessToken = refreshed.accessToken
      this.accessTokenExpiresAt = refreshed.expiresAt

      // 嘗試更新最新 profile（失敗時沿用已保存的資料）
      try {
        const profile = await this.fetchUserInfo(this.accessToken)
        this.user = await this.withRole({ ...profile, authMethod: 'google' })
        this.persistSession()
      } catch {
        // ignore
      }

      // 防護網：每次啟動還原時重新確認帳號仍在「工作表3」授權清單內
      try {
        const allowed = await allowedAccountsService.isEmailAllowed(this.user?.email ?? '', true)
        if (!allowed) {
          this.clearSession()
          this.state = {
            status: 'unauthenticated',
            user: null,
            error: ACCOUNT_NOT_ALLOWED_MESSAGE
          }
          return this.state
        }
      } catch (err) {
        // 無法連線或設定暫時異常時保留登入，避免使用者因暫時性問題被強制登出
        console.warn('無法線上驗證帳號授權，暫時保留登入狀態：', err)
      }

      this.state = { status: 'authenticated', user: this.user }
    } catch (err) {
      // 只有 token 明確失效（invalid_grant / 401）才清除本機登入資料；
      // 網路暫時不通時保留 refresh token，下次開啟 App 仍可自動登入。
      if (err instanceof GoogleAuthError && err.fatal) {
        this.clearSession()
      }
      this.state = {
        status: 'unauthenticated',
        user: null,
        error: err instanceof Error ? err.message : String(err)
      }
    }
    return this.state
  }

  /**
   * 開啟 Google 登入流程。重複呼叫時會共用同一個進行中的登入請求。
   */
  public startLogin(): Promise<GoogleLoginResult> {
    if (this.loginInFlight) return this.loginInFlight
    this.loginInFlight = this.runLoginFlow().finally(() => {
      this.loginInFlight = null
    })
    return this.loginInFlight
  }

  private async runLoginFlow(): Promise<GoogleLoginResult> {
    // 每次登入前重新讀取憑證檔，讓修改 google-credentials.json 後不需重啟 App
    resetGoogleCredentialsCache()
    allowedAccountsService.resetCache()
    userRoleService.resetCache()
    const cfg = loadGoogleCredentials()
    const clientId = cfg?.oauthClientId?.trim() || process.env['GOOGLE_OAUTH_CLIENT_ID']?.trim()
    if (!clientId) {
      const error =
        '尚未設定 Google OAuth Client ID。請在 resources/google-credentials.json 填入 oauthClientId（Desktop app 類型）。'
      this.state = { status: 'unauthenticated', user: null, error }
      return { ok: false, error }
    }

    this.state = { status: 'loading', user: null }
    try {
      const codeVerifier = base64Url(randomBytes(32))
      const codeChallenge = base64Url(createHash('sha256').update(codeVerifier).digest())
      const state = base64Url(randomBytes(16))

      const { code, redirectUri } = await this.openConsentAndWait(clientId, state, codeChallenge)
      const tokens = await this.exchangeCode(
        clientId,
        cfg?.oauthClientSecret?.trim() || '',
        code,
        redirectUri,
        codeVerifier
      )

      if (!tokens.access_token) {
        throw new Error('Google 未回傳 access token')
      }

      const profile = await this.fetchUserInfo(tokens.access_token)

      // 防護網：只有列在「工作表3」授權清單內的 Gmail 才能登入
      const isAllowed = await allowedAccountsService.isEmailAllowed(profile.email, true)
      if (!isAllowed) {
        throw new Error(ACCOUNT_NOT_ALLOWED_MESSAGE)
      }

      if (tokens.refresh_token) {
        this.refreshToken = tokens.refresh_token
      }
      if (!this.refreshToken) {
        throw new Error('未取得 refresh token，請至 Google 帳號權限移除本 App 後重新登入')
      }

      const user = await this.withRole({ ...profile, authMethod: 'google' })
      this.accessToken = tokens.access_token
      this.accessTokenExpiresAt = Date.now() + (tokens.expires_in ?? 3600) * 1000
      this.user = user
      // Google 登入成功後清除先前的序號工作階段，避免下次啟動還原成序號身分
      this.removeSessionFile(this.serialSessionFilePath)
      this.persistSession()
      this.state = { status: 'authenticated', user }
      return { ok: true, user }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      this.state = { status: 'unauthenticated', user: null, error }
      return { ok: false, error }
    }
  }

  /** 啟動 loopback server、開啟同意畫面，並等待授權碼 */
  private openConsentAndWait(
    clientId: string,
    state: string,
    codeChallenge: string
  ): Promise<{ code: string; redirectUri: string }> {
    return new Promise((resolve, reject) => {
      let settled = false
      const server = createServer()

      const finish = (error: Error | null, value?: { code: string; redirectUri: string }): void => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        try {
          server.close()
        } catch {
          // ignore
        }
        if (error) reject(error)
        else resolve(value as { code: string; redirectUri: string })
      }

      const timer = setTimeout(() => {
        finish(new Error('Google 登入逾時（5 分鐘），請重試'))
      }, LOGIN_TIMEOUT_MS)

      server.once('error', (err: Error) => finish(err))

      server.on('request', (req, res) => {
        const requestUrl = new URL(req.url || '/', 'http://127.0.0.1')
        if (requestUrl.pathname !== '/') {
          res.statusCode = 404
          res.end('Not found')
          return
        }

        const port = (server.address() as AddressInfo).port
        const redirectUri = `http://127.0.0.1:${port}`
        const error = requestUrl.searchParams.get('error')
        const code = requestUrl.searchParams.get('code')
        const returnedState = requestUrl.searchParams.get('state')

        const respond = (ok: boolean, message: string): void => {
          // 瀏覽器已回到本機 redirect URI（授權完成），立刻把 App 視窗帶回前景，
          // 使用者不必手動切換視窗；登入成功後畫面也會自動由登入頁切換到主頁面。
          focusAppWindows()
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(renderResultPage(ok, message))
        }

        if (error) {
          respond(false, `Google 回報錯誤：${error}`)
          finish(new Error(`Google 授權失敗：${error}`))
          return
        }

        if (returnedState !== state) {
          respond(false, '登入狀態驗證失敗，請重新登入。')
          finish(new Error('登入狀態驗證失敗，請重新登入'))
          return
        }

        if (!code) {
          respond(false, '未取得 Google 授權碼。')
          finish(new Error('未取得 Google 授權碼'))
          return
        }

        respond(true, '登入成功，已自動切換回 Wishful AI Draw，可直接關閉此瀏覽器分頁。')
        finish(null, { code, redirectUri })
      })

      server.listen(0, '127.0.0.1', () => {
        const port = (server.address() as AddressInfo).port
        const redirectUri = `http://127.0.0.1:${port}`
        const authUrl = buildAuthUrl({ clientId, redirectUri, state, codeChallenge })
        shell.openExternal(authUrl).catch((err: Error) => finish(err))
      })
    })
  }

  private async exchangeCode(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string,
    codeVerifier: string
  ): Promise<TokenResponse> {
    const body = new URLSearchParams({
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier
    })
    if (clientSecret) body.set('client_secret', clientSecret)

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(GOOGLE_FETCH_TIMEOUT_MS)
    })
    const payload = (await response.json().catch(() => null)) as TokenResponse | null
    if (!response.ok || !payload) {
      throw new Error(`Google token 交換失敗：${describeTokenError(payload, response.status)}`)
    }
    return payload
  }

  private async refreshAccessToken(): Promise<{ accessToken: string; expiresAt: number }> {
    if (!this.refreshToken) throw new Error('尚未登入')

    const cfg = loadGoogleCredentials()
    const clientId = cfg?.oauthClientId?.trim() || process.env['GOOGLE_OAUTH_CLIENT_ID']?.trim()
    if (!clientId) throw new Error('尚未設定 Google OAuth Client ID')

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: clientId
    })
    const clientSecret = cfg?.oauthClientSecret?.trim() || ''
    if (clientSecret) body.set('client_secret', clientSecret)

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(GOOGLE_FETCH_TIMEOUT_MS)
    })
    const payload = (await response.json().catch(() => null)) as TokenResponse | null
    if (!response.ok || !payload?.access_token) {
      const detail = describeTokenError(payload, response.status)
      // invalid_grant = refresh token 已被撤銷／過期，必須重新登入
      const fatal =
        payload?.error === 'invalid_grant' || response.status === 400 || response.status === 401
      throw new GoogleAuthError(`Google 登入已失效：${detail}`, fatal)
    }

    return {
      accessToken: payload.access_token,
      expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000
    }
  }

  private async fetchUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(GOOGLE_FETCH_TIMEOUT_MS)
    })
    if (!response.ok) {
      throw new Error(`取得 Google 使用者資訊失敗（HTTP ${response.status}）`)
    }
    const payload = (await response.json().catch(() => null)) as {
      sub?: string
      email?: string
      name?: string
      picture?: string
    } | null

    if (!payload?.sub || !payload.email) {
      throw new Error('Google 使用者資訊格式不正確')
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      pictureUrl: payload.picture
    }
  }

  /** 登出並嘗試撤銷 refresh token */
  public async logout(): Promise<AuthState> {
    const tokenToRevoke = this.refreshToken
    this.clearSession()
    this.state = { status: 'unauthenticated', user: null }

    if (tokenToRevoke) {
      void fetch(`${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(tokenToRevoke)}`, {
        method: 'POST',
        signal: AbortSignal.timeout(GOOGLE_FETCH_TIMEOUT_MS)
      }).catch(() => {
        // 撤銷失敗不影響本機登出
      })
    }

    return this.state
  }

  private persistSession(): void {
    if (!this.refreshToken || !this.user) return
    try {
      const dir = app.getPath('userData')
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

      const payload = JSON.stringify({
        refreshToken: this.refreshToken,
        user: this.user
      } satisfies PersistedSession)

      const wrapper = safeStorage.isEncryptionAvailable()
        ? { encrypted: true, data: safeStorage.encryptString(payload).toString('base64') }
        : { encrypted: false, data: payload }

      writeFileSync(this.sessionFilePath, JSON.stringify(wrapper), 'utf-8')
    } catch (err) {
      console.error('保存 Google 登入狀態失敗：', err)
    }
  }

  private loadPersistedSession(): PersistedSession | null {
    try {
      if (!existsSync(this.sessionFilePath)) return null
      const raw = JSON.parse(readFileSync(this.sessionFilePath, 'utf-8')) as {
        encrypted?: boolean
        data?: string
      }
      if (!raw.data) return null

      const payload = raw.encrypted ? safeStorage.decryptString(Buffer.from(raw.data, 'base64')) : raw.data
      const parsed = JSON.parse(payload) as Partial<PersistedSession>
      if (typeof parsed.refreshToken !== 'string' || !parsed.user?.email) return null
      return {
        refreshToken: parsed.refreshToken,
        user: { ...parsed.user, authMethod: parsed.user.authMethod ?? 'google' }
      }
    } catch (err) {
      console.error('讀取 Google 登入狀態失敗：', err)
      return null
    }
  }

  /** 清除記憶體中的登入狀態與兩個工作階段檔（Google／序號） */
  private clearSession(): void {
    this.user = null
    this.refreshToken = null
    this.accessToken = null
    this.accessTokenExpiresAt = 0
    this.removeSessionFile(this.sessionFilePath)
    this.removeSessionFile(this.serialSessionFilePath)
  }

  private removeSessionFile(filePath: string): void {
    try {
      if (existsSync(filePath)) unlinkSync(filePath)
    } catch (err) {
      console.error('清除登入狀態檔失敗：', filePath, err)
    }
  }

  private persistSerialSession(): void {
    if (!this.user) return
    try {
      const dir = app.getPath('userData')
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

      const payload = JSON.stringify({ user: this.user } satisfies PersistedSerialSession)
      const wrapper = safeStorage.isEncryptionAvailable()
        ? { encrypted: true, data: safeStorage.encryptString(payload).toString('base64') }
        : { encrypted: false, data: payload }

      writeFileSync(this.serialSessionFilePath, JSON.stringify(wrapper), 'utf-8')
    } catch (err) {
      console.error('保存序號登入狀態失敗：', err)
    }
  }

  private loadPersistedSerialSession(): AuthUser | null {
    try {
      if (!existsSync(this.serialSessionFilePath)) return null
      const raw = JSON.parse(readFileSync(this.serialSessionFilePath, 'utf-8')) as {
        encrypted?: boolean
        data?: string
      }
      if (!raw.data) return null

      const payload = raw.encrypted
        ? safeStorage.decryptString(Buffer.from(raw.data, 'base64'))
        : raw.data
      const parsed = JSON.parse(payload) as Partial<PersistedSerialSession>
      const user = parsed.user
      if (!user?.email || !user.serial) return null
      return { ...user, authMethod: 'serial' }
    } catch (err) {
      console.error('讀取序號登入狀態失敗：', err)
      return null
    }
  }
}

export const googleAuthService = new GoogleAuthService()
