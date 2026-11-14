import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { DeepSeekBalance } from '../src/shared/types'
import {
  DeepSeekBalancePanel,
  formatDeepSeekAmount,
  getDeepSeekBadgeText
} from '../src/renderer/src/components/DeepSeekBalancePanel'

const SAMPLE_BALANCE: DeepSeekBalance = {
  totalBalance: 1.1,
  currency: 'USD',
  grantedBalance: 0,
  toppedUpBalance: 1.1,
  isAvailable: true
}

describe('DeepSeekBalancePanel', () => {
  it('初始狀態渲染 DeepSeek 金鑰徽章（SSR 煙霧測試）', () => {
    const html = renderToStaticMarkup(React.createElement(DeepSeekBalancePanel))

    expect(html).toContain('DeepSeek Key')
    expect(html).toContain('lucide-sparkles')
    expect(html).not.toContain('目前餘額')
  })
})

describe('getDeepSeekBadgeText', () => {
  it('有餘額時顯示金額', () => {
    expect(getDeepSeekBadgeText('ready', SAMPLE_BALANCE)).toBe('$1.10')
  })

  it('載入中、金鑰無效、其他錯誤與未查詢時顯示對應提示', () => {
    expect(getDeepSeekBadgeText('loading', null)).toBe('DeepSeek …')
    expect(getDeepSeekBadgeText('unauthorized', null)).toBe('DeepSeek Key 無效')
    expect(getDeepSeekBadgeText('error', null)).toBe('DeepSeek 額度 ?')
    expect(getDeepSeekBadgeText('idle', null)).toBe('DeepSeek Key')
  })
})

describe('formatDeepSeekAmount', () => {
  it('USD / CNY 使用幣別符號，其他幣別附加代碼', () => {
    expect(formatDeepSeekAmount(1.1, 'USD')).toBe('$1.10')
    expect(formatDeepSeekAmount(12.34, 'CNY')).toBe('¥12.34')
    expect(formatDeepSeekAmount(5, 'EUR')).toBe('5.00 EUR')
  })
})
