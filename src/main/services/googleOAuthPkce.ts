/** Google OAuth 授權請求使用的 scope（僅登入辨識用，不存取雲端硬碟或試算表） */
export const OAUTH_SCOPES = ['openid', 'email', 'profile']

/** buffer → base64url（PKCE code_verifier / code_challenge 與 state 使用） */
export function base64Url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** 建立 Google 授權 URL（含 PKCE S256） */
export function buildAuthUrl(params: {
  clientId: string
  redirectUri: string
  state: string
  codeChallenge: string
}): string {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', params.clientId)
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', OAUTH_SCOPES.join(' '))
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('include_granted_scopes', 'true')
  url.searchParams.set('state', params.state)
  url.searchParams.set('code_challenge', params.codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}

/** 簡單 HTML escape，避免將外部字串（如 Google 回傳的 error）直接插入結果頁 */
function escapeHtml(value: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return value.replace(/[&<>"']/g, (ch) => map[ch] as string)
}

/** 登入完成後顯示在使用者瀏覽器中的結果頁 */
export function renderResultPage(success: boolean, message: string): string {
  const color = success ? '#34d399' : '#f87171'
  const title = success ? '登入成功' : '登入失敗'
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<title>Wishful AI Draw</title></head>
<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;color:#e4e4e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="text-align:center;padding:32px">
<div style="font-size:20px;font-weight:700;color:${color};margin-bottom:8px">${title}</div>
<p style="font-size:14px;color:#a1a1aa;margin:0">${escapeHtml(message)}</p>
</div></body></html>`
}
