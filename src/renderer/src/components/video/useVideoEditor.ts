import { useEffect, useRef, useState, type RefObject } from 'react'
import { VideoFilmstripThumb } from '@shared/types'
import { clamp, resolveFilmstripCount, snapToFrame } from './timeUtils'

export interface UseVideoEditorOptions {
  /** 目前影片的絕對路徑（用於產生時間軸縮圖） */
  filePath: string | null
  /** 剪輯器是否開啟（關閉後重置狀態） */
  isOpen: boolean
  /** 是否啟用鍵盤快捷鍵（通常在開啟且未擷取時） */
  shortcutsEnabled?: boolean
  /** 初始擷取幀率（預設 8） */
  initialFps?: number
  /** 按下 Esc 時的回呼（由外層負責關閉視窗） */
  onEscape?: () => void
}

export interface VideoEditorController {
  videoRef: RefObject<HTMLVideoElement>

  fps: number
  setFps: (fps: number) => void

  duration: number
  currentTime: number
  startTime: number
  endTime: number
  clipDuration: number

  isPlaying: boolean
  isScrubbing: boolean
  isMuted: boolean
  loopSelection: boolean
  shuttleRate: number
  shuttleDirection: 1 | -1 | 0

  filmstrip: VideoFilmstripThumb[]
  isLoadingFilmstrip: boolean

  seek: (time: number) => void
  /** 節流版 seek（時間軸拖曳時使用，避免連續 seek 卡頓） */
  scrubTo: (time: number) => void
  /** 拖曳開始（會先暫停播放） */
  beginScrub: () => void
  /** 拖曳結束（精準 seek 並視情況恢復播放） */
  endScrub: () => void
  stepFrame: (direction: 1 | -1) => void
  nudge: (deltaSeconds: number) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  toggleMute: () => void
  toggleLoopSelection: () => void

  shuttleForward: () => void
  shuttleBackward: () => void

  setStartTime: (time: number) => void
  setEndTime: (time: number) => void
  markIn: () => void
  markOut: () => void
  goToIn: () => void
  goToOut: () => void

  handleLoadedMetadata: () => void
  handleTimeUpdate: () => void
  handlePlay: () => void
  handlePause: () => void
  handleEnded: () => void
}

/** 建立剪輯器狀態與操作；影片元素由 <VideoPreview> 綁定 videoRef。 */
export function useVideoEditor(options: UseVideoEditorOptions): VideoEditorController {
  const { filePath, isOpen, shortcutsEnabled = false, initialFps = 8, onEscape } = options

  const videoRef = useRef<HTMLVideoElement>(null)

  const [fps, setFps] = useState<number>(initialFps)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(0)

  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [loopSelection, setLoopSelection] = useState<boolean>(false)
  const [shuttleRate, setShuttleRate] = useState<number>(1)
  const [shuttleDirection, setShuttleDirection] = useState<1 | -1 | 0>(0)

  const [filmstrip, setFilmstrip] = useState<VideoFilmstripThumb[]>([])
  const [isLoadingFilmstrip, setIsLoadingFilmstrip] = useState<boolean>(false)

  const shuttleTimerRef = useRef<number | null>(null)
  const shuttleRateRef = useRef<number>(1)
  const shuttleDirRef = useRef<1 | -1 | 0>(0)
  const scrubRafRef = useRef<number | null>(null)
  const pendingSeekRef = useRef<number | null>(null)
  /** 拖曳期間最新的目標時間（pointerup 時用來保證影片停在放開的位置） */
  const lastScrubTargetRef = useRef<number | null>(null)
  const isScrubbingRef = useRef<boolean>(false)
  const resumeAfterScrubRef = useRef<boolean>(false)

  const clipDuration = Math.max(0, endTime - startTime)
  const minGap = fps > 0 ? 1 / fps : 0.01
  const roundTime = (value: number): number => Number(value.toFixed(3))

  const clampTime = (time: number): number => clamp(time, 0, duration || 0)

  const cancelPendingSeek = (): void => {
    if (scrubRafRef.current !== null) {
      window.cancelAnimationFrame(scrubRafRef.current)
      scrubRafRef.current = null
    }
    pendingSeekRef.current = null
  }

  const applySeek = (time: number): void => {
    const vid = videoRef.current
    const next = clampTime(time)
    if (vid) vid.currentTime = next
    setCurrentTime(next)
  }

  const seek = (time: number): void => {
    cancelPendingSeek()
    applySeek(time)
  }

  /**
   * 拖曳時間軸時每個影格最多處理一次，兩件事刻意分開：
   * 1. 播放頭（白線）立刻跟上指標 → 拖曳手感不受解碼速度影響
   * 2. 影片畫面每個影格都直接套用最新位置：即使上一次 seek 還沒解碼完，
   *    瀏覽器也會自動以新的 currentTime 取代，不必等 seeked 而讓畫面停住。
   */
  const flushPendingSeek = (): void => {
    scrubRafRef.current = null
    const pending = pendingSeekRef.current
    if (pending === null) return
    pendingSeekRef.current = null

    setCurrentTime(pending)

    const vid = videoRef.current
    if (!vid) return
    // 已經在目標位置就不重複 seek（拖曳剛按下時可省一次）
    if (Math.abs(vid.currentTime - pending) < 0.0005) return
    vid.currentTime = pending
  }

  /** 拖曳用 seek：只記錄最新目標，實際更新統一到下一個影格做。 */
  const requestSeek = (time: number): void => {
    const next = clampTime(time)
    pendingSeekRef.current = next
    lastScrubTargetRef.current = next
    if (scrubRafRef.current !== null) return
    scrubRafRef.current = window.requestAnimationFrame(flushPendingSeek)
  }

  const goToIn = (): void => seek(startTime)
  const goToOut = (): void => seek(endTime)

  const currentPlayhead = (): number => {
    const vid = videoRef.current
    if (vid && (isPlaying || !vid.paused)) return vid.currentTime
    return vid ? vid.currentTime : currentTime
  }

  const stepFrame = (direction: 1 | -1): void => {
    const step = fps > 0 ? 1 / fps : 0.1
    seek(currentPlayhead() + direction * step)
  }

  const nudge = (deltaSeconds: number): void => {
    seek(currentPlayhead() + deltaSeconds)
  }

  const clearShuttleTimer = (): void => {
    if (shuttleTimerRef.current !== null) {
      window.clearInterval(shuttleTimerRef.current)
      shuttleTimerRef.current = null
    }
  }

  const resetShuttle = (): void => {
    clearShuttleTimer()
    shuttleDirRef.current = 0
    shuttleRateRef.current = 1
    setShuttleDirection(0)
    setShuttleRate(1)
    const vid = videoRef.current
    if (vid) vid.playbackRate = 1
  }

  const play = (): void => {
    const vid = videoRef.current
    if (!vid) return
    const outOfRange = vid.currentTime < startTime || vid.currentTime >= endTime
    if (vid.ended || (loopSelection && outOfRange)) {
      vid.currentTime = startTime
      setCurrentTime(startTime)
    }
    void vid.play()
  }

  const pause = (): void => {
    videoRef.current?.pause()
    resetShuttle()
  }

  const togglePlay = (): void => {
    const vid = videoRef.current
    if (!vid) return
    if (vid.paused) {
      resetShuttle()
      play()
    } else {
      vid.pause()
      resetShuttle()
    }
  }

  const toggleMute = (): void => {
    const next = !isMuted
    setIsMuted(next)
    if (videoRef.current) videoRef.current.muted = next
  }

  const toggleLoopSelection = (): void => setLoopSelection((prev) => !prev)

  /**
   * 拖曳時間軸或 In/Out 把手時呼叫：先暫停播放，
   * 避免解碼器同時處理「播放」與「seek」而導致預覽卡頓。
   */
  const beginScrub = (): void => {
    const vid = videoRef.current
    isScrubbingRef.current = true
    setIsScrubbing(true)
    resumeAfterScrubRef.current = Boolean(vid && !vid.paused)
    resetShuttle()
    if (vid && !vid.paused) vid.pause()
  }

  /** 拖曳結束：補一次精準 seek（避開節流），必要時恢復原本的播放狀態。 */
  const endScrub = (): void => {
    isScrubbingRef.current = false
    setIsScrubbing(false)
    // 以拖曳期間最後一次的目標為準，確保影片畫面停在放開的位置
    const target = lastScrubTargetRef.current ?? pendingSeekRef.current
    lastScrubTargetRef.current = null
    cancelPendingSeek()
    if (target !== null) applySeek(target)

    if (!resumeAfterScrubRef.current) return
    resumeAfterScrubRef.current = false

    const vid = videoRef.current
    if (!vid) return
    if (loopSelection && endTime > startTime) {
      if (vid.currentTime < startTime || vid.currentTime >= endTime) {
        vid.currentTime = startTime
        setCurrentTime(startTime)
      }
    }
    void vid.play()
  }

  const shuttleForward = (): void => {
    const vid = videoRef.current
    if (!vid) return
    clearShuttleTimer()
    const nextRate = shuttleDirRef.current === 1 ? Math.min(4, shuttleRateRef.current * 2) : 1
    shuttleDirRef.current = 1
    shuttleRateRef.current = nextRate
    setShuttleDirection(1)
    setShuttleRate(nextRate)
    vid.playbackRate = nextRate
    void vid.play()
  }

  const shuttleBackward = (): void => {
    const vid = videoRef.current
    if (!vid) return
    const nextRate = shuttleDirRef.current === -1 ? Math.min(4, shuttleRateRef.current * 2) : 1
    shuttleDirRef.current = -1
    shuttleRateRef.current = nextRate
    setShuttleDirection(-1)
    setShuttleRate(nextRate)
    vid.pause()
    clearShuttleTimer()
    shuttleTimerRef.current = window.setInterval(() => {
      const el = videoRef.current
      if (!el) return
      const floor = loopSelection ? startTime : 0
      const next = Math.max(floor, el.currentTime - 0.06 * shuttleRateRef.current)
      el.currentTime = next
      setCurrentTime(next)
      if (next <= floor + 0.001) resetShuttle()
    }, 60)
  }

  const changeStartTime = (raw: number): void => {
    const snapped = snapToFrame(clamp(raw, 0, duration || 0), fps)
    const next = roundTime(clamp(snapped, 0, Math.max(0, endTime - minGap)))
    setStartTime(next)
    if (isScrubbingRef.current) requestSeek(next)
    else seek(next)
  }

  const changeEndTime = (raw: number): void => {
    const snapped = snapToFrame(clamp(raw, 0, duration || 0), fps)
    const minEnd = Math.min(duration || 0, startTime + minGap)
    const next = roundTime(clamp(snapped, minEnd, duration || 0))
    setEndTime(next)
    if (isScrubbingRef.current) requestSeek(next)
    else seek(next)
  }

  const markIn = (): void => changeStartTime(currentPlayhead())
  const markOut = (): void => changeEndTime(currentPlayhead())

  const handleLoadedMetadata = (): void => {
    const vid = videoRef.current
    if (!vid) return
    const dur =
      Number.isFinite(vid.duration) && vid.duration > 0 ? Number(vid.duration.toFixed(3)) : 0
    setDuration(dur)
    setStartTime(0)
    setEndTime(dur)
    setCurrentTime(0)
    resetShuttle()
  }

  const handleTimeUpdate = (): void => {
    const vid = videoRef.current
    if (!vid) return
    // 拖曳期間播放頭由 scrubTo 即時驅動，若讓 seek 完成事件回寫會造成回彈／拉扯
    if (isScrubbingRef.current) return
    const time = vid.currentTime
    setCurrentTime(time)
    if (loopSelection && !vid.paused && endTime > startTime && time >= endTime - 0.02) {
      vid.currentTime = startTime
      setCurrentTime(startTime)
    }
  }

  const handlePlay = (): void => setIsPlaying(true)
  const handlePause = (): void => setIsPlaying(false)
  const handleEnded = (): void => {
    const vid = videoRef.current
    if (loopSelection && endTime > startTime && vid) {
      vid.currentTime = startTime
      setCurrentTime(startTime)
      void vid.play()
      return
    }
    setIsPlaying(false)
    resetShuttle()
    setCurrentTime(duration)
  }

  useEffect(() => {
    setDuration(0)
    setCurrentTime(0)
    setStartTime(0)
    setEndTime(0)
    setIsPlaying(false)
    setIsScrubbing(false)
    setIsMuted(false)
    setFilmstrip([])
    setIsLoadingFilmstrip(false)
    resetShuttle()
    cancelPendingSeek()
    lastScrubTargetRef.current = null
    isScrubbingRef.current = false
    resumeAfterScrubRef.current = false
    // resetShuttle / cancelPendingSeek 只使用 ref，不需要列入依賴
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath, isOpen])

  useEffect(() => {
    let cancelled = false
    if (!isOpen || !filePath || duration <= 0) {
      setFilmstrip([])
      setIsLoadingFilmstrip(false)
      return
    }

    setIsLoadingFilmstrip(true)
    window.electronAPI
      .generateVideoFilmstrip({ filePath, duration, count: resolveFilmstripCount(duration) })
      .then((thumbs) => {
        if (!cancelled) setFilmstrip(thumbs)
      })
      .catch(() => {
        if (!cancelled) setFilmstrip([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingFilmstrip(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, filePath, duration])

  const actionsRef = useRef<{
    togglePlay: () => void
    pause: () => void
    stepFrame: (direction: 1 | -1) => void
    nudge: (deltaSeconds: number) => void
    seek: (time: number) => void
    goToIn: () => void
    goToOut: () => void
    markIn: () => void
    markOut: () => void
    shuttleForward: () => void
    shuttleBackward: () => void
    duration: number
    onEscape?: () => void
  } | null>(null)

  actionsRef.current = {
    togglePlay,
    pause,
    stepFrame,
    nudge,
    seek,
    goToIn,
    goToOut,
    markIn,
    markOut,
    shuttleForward,
    shuttleBackward,
    duration,
    onEscape
  }

  useEffect(() => {
    if (!shortcutsEnabled) return

    const onKeyDown = (event: KeyboardEvent): void => {
      const actions = actionsRef.current
      if (!actions) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === 'Escape') {
        event.preventDefault()
        actions.onEscape?.()
        return
      }

      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'select' || tag === 'textarea' || target?.isContentEditable) {
        return
      }

      const key = event.key
      const lower = key.toLowerCase()

      if (key === ' ') {
        event.preventDefault()
        if (!event.repeat) actions.togglePlay()
        return
      }
      if (lower === 'k') {
        event.preventDefault()
        if (!event.repeat) actions.pause()
        return
      }
      if (lower === 'j') {
        event.preventDefault()
        actions.shuttleBackward()
        return
      }
      if (lower === 'l') {
        event.preventDefault()
        actions.shuttleForward()
        return
      }
      if (lower === 'i') {
        event.preventDefault()
        if (!event.repeat) actions.markIn()
        return
      }
      if (lower === 'o') {
        event.preventDefault()
        if (!event.repeat) actions.markOut()
        return
      }
      if (lower === 'q' || key === 'ArrowUp') {
        event.preventDefault()
        actions.goToIn()
        return
      }
      if (lower === 'w' || key === 'ArrowDown') {
        event.preventDefault()
        actions.goToOut()
        return
      }
      if (key === 'ArrowLeft') {
        event.preventDefault()
        if (event.shiftKey) actions.nudge(-1)
        else actions.stepFrame(-1)
        return
      }
      if (key === 'ArrowRight') {
        event.preventDefault()
        if (event.shiftKey) actions.nudge(1)
        else actions.stepFrame(1)
        return
      }
      if (key === 'Home') {
        event.preventDefault()
        actions.seek(0)
        return
      }
      if (key === 'End') {
        event.preventDefault()
        actions.seek(actions.duration)
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcutsEnabled])

  useEffect(() => {
    return () => {
      if (shuttleTimerRef.current !== null) {
        window.clearInterval(shuttleTimerRef.current)
        shuttleTimerRef.current = null
      }
      if (scrubRafRef.current !== null) {
        window.cancelAnimationFrame(scrubRafRef.current)
        scrubRafRef.current = null
      }
      pendingSeekRef.current = null
    }
  }, [])

  return {
    videoRef,
    fps,
    setFps,
    duration,
    currentTime,
    startTime,
    endTime,
    clipDuration,
    isPlaying,
    isScrubbing,
    isMuted,
    loopSelection,
    shuttleRate,
    shuttleDirection,
    filmstrip,
    isLoadingFilmstrip,
    seek,
    scrubTo: requestSeek,
    beginScrub,
    endScrub,
    stepFrame,
    nudge,
    play,
    pause,
    togglePlay,
    toggleMute,
    toggleLoopSelection,
    shuttleForward,
    shuttleBackward,
    setStartTime: changeStartTime,
    setEndTime: changeEndTime,
    markIn,
    markOut,
    goToIn,
    goToOut,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded
  }
}

