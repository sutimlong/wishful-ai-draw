import { describe, expect, it } from 'vitest'
import { base64Url, buildAuthUrl, renderResultPage } from '../src/main/services/googleOAuthPkce'

describe('googleOAuthPkce', () => {
  it('base64Url 產生不含 + / = 的 URL-safe 字串', () => {
    const encoded = base64Url(Buffer.from([0xfb, 0xff, 0xbf, 0x00]))
    expect(encoded).not.toMatch(/[+/=]/)
    expect(encoded).toBe('-_-_AA')
  })

  it('buildAuthUrl 帶入 PKCE 與離線授權必要參數', () => {
    const url = new URL(
      buildAuthUrl({
        clientId: 'client-123.apps.googleusercontent.com',
        redirectUri: 'http://127.0.0.1:51234',
        state: 'state-abc',
        codeChallenge: 'challenge-xyz'
      })
    )

    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth')
    expect(url.searchParams.get('client_id')).toBe('client-123.apps.googleusercontent.com')
    expect(url.searchParams.get('redirect_uri')).toBe('http://127.0.0.1:51234')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('scope')).toBe('openid email profile')
    expect(url.searchParams.get('access_type')).toBe('offline')
    expect(url.searchParams.get('prompt')).toBe('consent')
    expect(url.searchParams.get('state')).toBe('state-abc')
    expect(url.searchParams.get('code_challenge')).toBe('challenge-xyz')
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
  })

  it('renderResultPage 會 escape 外部訊息', () => {
    const html = renderResultPage(false, '<script>alert(1)</script>')
    expect(html).toContain('登入失敗')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
  })
})
