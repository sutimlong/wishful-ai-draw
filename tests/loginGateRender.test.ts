import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LoginGate } from '../src/renderer/src/components/LoginGate'

describe('LoginGate 登入畫面', () => {
  it('仍可正常渲染登入卡片（SSR 煙霧測試）', () => {
    const html = renderToStaticMarkup(React.createElement(LoginGate))

    expect(html).toContain('Wishful AI Draw')
    expect(html).toContain('請先登入（Google 帳號或序號）')
    expect(html).toContain('登入僅用於辨識使用者')
    expect(html).toContain('序號登入')
    expect(html).toContain('登入狀態會加密保存在本機')
    // 初始狀態為 loading（等待主程序還原登入狀態），需顯示連線提示
    expect(html).toContain('正在連線至 Google')
  })

  it('背景動畫圖層會掛載在卡片後方，且卡片在上層', () => {
    const html = renderToStaticMarkup(React.createElement(LoginGate))

    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('animate-aurora-slow')
    expect(html).toContain('animate-converge')
    // 內容層需高於背景
    expect(html).toContain('relative z-10 w-full max-w-md')
  })
})
