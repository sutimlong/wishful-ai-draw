import React from 'react'

/** 固定亂數種子 → 0~1，讓光點位置每次渲染都一致（避免畫面閃動） */
function seededUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

export interface LoginParticle {
  /** 起始位置（畫面百分比） */
  left: number
  top: number
  /** 往畫面中心收束的位移量（水平 vw、垂直 vh） */
  dx: number
  dy: number
  size: number
  delay: number
  duration: number
  tint: string
}

const PARTICLE_TINTS = [
  'rgba(199, 210, 254, 0.95)',
  'rgba(240, 171, 252, 0.85)',
  'rgba(165, 243, 252, 0.9)'
]

/** 光點環繞的中心（＝畫面中心 %） */
const CENTER_X = 50
const CENTER_Y = 50
/** 起始環的半徑範圍（%） */
const RADIUS_MIN = 24
const RADIUS_MAX = 56
/** 垂直方向壓縮比例：畫面較寬，避免光點全擠在左右兩側 */
const VERTICAL_RATIO = 0.82

/**
 * 登入畫面背景的漂浮光點（固定參數）。
 *
 * 光點以畫面中心為圓心環狀分佈，動畫會把它們往中心收束（`--converge-x/y` 位移），
 * 淡出後再從外圈重新出現，形成無限往中心流動的效果。
 * 負的 delay 讓動畫一載入就已在行進中，不會所有光點同時由原點出發。
 */
export const LOGIN_PARTICLES: LoginParticle[] = Array.from({ length: 30 }, (_, index) => {
  const seed = index + 1
  const angle = seededUnit(seed * 1.7) * Math.PI * 2
  const radius = RADIUS_MIN + seededUnit(seed * 2.3) * (RADIUS_MAX - RADIUS_MIN)
  const left = CENTER_X + Math.cos(angle) * radius
  const top = CENTER_Y + Math.sin(angle) * radius * VERTICAL_RATIO
  return {
    left,
    top,
    // 1% 畫面寬度 = 1vw；垂直同理，位移量取負值即朝中心前進
    dx: CENTER_X - left,
    dy: CENTER_Y - top,
    size: 2 + Math.round(seededUnit(seed * 3.1) * 3),
    delay: -seededUnit(seed * 4.7) * 14,
    duration: 8 + seededUnit(seed * 5.9) * 8,
    tint: PARTICLE_TINTS[index % PARTICLE_TINTS.length]
  }
})

const GRID_IMAGE =
  'linear-gradient(to right, rgba(99, 102, 241, 0.45) 1px, transparent 1px), ' +
  'linear-gradient(to top, rgba(99, 102, 241, 0.45) 1px, transparent 1px)'

/**
 * 登入頁背景動畫：極光光暈 + 透視網格 + 向中心收束的漂浮光點。
 *
 * 全部圖層都是裝飾用（`aria-hidden` + `pointer-events-none`），不影響表單操作；
 * 每個動畫元素都加上 `motion-reduce:animate-none`，系統開啟「減少動態效果」時會靜止。
 */
export const LoginBackdrop: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {/* 底色與中央呼吸光 */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(49,46,129,0.55),transparent_68%)]" />
    <div className="absolute left-[22%] top-[16%] h-[62%] w-[62%] rounded-full bg-indigo-500/15 blur-[130px] animate-pulse-glow motion-reduce:animate-none" />

    {/* 極光光暈：四顆緩慢漂移的模糊色塊 */}
    <div className="absolute -left-[18%] -top-[26%] h-[68vh] w-[68vh] rounded-full bg-indigo-600/25 blur-[130px] animate-aurora-slow will-change-transform motion-reduce:animate-none" />
    <div
      className="absolute -right-[14%] -top-[12%] h-[54vh] w-[54vh] rounded-full bg-fuchsia-600/20 blur-[120px] animate-aurora-reverse will-change-transform motion-reduce:animate-none"
      style={{ animationDelay: '-8s' }}
    />
    <div
      className="absolute -bottom-[30%] -right-[12%] h-[74vh] w-[74vh] rounded-full bg-cyan-500/15 blur-[150px] animate-aurora-slow will-change-transform motion-reduce:animate-none"
      style={{ animationDelay: '-15s' }}
    />
    <div
      className="absolute -bottom-[26%] -left-[10%] h-[56vh] w-[56vh] rounded-full bg-emerald-500/10 blur-[130px] animate-aurora-reverse will-change-transform motion-reduce:animate-none"
      style={{ animationDelay: '-21s' }}
    />

    {/* 透視網格：從畫面下緣往地平線延伸，並持續向前推進 */}
    <div className="absolute inset-x-0 bottom-0 h-[62%]">
      <div
        className="absolute inset-0 animate-grid-pan opacity-30 motion-reduce:animate-none"
        style={{
          backgroundImage: GRID_IMAGE,
          backgroundSize: '64px 64px',
          transform: 'perspective(600px) rotateX(64deg)',
          transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent 78%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent 78%)'
        }}
      />
    </div>

    {/* 漂浮光點：由外圈持續往畫面中心收束 */}
    {LOGIN_PARTICLES.map((particle, index) => (
      <span
        key={index}
        className="absolute rounded-full animate-converge motion-reduce:hidden"
        style={
          {
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.tint,
            boxShadow: `0 0 ${particle.size * 4}px ${particle.tint}`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            '--converge-x': `${particle.dx}vw`,
            '--converge-y': `${particle.dy}vh`
          } as React.CSSProperties
        }
      />
    ))}

    {/* 邊緣暗角，讓中央的登入卡片更突出 */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(9,9,11,0.78)_100%)]" />
  </div>
)
