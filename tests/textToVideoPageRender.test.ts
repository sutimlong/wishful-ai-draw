import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  TopBar,
  getOutputDirectoryLabel,
  resolveActiveOutputDirectory
} from '../src/renderer/src/components/TopBar'
import { TextToVideoPage } from '../src/renderer/src/components/TextToVideoPage'
import { ImageToVideoPage } from '../src/renderer/src/components/ImageToVideoPage'
import { ChatSuggestedModelsBar } from '../src/renderer/src/components/ChatSuggestedModelsBar'
import { FAL_IMAGE_TO_VIDEO_MODELS } from '../src/shared/falImageToVideoModels'
import { FAL_TEXT_TO_VIDEO_MODELS } from '../src/shared/falTextToVideoModels'
import { useAppViewStore } from '../src/renderer/src/store/useAppViewStore'
import { useBatchStore } from '../src/renderer/src/store/useBatchStore'
import {
  useImageToVideoStore,
  useTextToVideoStore
} from '../src/renderer/src/store/useTextToVideoStore'

describe('文字生成影片頁面與 TopBar 導覽渲染', () => {
  beforeEach(() => {
    useAppViewStore.setState({ activeView: 'stylize' })
    useBatchStore.setState({
      outputDirectories: {
        stylize: '/Users/tester/Pictures/Wishful_Ai_Draw',
        textToImage: '/Users/tester/Pictures/Wishful_Ai_Draw/文生圖',
        textToVideo: '/Users/tester/Pictures/Wishful_Ai_Draw/文生影片',
        imageToVideo: '/Users/tester/Pictures/Wishful_Ai_Draw/圖生影片'
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('TopBar 切換至文字生成影片與圖片生成影片分頁時應顯示對應輸出資料夾與選取狀態', () => {
    useAppViewStore.getState().setActiveView('text-to-video')
    // React renderToStaticMarkup 透過 getServerSnapshot 读取 getInitialState
    vi.spyOn(useAppViewStore, 'getInitialState').mockReturnValue(useAppViewStore.getState())
    vi.spyOn(useBatchStore, 'getInitialState').mockReturnValue(useBatchStore.getState())

    const html = renderToStaticMarkup(React.createElement(TopBar))
    expect(html).toContain('文字生成影片')
    expect(html).toContain('文生影片輸出')
    expect(html).toContain('文生影片')

    const pressed = [...html.matchAll(/aria-pressed="(true|false)"/g)].map((m) => m[1])
    expect(pressed).toEqual(['false', 'false', 'true', 'false'])

    useAppViewStore.getState().setActiveView('image-to-video')
    vi.spyOn(useAppViewStore, 'getInitialState').mockReturnValue(useAppViewStore.getState())
    const img2vidHtml = renderToStaticMarkup(React.createElement(TopBar))
    expect(img2vidHtml).toContain('圖片生成影片')
    expect(img2vidHtml).toContain('圖生影片輸出')
    expect(img2vidHtml).toContain('圖生影片')
    const img2vidPressed = [...img2vidHtml.matchAll(/aria-pressed="(true|false)"/g)].map((m) => m[1])
    expect(img2vidPressed).toEqual(['false', 'false', 'false', 'true'])
  })

  it('resolveActiveOutputDirectory 與 getOutputDirectoryLabel 應正確對應四種頁面', () => {
    const dirs = {
      stylize: '/Pic/Wishful_Ai_Draw',
      textToImage: '/Pic/Wishful_Ai_Draw/文生圖',
      textToVideo: '/Pic/Wishful_Ai_Draw/文生影片',
      imageToVideo: '/Pic/Wishful_Ai_Draw/圖生影片'
    }
    expect(resolveActiveOutputDirectory('stylize', '/Custom', dirs)).toBe('/Custom')
    expect(resolveActiveOutputDirectory('text-to-image', '/Custom', dirs)).toBe(dirs.textToImage)
    expect(resolveActiveOutputDirectory('text-to-video', '/Custom', dirs)).toBe(dirs.textToVideo)
    expect(resolveActiveOutputDirectory('image-to-video', '/Custom', dirs)).toBe(dirs.imageToVideo)
    expect(getOutputDirectoryLabel('stylize')).toBe('風格化輸出')
    expect(getOutputDirectoryLabel('text-to-image')).toBe('文生圖輸出')
    expect(getOutputDirectoryLabel('text-to-video')).toBe('文生影片輸出')
    expect(getOutputDirectoryLabel('image-to-video')).toBe('圖生影片輸出')
  })

  it('TextToVideoPage 應渲染提示詞模式、對話模式與全部同步文生影片模型選項', () => {
    const html = renderToStaticMarkup(React.createElement(TextToVideoPage))
    expect(html).toContain('文字生成影片')
    expect(html).toContain('提示詞模式')
    expect(html).toContain('對話模式')
    expect(html).toContain('提示詞 (Prompt)')
    expect(html).toContain('AI 優化')
    expect(html).toContain('參考圖（選用）')
    expect(html).toContain('風格預設')
    expect(html).toContain(`AI 模型（${FAL_TEXT_TO_VIDEO_MODELS.length} 個 fal.ai 文生影片模型）`)
    expect(useTextToVideoStore.getState().endpointId).toBe(
      'google/gemini-omni-flash/v1.2/text-to-video'
    )
    expect(html).toMatch(
      /<option(?=[^>]*selected="")[^>]*value="google\/gemini-omni-flash\/v1\.2\/text-to-video"/
    )
    expect(html).toContain('google/gemini-omni-flash/v1.2/text-to-video')
    expect(html).toContain('minimax/h3-max-turbo/text-to-video')
    expect(html).toContain('fal-ai/kling-video/v3/pro/text-to-video')
    expect(html).toContain('畫面比例')
    expect(html).toContain('影片長度')
    expect(html).toContain('輸出畫質')
    expect(html).toContain('原生音效')
    expect(html).toContain('開啟原生音效')
    expect(html).toContain('開始生成（5 秒）')
    expect(html).toContain('生成的影片會顯示在這裡')
    expect(html).toContain('DeepSeek 對話')
    expect(html).toContain('和 DeepSeek 一起完成影片')
    expect(html).toContain('上傳圖片')
    expect(html).toContain('模型與生成參數')
    expect(html).toContain('對話中的生成參考圖')
  })

  it('ImageToVideoPage 應渲染提示詞模式、對話模式與全部同步圖生影片模型選項', () => {
    const html = renderToStaticMarkup(React.createElement(ImageToVideoPage))
    expect(html).toContain('圖片生成影片')
    expect(html).toContain('提示詞模式')
    expect(html).toContain('對話模式')
    expect(html).toContain('來源圖片（首幀必填，可選第 2 張尾幀）')
    expect(html).toContain('提示詞 (Prompt)')
    expect(html).toContain('AI 優化')
    expect(html).toContain('風格預設')
    expect(html).toContain(`AI 模型（${FAL_IMAGE_TO_VIDEO_MODELS.length} 個 fal.ai 圖生影片模型）`)
    expect(useImageToVideoStore.getState().endpointId).toBe(
      'google/gemini-omni-flash/v1.2/image-to-video'
    )
    expect(html).toMatch(
      /<option(?=[^>]*selected="")[^>]*value="google\/gemini-omni-flash\/v1\.2\/image-to-video"/
    )
    expect(html).toContain('google/gemini-omni-flash/v1.2/image-to-video')
    expect(html).toContain('google/gemini-omni-flash/v1.2/reference-to-video')
    expect(html).toContain('fal-ai/kling-video/v3/pro/image-to-video')
    expect(html).toContain('minimax/h3-max/image-to-video')
    expect(html).toContain('和 DeepSeek 一起讓圖片動起來')
    expect(html).toContain('對話中的來源圖片')
  })

  it('ChatSuggestedModelsBar 應渲染一或多個可切換的模型按鈕，並在已切換後顯示確認狀態', () => {
    const htmlWithButtons = renderToStaticMarkup(
      React.createElement(ChatSuggestedModelsBar, {
        suggestedModelId: 'fal-ai/kling-video/v3/pro/text-to-video',
        suggestedModelIds: [
          'fal-ai/kling-video/v3/pro/text-to-video',
          'minimax/h3-max-turbo/text-to-video'
        ],
        models: FAL_TEXT_TO_VIDEO_MODELS,
        currentEndpointId: 'google/gemini-omni-flash/v1.2/text-to-video',
        onSelectModel: () => undefined
      })
    )
    expect(htmlWithButtons).toContain('切換模型：Kling Video v3 Text to Video [Pro]')
    expect(htmlWithButtons).toContain('切換模型：H3 Max Turbo Text to Video')

    const htmlAfterSwitch = renderToStaticMarkup(
      React.createElement(ChatSuggestedModelsBar, {
        suggestedModelId: 'fal-ai/kling-video/v3/pro/text-to-video',
        suggestedModelIds: [
          'fal-ai/kling-video/v3/pro/text-to-video',
          'minimax/h3-max-turbo/text-to-video'
        ],
        models: FAL_TEXT_TO_VIDEO_MODELS,
        currentEndpointId: 'fal-ai/kling-video/v3/pro/text-to-video',
        onSelectModel: () => undefined
      })
    )
    expect(htmlAfterSwitch).toContain('已切換至建議模型：Kling Video v3 Text to Video [Pro]')
    expect(htmlAfterSwitch).toContain('切換模型：H3 Max Turbo Text to Video')

    const emptyHtml = renderToStaticMarkup(
      React.createElement(ChatSuggestedModelsBar, {
        models: FAL_TEXT_TO_VIDEO_MODELS,
        currentEndpointId: 'google/gemini-omni-flash/v1.2/text-to-video',
        onSelectModel: () => undefined
      })
    )
    expect(emptyHtml).toBe('')
  })
})
