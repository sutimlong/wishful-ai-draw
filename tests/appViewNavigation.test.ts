import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { TopBar } from '../src/renderer/src/components/TopBar'
import { TextToImagePage } from '../src/renderer/src/components/TextToImagePage'
import { APP_VIEWS, useAppViewStore } from '../src/renderer/src/store/useAppViewStore'

afterEach(() => {
  useAppViewStore.setState({ activeView: 'stylize' })
})

describe('主功能頁面切換', () => {
  it('預設停留在影像風格化頁面，並提供四種頁面設定', () => {
    expect(useAppViewStore.getState().activeView).toBe('stylize')
    expect(APP_VIEWS.map((view) => view.id)).toEqual([
      'stylize',
      'text-to-image',
      'text-to-video',
      'image-to-video'
    ])
    expect(APP_VIEWS.map((view) => view.label)).toEqual([
      '影像風格化',
      '文字生成圖片',
      '文字生成影片',
      '圖片生成影片'
    ])
    // 每個頁面都要有說明文字（滑鼠移入提示）
    for (const view of APP_VIEWS) {
      expect(view.description.length).toBeGreaterThan(0)
    }
  })

  it('可以切換到文字生成圖片頁面，再切回影像風格化', () => {
    useAppViewStore.getState().setActiveView('text-to-image')
    expect(useAppViewStore.getState().activeView).toBe('text-to-image')

    useAppViewStore.getState().setActiveView('stylize')
    expect(useAppViewStore.getState().activeView).toBe('stylize')
  })
})

describe('TopBar 頁面切換按鈕', () => {
  it('同時渲染四個分頁按鈕，且預設標記影像風格化為選取狀態', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar))

    expect(html).toContain('aria-label="主功能頁面切換"')
    expect(html).toContain('影像風格化')
    expect(html).toContain('文字生成圖片')
    expect(html).toContain('文字生成影片')
    expect(html).toContain('圖片生成影片')
    // 四個按鈕都要有 aria-pressed 狀態，預設只有影像風格化為 true
    const pressed = [...html.matchAll(/aria-pressed="(true|false)"/g)].map((m) => m[1])
    expect(pressed).toEqual(['true', 'false', 'false', 'false'])
    // TopBar 已移除總數／完成／處理中統計膠囊，避免與右側按鈕重疊
    expect(html).not.toContain('總數')
    expect(html).not.toContain('完成')
    expect(html).not.toContain('處理中')
    // TopBar 會顯示目前頁面的輸出資料夾標籤
    expect(html).toContain('風格化輸出')
  })
})

describe('文字生成圖片頁面', () => {
  it('渲染提示詞、風格預設、模型選擇與生成參數區塊', () => {
    const html = renderToStaticMarkup(React.createElement(TextToImagePage))

    expect(html).toContain('文字生成圖片')
    expect(html).toContain('提示詞 (Prompt)')
    expect(html).toContain('AI 優化')
    expect(html).toContain('風格預設')
    for (const label of ['電影感', '動漫插畫', '寫實攝影', '3D 渲染', '水彩手繪']) {
      expect(html).toContain(label)
    }
    expect(html).toContain('AI 模型（')
    expect(html).toContain('參考圖（選用）')
    expect(html).toContain('加入參考圖')
    expect(html).toContain('生成參數')
    expect(html).toContain('畫面比例')
    expect(html).toContain('1024 × 1024 方形')
    expect(html).toContain('生成張數')
    expect(html).toContain('輸出格式')
    expect(html).toContain('PNG')
    expect(html).toContain('JPEG')
  })

  it('生成按鈕在未輸入提示詞時停用，且結果區已接上生成流程', () => {
    const html = renderToStaticMarkup(React.createElement(TextToImagePage))

    // 初始 prompt 為空 → 生成按鈕停用
    expect(html).toContain('disabled=""')
    expect(html).toContain('開始生成（1 張）')
    expect(html).toContain('生成的圖片會顯示在這裡')
  })

  it('提供提示詞模式與對話模式切換，並渲染 DeepSeek 對話介面', () => {
    const html = renderToStaticMarkup(React.createElement(TextToImagePage))

    expect(html).toContain('aria-label="文字生成圖片模式切換"')
    expect(html).toContain('提示詞模式')
    expect(html).toContain('對話模式')
    expect(html).toContain('DeepSeek 對話')
    expect(html).toContain('deepseek-flash')
    expect(html).toContain('和 DeepSeek 一起完成圖片')
    expect(html).toContain('上傳圖片')
    // 提示詞與對話模式共用模型資料庫，但使用不同的 DOM id
    expect(html.match(/id="text-to-image-model"/g)?.length).toBe(1)
    expect(html.match(/id="text-to-image-chat-model"/g)?.length).toBe(1)
  })
})
