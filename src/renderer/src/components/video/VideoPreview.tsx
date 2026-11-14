import React, { useEffect, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  FastForward,
  Pause,
  Play,
  Repeat,
  Rewind,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react'
import { formatTimecode } from './timeUtils'
import type { VideoEditorController } from './useVideoEditor'

interface VideoPreviewProps {
  src: string
  fileName: string
  editor: VideoEditorController
  disabled?: boolean
}

interface ControlButtonProps {
  title: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  primary?: boolean
  children: React.ReactNode
}

const ControlButton: React.FC<ControlButtonProps> = ({
  title,
  onClick,
  disabled,
  active,
  primary,
  children
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={[
      'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
      primary
        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
        : active
          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white',
      disabled ? 'opacity-40 cursor-not-allowed' : ''
    ].join(' ')}
  >
    {children}
  </button>
)

/** 自訂影片播放器：提供剪輯軟體風格的播放、逐格與穿梭控制。 */
export const VideoPreview: React.FC<VideoPreviewProps> = ({ src, fileName, editor, disabled }) => {
  const {
    videoRef,
    fps,
    duration,
    currentTime,
    isPlaying,
    isScrubbing,
    isMuted,
    loopSelection,
    shuttleRate,
    shuttleDirection,
    togglePlay,
    toggleMute,
    toggleLoopSelection,
    stepFrame,
    nudge,
    goToIn,
    goToOut,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded
  } = editor

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [aspect, setAspect] = useState<number>(16 / 9)

  /**
   * 以擷取幀率（預設 8 fps）取樣畫面：
   * 影片本身照常播放（保留聲音），但只在跨過 1/fps 邊界時更新 canvas，
   * 因此肉眼看到的就是 8 fps 的格律（等同最終輸出的序列圖節奏）。
   */
  useEffect(() => {
    if (!isPlaying) return
    const vid = videoRef.current
    const canvas = canvasRef.current
    if (!vid || !canvas) return

    const sampleFps = fps > 0 ? fps : 8
    let lastIndex = -1
    let stopped = false
    let intervalId: number | null = null

    const paint = (): void => {
      const width = vid.videoWidth
      const height = vid.videoHeight
      if (!width || !height) return
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      canvas.getContext('2d')?.drawImage(vid, 0, 0, width, height)
    }

    paint()

    const sample = (mediaTime: number): void => {
      const index = Math.floor(mediaTime * sampleFps)
      if (index === lastIndex) return
      lastIndex = index
      paint()
    }

    if (typeof vid.requestVideoFrameCallback === 'function') {
      const onFrame = (_now: number, metadata: VideoFrameCallbackMetadata): void => {
        if (stopped) return
        sample(metadata.mediaTime)
        vid.requestVideoFrameCallback(onFrame)
      }
      vid.requestVideoFrameCallback(onFrame)
    } else {
      intervalId = window.setInterval(() => sample(vid.currentTime), 1000 / sampleFps)
    }

    return () => {
      stopped = true
      if (intervalId !== null) window.clearInterval(intervalId)
    }
  }, [isPlaying, fps, videoRef])

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative h-[min(44vh,340px)] max-w-full rounded-xl bg-black border border-zinc-800 overflow-hidden flex items-center justify-center"
        style={{ aspectRatio: String(aspect) }}
      >
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="auto"
          muted={isMuted}
          onClick={() => !disabled && togglePlay()}
          onLoadedMetadata={(event) => {
            const vid = event.currentTarget
            if (vid.videoWidth > 0 && vid.videoHeight > 0) {
              setAspect(vid.videoWidth / vid.videoHeight)
            }
            handleLoadedMetadata()
          }}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          className="h-full w-full object-contain cursor-pointer"
        />

        {isPlaying && (
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute left-1/2 top-1/2 max-h-full max-w-full -translate-x-1/2 -translate-y-1/2"
          />
        )}

        <div className="pointer-events-none absolute top-2.5 left-2.5 max-w-[60%] truncate px-2.5 py-1 rounded-md bg-black/75 border border-zinc-700/80 text-[11px] font-mono text-zinc-200">
          {fileName}
        </div>
        <div className="pointer-events-none absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-indigo-950/85 border border-indigo-500/40 text-[11px] font-mono text-indigo-200 text-right">
          <div>
            {formatTimecode(currentTime, fps)} / {formatTimecode(duration, fps)}
          </div>
          <div className="text-[10px] text-indigo-300/80">{fps} fps 格律預覽</div>
        </div>

        {!isPlaying && !isScrubbing && shuttleDirection === 0 && (
          <button
            type="button"
            onClick={() => !disabled && togglePlay()}
            disabled={disabled}
            className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/25 transition-colors"
            title="播放 (Space)"
          >
            <span className="w-14 h-14 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white">
              <Play className="w-6 h-6 translate-x-0.5" />
            </span>
          </button>
        )}

        {shuttleDirection !== 0 && (
          <div className="pointer-events-none absolute bottom-2.5 left-2.5 px-2 py-1 rounded-md bg-amber-950/85 border border-amber-500/40 text-[11px] font-mono text-amber-200">
            {shuttleDirection === 1 ? '快轉' : '倒帶'} {shuttleRate}x
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 flex items-center gap-1 flex-wrap">
        <ControlButton title="跳到起點 (Q / ↑)" onClick={goToIn} disabled={disabled}>
          <SkipBack className="w-4 h-4" />
        </ControlButton>
        <ControlButton title="後退 1 秒 (Shift + ←)" onClick={() => nudge(-1)} disabled={disabled}>
          <Rewind className="w-4 h-4" />
        </ControlButton>
        <ControlButton title="上一影格 (←)" onClick={() => stepFrame(-1)} disabled={disabled}>
          <ChevronLeft className="w-4 h-4" />
        </ControlButton>
        <ControlButton
          title={isPlaying ? '暫停 (Space)' : '播放 (Space)'}
          onClick={togglePlay}
          disabled={disabled}
          primary
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-px" />}
        </ControlButton>
        <ControlButton title="下一影格 (→)" onClick={() => stepFrame(1)} disabled={disabled}>
          <ChevronRight className="w-4 h-4" />
        </ControlButton>
        <ControlButton title="前進 1 秒 (Shift + →)" onClick={() => nudge(1)} disabled={disabled}>
          <FastForward className="w-4 h-4" />
        </ControlButton>
        <ControlButton title="跳到終點 (W / ↓)" onClick={goToOut} disabled={disabled}>
          <SkipForward className="w-4 h-4" />
        </ControlButton>

        <div className="mx-1.5 h-5 w-px bg-zinc-800" />

        <div className="font-mono text-xs">
          <span className="text-indigo-300">{formatTimecode(currentTime, fps)}</span>
          <span className="text-zinc-600"> / </span>
          <span className="text-zinc-400">{formatTimecode(duration, fps)}</span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <ControlButton
            title="循環播放選取範圍"
            onClick={toggleLoopSelection}
            disabled={disabled}
            active={loopSelection}
          >
            <Repeat className="w-4 h-4" />
          </ControlButton>
          <ControlButton title={isMuted ? '取消靜音' : '靜音'} onClick={toggleMute} disabled={disabled}>
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </ControlButton>
        </div>
      </div>
    </div>
  )
}
