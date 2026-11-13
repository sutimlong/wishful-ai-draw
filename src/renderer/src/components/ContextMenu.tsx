import React, { useLayoutEffect, useRef, useState } from 'react'

export type ContextMenuItem =
  | { separator: true }
  | {
      label: string
      icon?: React.ReactNode
      onClick: () => void
      disabled?: boolean
      danger?: boolean
    }

interface Props {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

/** 輕量自製右鍵選單：自動貼合視窗邊界、點外部 / Esc / 捲動即關閉。 */
export const ContextMenu: React.FC<Props> = ({ x, y, items, onClose }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x, y })

  useLayoutEffect(() => {
    const menu = ref.current
    if (!menu) return
    const { innerWidth, innerHeight } = window
    const rect = menu.getBoundingClientRect()
    setPos({
      x: Math.max(4, Math.min(x, innerWidth - rect.width - 4)),
      y: Math.max(4, Math.min(y, innerHeight - rect.height - 4))
    })
  }, [x, y])

  React.useEffect(() => {
    const onMouseDown = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onClose, true)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onClose, true)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed z-50 min-w-[190px] py-1 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl shadow-black/60"
    >
      {items.map((item, idx) =>
        'separator' in item ? (
          <div key={idx} className="my-1 h-px bg-zinc-800" />
        ) : (
          <button
            key={idx}
            disabled={item.disabled}
            onClick={() => {
              item.onClick()
              onClose()
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition disabled:opacity-40 disabled:cursor-not-allowed ${
              item.danger
                ? 'text-rose-300 hover:bg-rose-950/70'
                : 'text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </button>
        )
      )}
    </div>
  )
}
