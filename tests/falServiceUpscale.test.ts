import { beforeEach, describe, expect, it, vi } from 'vitest'

const { subscribeMock, configMock } = vi.hoisted(() => ({
  subscribeMock: vi.fn(),
  configMock: vi.fn()
}))

vi.mock('@fal-ai/client', () => ({
  fal: {
    config: configMock,
    subscribe: subscribeMock,
    storage: { upload: vi.fn() }
  }
}))

vi.mock('fs/promises', () => ({
  readFile: vi.fn()
}))

async function loadService(): Promise<typeof import('../src/main/services/falService')> {
  vi.resetModules()
  return import('../src/main/services/falService')
}

describe('FalService.executeUpscale', () => {
  beforeEach(() => {
    subscribeMock.mockClear()
    configMock.mockClear()
  })

  it('呼叫 clarity-upscaler 並回傳放大後圖片 URL 與 requestId', async () => {
    subscribeMock.mockResolvedValue({
      requestId: 'req-upscale-1',
      data: { image: { url: 'https://fal.media/upscaled.png' } }
    })

    const { FalService, UPSCALE_ENDPOINT_ID } = await loadService()
    const service = new FalService()

    const result = await service.executeUpscale(
      'https://fal.media/original.png',
      2,
      'fal-key-1',
      { onStatusUpdate: () => {}, signal: new AbortController().signal }
    )

    expect(result.outputImageUrl).toBe('https://fal.media/upscaled.png')
    expect(result.requestId).toBe('req-upscale-1')
    expect(configMock).toHaveBeenCalledWith({ credentials: 'fal-key-1' })
    expect(subscribeMock).toHaveBeenCalledWith(
      UPSCALE_ENDPOINT_ID,
      expect.objectContaining({
        input: expect.objectContaining({
          image_url: 'https://fal.media/original.png',
          upscale_factor: 2
        })
      })
    )
  })

  it('放大倍率會被夾取在 1~4 的整數範圍內', async () => {
    subscribeMock.mockResolvedValue({ data: { image: { url: 'https://fal.media/x.png' } } })

    const { FalService } = await loadService()
    const service = new FalService()

    await service.executeUpscale('https://fal.media/a.png', 10, 'fal-key', {
      onStatusUpdate: () => {},
      signal: new AbortController().signal
    })

    const input = subscribeMock.mock.calls[0][1].input as Record<string, unknown>
    expect(input.upscale_factor).toBe(4)
  })

  it('缺少 API Key 時拋出 401 錯誤', async () => {
    const { FalService } = await loadService()
    const service = new FalService()

    await expect(
      service.executeUpscale('https://fal.media/a.png', 2, '', {
        onStatusUpdate: () => {},
        signal: new AbortController().signal
      })
    ).rejects.toMatchObject({ status: 401 })
  })
})
