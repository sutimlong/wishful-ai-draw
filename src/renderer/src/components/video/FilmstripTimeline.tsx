import React, { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { VideoFilmstripThumb } from '@shared/types'
import { formatTimecode, percentToTime, timeToPercent } from './timeUtils'

type DragMode = 'seek' | 'start' | 'end'

interface FilmstripTimelineProps {
  duration: number
  currentTime: number
  startTime: number
  endTime: number
  fps: number
  filmstrip: VideoFilmstripThumb[]
  isLoadingFilmstrip: boolean
  disabled?: boolean
  onSeek: (time: number) => void
  onChangeStart: (time: number) => void
  onChangeEnd: (time: number) => void
  /** 拖曳開始（用於暫停播放，讓 scrub 更順） */
  onScrubStart?: () => void
  /** 拖曳結束（恢復播放狀態） */
  onScrubEnd?: () => void
}

/** 影格膠捲時間軸：可拖曳 In/Out 把手、播放頭與點擊預覽。 */
export const FilmstripTimeline: React.FC<FilmstripTimelineProps> = ({
  duration,
  currentTime,
  startTime,
  endTime,
  fps,
  filmstrip,
  isLoadingFilmstrip,
  disabled,
  onSeek,
  onChangeStart,
  onChangeEnd,
  onScrubStart,
  onScrubEnd
}) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragModeRef = useRef<DragMode | null>(null)
  /** 抓著播放頭拖曳時的位移補償（秒），避免按下瞬間播放頭跳到指標位置 */
  const grabOffsetRef = useRef<number>(0)

  const startPercent = timeToPercent(startTime, duration)
  const endPercent = timeToPercent(endTime, duration)
  const currentPercent = timeToPercent(currentTime, duration)
  const selectionWidth = Math.max(0, endPercent - startPercent)

  const pointerToTime = (clientX: number, withGrabOffset = false): number => {
    const el = trackRef.current
    if (!el || duration <= 0) return 0
    const rect = el.getBoundingClientRect()
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0
    const raw = ratio * duration - (withGrabOffset ? grabOffsetRef.current : 0)
    return percentToTime((raw / duration) * 100, duration)
  }

  const applyDrag = (clientX: number): void => {
    const mode = dragModeRef.current
    if (!mode) return
    if (mode === 'start') onChangeStart(pointerToTime(clientX))
    else if (mode === 'end') onChangeEnd(pointerToTime(clientX))
    else onSeek(pointerToTime(clientX, true))
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (disabled) return
    const handleEl = (event.target as HTMLElement).closest<HTMLElement>('[data-handle]')
    const handle = handleEl?.dataset.handle
    dragModeRef.current = handle === 'start' ? 'start' : handle === 'end' ? 'end' : 'seek'
    // 抓著白色播放頭拖曳時記住抓取位移，按下瞬間不會跳位；點擊軌道其他位置則直接跳到該處
    grabOffsetRef.current =
      handle === 'playhead' ? pointerToTime(event.clientX) - currentTime : 0
    onScrubStart?.()
    event.currentTarget.setPointerCapture(event.pointerId)
    // 避免瀏覽器原生拖曳（例如拖到縮圖 <img>）中斷 pointermove 流程
    event.preventDefault()
    applyDrag(event.clientX)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!dragModeRef.current) return
    applyDrag(event.clientX)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!dragModeRef.current) return
    dragModeRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    onScrubEnd?.()
  }

  /**
   * 安全網：若 pointerup 在元素外遺失（例如拖出視窗），
   * 仍要結束拖曳狀態，否則播放頭會卡住不再更新。
   */
  useEffect(() => {
    const finish = (): void => {
      if (!dragModeRef.current) return
      dragModeRef.current = null
      onScrubEnd?.()
    }
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    return () => {
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
    }
  }, [onScrubEnd])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-zinc-400">
        <span>時間軸 (Filmstrip Timeline)</span>
        <span className="font-mono">
          In <span className="text-indigo-300">{formatTimecode(startTime, fps)}</span>
          {'   '}Out <span className="text-emerald-300">{formatTimecode(endTime, fps)}</span>
        </span>
      </div>

      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragStart={(event) => event.preventDefault()}
        className={[
          'relative h-20 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 select-none touch-none',
          disabled ? 'cursor-not-allowed opacity-70' : 'cursor-crosshair'
        ].join(' ')}
      >
        <div className="absolute inset-0 flex">
          {filmstrip.length > 0
            ? filmstrip.map((thumb, index) => (
                <img
                  key={index}
                  src={thumb.imageUrl}
                  alt=""
                  draggable={false}
                  className="h-full flex-1 min-w-0 object-cover pointer-events-none"
                />
              ))
            : Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="h-full flex-1 min-w-0 border-r border-zinc-900 bg-gradient-to-b from-zinc-800/60 to-zinc-900/60"
                />
              ))}
        </div>

        {isLoadingFilmstrip && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              產生縮圖中...
            </span>
          </div>
        )}

        <div
          className="absolute inset-y-0 left-0 bg-black/65 pointer-events-none"
          style={{ width: `${startPercent}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-black/65 pointer-events-none"
          style={{ width: `${100 - endPercent}%` }}
        />
        <div
          className="absolute inset-y-0 pointer-events-none border-y-2 border-indigo-400/90"
          style={{ left: `${startPercent}%`, width: `${selectionWidth}%` }}
        />

        <div
          data-handle="playhead"
          className="group absolute inset-y-0 w-2.5 -ml-[5px] cursor-ew-resize"
          style={{ left: `${currentPercent}%` }}
          title="拖曳播放頭"
        >
          <div className="absolute inset-y-0 left-1/2 -ml-px w-0.5 bg-white shadow" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rotate-45 shadow" />
          <div className="absolute inset-y-0 left-1/2 -ml-[3px] w-1.5 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div
          data-handle="start"
          className="absolute inset-y-0 w-3 -ml-1.5 bg-indigo-500/80 hover:bg-indigo-400 border border-indigo-300/80 cursor-ew-resize flex items-center justify-center"
          style={{ left: `${startPercent}%` }}
        >
          <span className="w-px h-5 bg-white/80 pointer-events-none" />
        </div>
        <div
          data-handle="end"
          className="absolute inset-y-0 w-3 -ml-1.5 bg-emerald-500/80 hover:bg-emerald-400 border border-emerald-300/80 cursor-ew-resize flex items-center justify-center"
          style={{ left: `${endPercent}%` }}
        >
          <span className="w-px h-5 bg-white/80 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span>0.0s</span>
        <span className="font-sans">拖曳白線移動播放頭 · 拖曳藍/綠把手設定 In/Out</span>
        <span>{duration.toFixed(1)}s</span>
      </div>
    </div>
  )
}
