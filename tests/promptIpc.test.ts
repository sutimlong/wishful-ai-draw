import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OptimizePromptResult } from '../src/shared/types'

type IpcHandler = (event: unknown, prompt: string) => Promise<OptimizePromptResult>

const { handlers, optimizePrompt, recordPromptOptimization } = vi.hoisted(() => ({
  handlers: new Map<string, IpcHandler>(),
  optimizePrompt: vi.fn(),
  recordPromptOptimization: vi.fn()
}))

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, handler: IpcHandler) => {
      handlers.set(channel, handler)
    }
  }
}))

vi.mock('../src/main/services/deepSeekService', () => ({
  DEEPSEEK_MODEL: 'deepseek-chat',
  optimizePrompt: (...args: unknown[]) => optimizePrompt(...args)
}))

vi.mock('../src/main/services/usageLoggerWiring', () => ({
  usageLogger: {
    recordPromptOptimization: (...args: unknown[]) => recordPromptOptimization(...args)
  }
}))

vi.mock('../src/main/services/store', () => ({
  getSettingsStore: () => ({
    getSettings: () => ({ deepseekApiKey: 'sk-test' })
  })
}))

import { IPC_CHANNELS } from '../src/shared/ipc-channels'
import { registerPromptIpc } from '../src/main/ipc/prompt.ipc'

function getHandler(): IpcHandler {
  const handler = handlers.get(IPC_CHANNELS.PROMPT_OPTIMIZE)
  if (!handler) throw new Error('尚未註冊提示詞優化 IPC handler')
  return handler
}

describe('prompt.ipc', () => {
  beforeEach(() => {
    handlers.clear()
    optimizePrompt.mockReset()
    recordPromptOptimization.mockReset()
    registerPromptIpc()
  })

  it('優化成功時回傳提示詞，並寫入 Prompt word_optimization 使用記錄', async () => {
    optimizePrompt.mockResolvedValue('a cat sitting by the window, moonlight')

    const result = await getHandler()({}, '一隻貓坐在窗邊')

    expect(result).toEqual({ ok: true, prompt: 'a cat sitting by the window, moonlight' })
    expect(optimizePrompt).toHaveBeenCalledWith('一隻貓坐在窗邊', { apiKey: 'sk-test' })
    expect(recordPromptOptimization).toHaveBeenCalledWith('一隻貓坐在窗邊', {
      model: 'deepseek-chat'
    })
  })

  it('優化失敗時不寫入使用記錄，回傳錯誤訊息', async () => {
    optimizePrompt.mockRejectedValue(new Error('DeepSeek 服務暫時無法使用'))

    const result = await getHandler()({}, '一隻貓')

    expect(result).toEqual({ ok: false, message: 'DeepSeek 服務暫時無法使用' })
    expect(recordPromptOptimization).not.toHaveBeenCalled()
  })

  it('使用記錄寫入失敗不影響優化結果', async () => {
    optimizePrompt.mockResolvedValue('a cat')
    recordPromptOptimization.mockImplementation(() => {
      throw new Error('sheet unavailable')
    })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const result = await getHandler()({}, '貓')

    expect(result).toEqual({ ok: true, prompt: 'a cat' })
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })
})
