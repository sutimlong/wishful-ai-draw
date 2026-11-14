/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        /** 極光光暈：緩慢位移 + 縮放，製造流動感 */
        aurora: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(6%, -5%, 0) scale(1.14)' },
          '66%': { transform: 'translate3d(-5%, 4%, 0) scale(0.92)' }
        },
        /** 漂浮光點：由外圈往畫面中心收束並淡出 */
        converge: {
          '0%': {
            transform: 'translate3d(0, 0, 0) scale(1)',
            opacity: '0'
          },
          '12%': { opacity: '1' },
          '75%': { opacity: '0.85' },
          '100%': {
            transform: 'translate3d(var(--converge-x, 0px), var(--converge-y, 0px), 0) scale(0.3)',
            opacity: '0'
          }
        },
        /** 透視網格：背景位移，像往前推進 */
        'grid-pan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 64px' }
        },
        /** 緩慢旋轉（標誌後方的 conic 光環） */
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        /** 呼吸光暈 */
        'pulse-glow': {
          '0%, 100%': { opacity: '0.32', transform: 'scale(0.94)' },
          '50%': { opacity: '0.66', transform: 'scale(1.06)' }
        },
        /** 標題漸層流動 */
        shine: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        }
      },
      animation: {
        'aurora-slow': 'aurora 26s ease-in-out infinite',
        'aurora-reverse': 'aurora 34s ease-in-out infinite reverse',
        converge: 'converge 10s ease-in infinite',
        'grid-pan': 'grid-pan 5s linear infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'pulse-glow': 'pulse-glow 7s ease-in-out infinite',
        shine: 'shine 7s linear infinite'
      }
    }
  },
  plugins: []
}

