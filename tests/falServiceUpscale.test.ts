import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  BackgroundRemovalFeatureConfig,
  FaceRestoreFeatureConfig,
  ResizeFeatureConfig,
  UpscaleFeatureConfig
} from '../src/shared/types'

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

function makeUpscaleCfg(factor: number): UpscaleFeatureConfig {
  return {
    enabled: true,
    factor,
    creativity: 0.35,
    resemblance: 0.6,
    guidanceScale: 4,
    numInferenceSteps: 18,
    negativePrompt: 'bad',
    seed: 42
  }
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
      makeUpscaleCfg(2),
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
          upscale_factor: 2,
          creativity: 0.35,
          resemblance: 0.6
        })
      })
    )
  })

  it('放大倍率會被夾取在 1~4 的整數範圍內', async () => {
    subscribeMock.mockResolvedValue({ data: { image: { url: 'https://fal.media/x.png' } } })

    const { FalService } = await loadService()
    const service = new FalService()

    await service.executeUpscale('https://fal.media/a.png', makeUpscaleCfg(10), 'fal-key', {
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
      service.executeUpscale('https://fal.media/a.png', makeUpscaleCfg(2), '', {
        onStatusUpdate: () => {},
        signal: new AbortController().signal
      })
    ).rejects.toMatchObject({ status: 401 })
  })
})

describe('FalService 其他後處理功能', () => {
  beforeEach(() => {
    subscribeMock.mockClear()
    configMock.mockClear()
    subscribeMock.mockResolvedValue({ data: { image: { url: 'https://fal.media/out.png' } } })
  })

  it('executeBackgroundRemoval 呼叫 birefnet', async () => {
    const { FalService, BACKGROUND_REMOVAL_ENDPOINT_ID } = await loadService()
    const cfg: BackgroundRemovalFeatureConfig = {
      enabled: true,
      model: 'Portrait',
      operatingResolution: '2048x2048',
      refineForeground: false,
      outputFormat: 'webp'
    }
    await new FalService().executeBackgroundRemoval('https://fal.media/in.png', cfg, 'k', {
      onStatusUpdate: () => {},
      signal: new AbortController().signal
    })
    expect(subscribeMock).toHaveBeenCalledWith(
      BACKGROUND_REMOVAL_ENDPOINT_ID,
      expect.objectContaining({
        input: expect.objectContaining({ image_url: 'https://fal.media/in.png', model: 'Portrait' })
      })
    )
  })

  it('executeResize 呼叫 fal-image-resize', async () => {
    const { FalService, RESIZE_ENDPOINT_ID } = await loadService()
    const cfg: ResizeFeatureConfig = { enabled: true, width: 800, height: 600, fit: 'cover', outputFormat: 'png' }
    await new FalService().executeResize('https://fal.media/in.png', cfg, 'k', {
      onStatusUpdate: () => {},
      signal: new AbortController().signal
    })
    expect(subscribeMock).toHaveBeenCalledWith(
      RESIZE_ENDPOINT_ID,
      expect.objectContaining({
        input: expect.objectContaining({ width: 800, height: 600, fit: 'cover' })
      })
    )
  })

  it('executeFaceRestore 呼叫 codeformer', async () => {
    const { FalService, FACE_RESTORE_ENDPOINT_ID } = await loadService()
    const cfg: FaceRestoreFeatureConfig = {
      enabled: true,
      fidelity: 0.8,
      upscaleFactor: 2,
      faceUpscale: true,
      aligned: false,
      onlyCenterFace: true,
      seed: 7
    }
    await new FalService().executeFaceRestore('https://fal.media/in.png', cfg, 'k', {
      onStatusUpdate: () => {},
      signal: new AbortController().signal
    })
    expect(subscribeMock).toHaveBeenCalledWith(
      FACE_RESTORE_ENDPOINT_ID,
      expect.objectContaining({
        input: expect.objectContaining({ fidelity: 0.8, face_upscale: true, only_center_face: true })
      })
    )
  })
})
