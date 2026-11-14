import fs from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LOGIN_PARTICLES, LoginBackdrop } from '../src/renderer/src/components/LoginBackdrop'

const countOccurrences = (html: string, needle: string): number => html.split(needle).length - 1

const readSource = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

/** 登入頁自訂動畫（定義在 tailwind.config.js 的 theme.extend.animation） */
const CUSTOM_ANIMATIONS = [
  'aurora-slow',
  'aurora-reverse',
  'converge',
  'grid-pan',
  'spin-slow',
  'pulse-glow',
  'shine'
]

const CENTER = 50

describe('LoginBackdrop', () => {
  const html = renderToStaticMarkup(React.createElement(LoginBackdrop))

  it('背景是純裝飾層，不會攔截表單操作', () => {
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('pointer-events-none')
    expect(html).toContain('absolute inset-0 overflow-hidden')
  })

  it('包含四層極光光暈與透視網格', () => {
    expect(countOccurrences(html, 'animate-aurora-slow')).toBe(2)
    expect(countOccurrences(html, 'animate-aurora-reverse')).toBe(2)
    expect(countOccurrences(html, 'animate-grid-pan')).toBe(1)
    // 透視網格要有 3D 傾角與底部淡出遮罩
    expect(html).toContain('perspective(600px) rotateX(64deg)')
    expect(html).toContain('linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent 78%)')
  })

  it('已移除白色漸層掃光', () => {
    expect(html).not.toContain('animate-sweep')
    expect(html).not.toContain('-skew-x-12')
    expect(readSource('src/renderer/src/components/LoginBackdrop.tsx')).not.toContain('sweep')
  })

  it('漂浮光點以畫面中心為圓心環狀分佈，並帶有向中心的位移', () => {
    expect(LOGIN_PARTICLES).toHaveLength(30)
    expect(countOccurrences(html, 'animate-converge')).toBe(LOGIN_PARTICLES.length)
    expect(countOccurrences(html, '--converge-x')).toBe(LOGIN_PARTICLES.length)
    expect(countOccurrences(html, '--converge-y')).toBe(LOGIN_PARTICLES.length)

    for (const particle of LOGIN_PARTICLES) {
      // 起始位置在外圈（半徑 24~56%），可能稍微超出畫面邊界
      expect(particle.left).toBeGreaterThanOrEqual(-6)
      expect(particle.left).toBeLessThanOrEqual(106)
      expect(particle.top).toBeGreaterThanOrEqual(4)
      expect(particle.top).toBeLessThanOrEqual(96)
      // 位移量必須剛好把光點帶到畫面中心
      expect(particle.dx).toBeCloseTo(CENTER - particle.left, 10)
      expect(particle.dy).toBeCloseTo(CENTER - particle.top, 10)
      expect(Math.abs(particle.dx)).toBeGreaterThan(0)
      expect(Math.abs(particle.dy)).toBeGreaterThan(0)

      expect(particle.size).toBeGreaterThanOrEqual(2)
      expect(particle.size).toBeLessThanOrEqual(5)
      // 負的延遲讓動畫一載入就在行進中，不會所有光點同時由外圈出發
      expect(particle.delay).toBeLessThanOrEqual(0)
      expect(particle.delay).toBeGreaterThan(-14)
      expect(particle.duration).toBeGreaterThan(8)
      expect(particle.duration).toBeLessThan(16)
    }
  })

  it('光點起始位置不重複（畫面不會出現疊在一起的亮點）', () => {
    const positions = LOGIN_PARTICLES.map(
      (particle) => `${particle.left.toFixed(3)}-${particle.top.toFixed(3)}`
    )
    expect(new Set(positions).size).toBe(LOGIN_PARTICLES.length)
  })

  it('同一份資料渲染兩次結果一致（不會因亂數造成畫面跳動）', () => {
    const again = renderToStaticMarkup(React.createElement(LoginBackdrop))
    expect(again).toBe(html)
  })

  it('所有動畫都提供 prefers-reduced-motion 的靜態後備', () => {
    // 極光（4）＋網格（1）＋呼吸光（1）：motion-reduce:animate-none；光點：直接隱藏
    expect(countOccurrences(html, 'motion-reduce:animate-none')).toBe(6)
    expect(countOccurrences(html, 'motion-reduce:hidden')).toBe(LOGIN_PARTICLES.length)
  })
})

describe('登入頁動畫設定', () => {
  it('tailwind.config.js 已定義登入頁使用的每一個動畫', () => {
    const config = readSource('tailwind.config.js')
    for (const name of CUSTOM_ANIMATIONS) {
      const key = name.includes('-') ? `'${name}'` : name
      expect(config, `缺少 animation: ${name}`).toContain(`${key}:`)
    }
    // keyframes 也要存在，否則 animate-* 不會有實際效果
    expect(config).toContain('converge: {')
    expect(config).toContain("'grid-pan': {")
    expect(config).toContain("'spin-slow': {")
    expect(config).toContain("'pulse-glow': {")
    expect(config).toContain('aurora: {')
    expect(config).toContain('shine: {')
    // 掃光動畫已移除
    expect(config).not.toContain('sweep')
    // 光點往中心收束的位移由 CSS 變數提供
    expect(config).toContain('var(--converge-x, 0px)')
    expect(config).toContain('var(--converge-y, 0px)')
  })

  it('LoginGate 使用背景元件，並為標誌與標題套用動畫', () => {
    const gate = readSource('src/renderer/src/components/LoginGate.tsx')
    expect(gate).toContain('<LoginBackdrop />')
    expect(gate).toContain('animate-spin-slow')
    expect(gate).toContain('animate-pulse-glow')
    expect(gate).toContain('animate-shine')
    expect(gate).toContain('conic-gradient(from 0deg, #6366f1, #d946ef, #22d3ee, #6366f1)')
  })
})
