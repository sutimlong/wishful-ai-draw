import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SidebarConfig } from '../src/renderer/src/components/SidebarConfig'

describe('SidebarConfig 模型選擇', () => {
  it('渲染完整模型目錄，並預設選用 GPT Image 2.6 Sunburst', () => {
    const html = renderToStaticMarkup(React.createElement(SidebarConfig))

    expect(html).toContain('AI 模型選擇 (fal.ai)')
    // 預設模型需被標記為 selected，且出現在精選分組中
    expect(html).toContain('GPT Image 2.6 Sunburst')
    expect(html).toMatch(/<option value="fal-ai\/gpt-image-2\.6-sunburst\/edit" selected="">/)
    // 分組與搜尋框都要出現
    expect(html).toContain('精選推薦（已驗證）')
    expect(html).toContain('optgroup')
    expect(html).toContain('搜尋 280 個 fal.ai 模型')
  })

  it('每個模型選項後面都附上生成一張圖片的預估金額', () => {
    const html = renderToStaticMarkup(React.createElement(SidebarConfig))
    const optionTexts = [...html.matchAll(/<option[^>]*>([^<]*)<\/option>/g)].map((match) => match[1])
    const modelOptions = optionTexts.filter((text) => text.includes(' — '))

    expect(modelOptions.length).toBeGreaterThan(250)
    for (const text of modelOptions) {
      // 形如「模型名稱 — $0.04 / 張」；無法換算單張的模型也要標示計價基準
      expect(text).toMatch(/ — (?:~?\$[\d.]+ \/ \S+|依 token 用量|未公布單價)$/)
    }
    expect(modelOptions.some((text) => /\$[\d.]+ \/ 張$/.test(text))).toBe(true)
    // 預設模型（GPT Image 2.6 Sunburst）需顯示預估金額
    expect(html).toMatch(/GPT Image 2\.6 Sunburst \(OpenAI\) — ~?\$[\d.]+ \/ 張/)
    // 選取後要顯示換算依據
    expect(html).toContain('生成一張圖片的預估費用')
    expect(html).toContain('1024×1024')
  })
})
