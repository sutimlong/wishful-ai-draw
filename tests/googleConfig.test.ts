import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const appPath = mkdtempSync(join(tmpdir(), 'wishful-google-config-'))
process.env['TEST_GOOGLE_APP_PATH'] = appPath

vi.mock('electron', () => ({
  app: {
    getAppPath: () => process.env['TEST_GOOGLE_APP_PATH'] as string
  }
}))

const { loadGoogleCredentials, resetGoogleCredentialsCache } = await import(
  '../src/main/services/googleConfig'
)

const credentialsPath = join(appPath, 'resources', 'google-credentials.json')

function writeCredentials(content: string): void {
  mkdirSync(join(appPath, 'resources'), { recursive: true })
  writeFileSync(credentialsPath, content, 'utf-8')
}

describe('loadGoogleCredentials', () => {
  beforeEach(() => {
    resetGoogleCredentialsCache()
    process.env['GOOGLE_CREDENTIALS_FILE'] = credentialsPath
    rmSync(credentialsPath, { force: true })
  })

  afterAll(() => {
    delete process.env['GOOGLE_CREDENTIALS_FILE']
    delete process.env['TEST_GOOGLE_APP_PATH']
    rmSync(appPath, { recursive: true, force: true })
  })

  it('憑證檔不存在時回傳 null', () => {
    expect(loadGoogleCredentials()).toBeNull()
  })

  it('讀取並解析憑證檔', () => {
    writeCredentials(
      JSON.stringify({
        oauthClientId: 'client-id',
        driveFolderId: 'folder-id',
        serviceAccount: { client_email: 'sa@example.com', private_key: 'key' }
      })
    )

    expect(loadGoogleCredentials()).toMatchObject({
      oauthClientId: 'client-id',
      driveFolderId: 'folder-id'
    })
  })

  it('JSON 格式錯誤時回傳 null', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    writeCredentials('{ not valid json')

    expect(loadGoogleCredentials()).toBeNull()
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })

  it('讀取結果會快取，直到清除快取才重新讀檔', () => {
    expect(loadGoogleCredentials()).toBeNull()

    writeCredentials(JSON.stringify({ oauthClientId: 'late-client' }))

    // 已快取（null），不會重新讀取
    expect(loadGoogleCredentials()).toBeNull()

    resetGoogleCredentialsCache()
    expect(loadGoogleCredentials()).toMatchObject({ oauthClientId: 'late-client' })
  })
})
