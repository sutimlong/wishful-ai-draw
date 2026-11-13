import { afterEach, describe, expect, it, vi } from 'vitest'

const { uploadMock, configMock, readFileMock } = vi.hoisted(() => ({
  uploadMock: vi.fn(),
  configMock: vi.fn(),
  readFileMock: vi.fn()
}))

vi.mock('@fal-ai/client', () => ({
  fal: {
    config: configMock,
    storage: { upload: uploadMock },
    subscribe: vi.fn()
  }
}))

vi.mock('fs/promises', () => ({
  readFile: readFileMock
}))

async function loadService(): Promise<
  typeof import('../src/main/services/falService').FalService
> {
  vi.resetModules()
  const mod = await import('../src/main/services/falService')
  return mod.FalService
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('FalService.uploadLocalImage', () => {
  it('同一張圖片被多個任務同時上傳時，只會真正上傳一次（in-flight 去重）', async () => {
    const FalService = await loadService()
    readFileMock.mockResolvedValue(Buffer.from('fake-image-bytes'))
    uploadMock.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 20))
      return 'https://fal.media/shared-upload.png'
    })

    const service = new FalService()
    const [a, b, c] = await Promise.all([
      service.uploadLocalImage('/tmp/img-1.png', undefined, 'fal-key-1'),
      service.uploadLocalImage('/tmp/img-1.png', undefined, 'fal-key-1'),
      service.uploadLocalImage('/tmp/img-1.png', undefined, 'fal-key-1')
    ])

    expect(uploadMock).toHaveBeenCalledTimes(1)
    expect(readFileMock).toHaveBeenCalledTimes(1)
    expect([a, b, c]).toEqual([
      'https://fal.media/shared-upload.png',
      'https://fal.media/shared-upload.png',
      'https://fal.media/shared-upload.png'
    ])
    // 上傳前必須先設定 fal client 憑證，否則 fal.storage 會因缺少 API Key 失敗
    expect(configMock).toHaveBeenCalledWith({ credentials: 'fal-key-1' })

    // 第二次呼叫命中快取，不會再上傳
    expect(await service.uploadLocalImage('/tmp/img-1.png', undefined, 'fal-key-1')).toBe(
      'https://fal.media/shared-upload.png'
    )
    expect(uploadMock).toHaveBeenCalledTimes(1)
  })

  it('已有遠端網址時直接沿用，不重新上傳也不設定憑證', async () => {
    const FalService = await loadService()
    const service = new FalService()

    const url = await service.uploadLocalImage('/tmp/img-2.png', 'https://fal.media/ready.png')

    expect(url).toBe('https://fal.media/ready.png')
    expect(uploadMock).not.toHaveBeenCalled()
    expect(readFileMock).not.toHaveBeenCalled()
    expect(configMock).not.toHaveBeenCalled()
  })

  it('上傳失敗時清除 in-flight 狀態，之後可以重新嘗試', async () => {
    const FalService = await loadService()
    readFileMock.mockResolvedValue(Buffer.from('fake-image-bytes'))
    uploadMock.mockRejectedValueOnce(new Error('fal.storage 連線逾時'))
    uploadMock.mockResolvedValueOnce('https://fal.media/retry-ok.png')

    const service = new FalService()
    await expect(service.uploadLocalImage('/tmp/img-3.png', undefined, 'fal-key-1')).rejects.toThrow(
      'fal.storage 連線逾時'
    )

    expect(await service.uploadLocalImage('/tmp/img-3.png', undefined, 'fal-key-1')).toBe(
      'https://fal.media/retry-ok.png'
    )
    expect(uploadMock).toHaveBeenCalledTimes(2)
  })
})
