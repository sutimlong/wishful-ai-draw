import React, { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Film,
  FolderOpen,
  Layers,
  Loader2,
  Scissors,
  Sparkles,
  X
} from 'lucide-react'
import { VideoExtractProgress } from '@shared/types'
import { useBatchStore } from '../store/useBatchStore'

function formatSeconds(sec: number): string {
  const safe = Math.max(0, sec)
  const mins = Math.floor(safe / 60)
  const secs = (safe % 60).toFixed(2)
  return `${String(mins).padStart(2, '0')}:${ secs.padStart(5, '0') }`
}

export const VideoTrimmer: React.FC = () => {
  const isVideoTrimmerOpen = useBatchStore((s) => s.isVideoTrimmerOpen)
  const activeVideo = useBatchStore((s) => s.activeVideo)
  const setVideoTrimmerOpen = useBatchStore((s) => s.setVideoTrimmerOpen)
  const openVideoDialog = useBatchStore((s) => s.openVideoDialog)
  const addTasks = useBatchStore((s) => s.addTasks)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [duration, setDuration] = useState<number>(10)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(5)
  const [fps, setFps] = useState<number>(8)

  const [isExtracting, setIsExtracting] = useState(false)
  const [progress, setProgress] = useState<VideoExtractProgress | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isVideoTrimmerOpen) return
    setErrorMsg(null)
    setSuccessMsg(null)
    setProgress(null)
    setIsExtracting(false)

    const unsub = window.electronAPI.onVideoProgress((prog) => {
      setProgress(prog)
    })
    return () => unsub()
  }, [isVideoTrimmerOpen, activeVideo?.filePath])

  if (!isVideoTrimmerOpen) return null

  const handleLoadedMetadata = (): void => {
    const vid = videoRef.current
    if (!vid) return
    const dur = Number.isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 10
    setDuration(Number(dur.toFixed(2)))
    setStartTime(0)
    setEndTime(Number(dur.toFixed(2)))
  }

  const handleStartTimeChange = (val: number): void => {
    const clamped = Math.max(0, Math.min(val, endTime - 0.1))
    const rounded = Number(clamped.toFixed(2))
    setStartTime(rounded)
    if (videoRef.current) {
      videoRef.current.currentTime = rounded
    }
  }

  const handleEndTimeChange = (val: number): void => {
    const clamped = Math.min(duration, Math.max(val, startTime + 0.1))
    const rounded = Number(clamped.toFixed(2))
    setEndTime(rounded)
    if (videoRef.current) {
      videoRef.current.currentTime = rounded
    }
  }

  const clipDuration = Math.max(0, endTime - startTime)
  const estimatedFrames = clipDuration > 0 ? Math.max(1, Math.round(clipDuration * fps)) : 0

  const handleExtractAndQueue = async (): Promise<void> => {
    if (!activeVideo) return
    if (endTime <= startTime) {
      setErrorMsg('終點時間 (End Time) 必須大於起點時間 (Start Time)')
      return
    }

    setIsExtracting(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    setProgress({
      filePath: activeVideo.filePath,
      percent: 1,
      statusText: '準備啟動 FFmpeg 擷取...'
    })

    try {
      const framePaths = await window.electronAPI.extractVideoFrames({
        filePath: activeVideo.filePath,
        startTime,
        endTime,
        fps
      })

      if (framePaths.length === 0) {
        throw new Error('未擷取到任何影格，請檢查影片格式或剪裁時間區間')
      }

      const addedItems = await addTasks(framePaths)
      setSuccessMsg(`成功擷取 ${addedItems.length} 張序列圖並已推入批次佇列！`)

      setTimeout(() => {
        setIsExtracting(false)
        setVideoTrimmerOpen(false)
      }, 900)
    } catch (err) {
      setIsExtracting(false)
      setErrorMsg(err instanceof Error ? err.message : String(err))
    }
  }

  const startPercent = duration > 0 ? Math.min(100, (startTime / duration) * 100) : 0
  const endPercent = duration > 0 ? Math.min(100, (endTime / duration) * 100) : 100

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                影片頭尾剪裁與 {fps} fps 序列圖擷取器 (Video Frame Extractor)
              </h2>
              <p className="text-[11px] text-zinc-400">
                設定起訖秒數後，透過本地 FFmpeg 自動轉換為連續 PNG 並無縫推入 Fal.ai 批次佇列
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openVideoDialog}
              disabled={isExtracting}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              更換影片
            </button>
            <button
              onClick={() => !isExtracting && setVideoTrimmerOpen(false)}
              disabled={isExtracting}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {!activeVideo ? (
            <div className="p-12 border-2 border-dashed border-zinc-800 rounded-2xl text-center space-y-3">
              <Film className="w-10 h-10 text-indigo-400 mx-auto" />
              <div className="text-sm font-semibold text-zinc-200">尚未選擇影片檔案</div>
              <button
                onClick={openVideoDialog}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                選擇本地影片 (.mp4, .mov, .webm)
              </button>
            </div>
          ) : (
            <>
              {/* Video Player Preview */}
              <div className="rounded-xl bg-black border border-zinc-800 overflow-hidden relative aspect-video max-h-[320px] mx-auto flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={activeVideo.previewUrl}
                  controls
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime)
                    }
                  }}
                  className="max-h-[320px] w-full object-contain"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/75 border border-zinc-700/80 text-[11px] font-mono text-zinc-200">
                  {activeVideo.fileName}
                </div>
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-indigo-950/85 border border-indigo-500/40 text-[11px] font-mono text-indigo-200">
                  目前播放：{formatSeconds(currentTime)} / {formatSeconds(duration)}
                </div>
              </div>

              {/* Dual Range Slider Timeline */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                    剪裁時間區間設定 (Dual Range Trimmer)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartTimeChange(currentTime)}
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300"
                    >
                      設目前位置為起點
                    </button>
                    <button
                      onClick={() => handleEndTimeChange(currentTime)}
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300"
                    >
                      設目前位置為終點
                    </button>
                  </div>
                </div>

                {/* Visual Range Track + Dual Sliders */}
                <div className="space-y-2">
                  <div className="relative h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <div
                      className="absolute inset-y-0 bg-gradient-to-r from-indigo-600/80 to-emerald-500/80"
                      style={{
                        left: `${startPercent}%`,
                        width: `${Math.max(1, endPercent - startPercent)}%`
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">起點滑桿 (Start)</span>
                        <span className="font-mono text-indigo-400">
                          {formatSeconds(startTime)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.05}
                        value={startTime}
                        disabled={isExtracting}
                        onChange={(e) => handleStartTimeChange(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">終點滑桿 (End)</span>
                        <span className="font-mono text-emerald-400">
                          {formatSeconds(endTime)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.05}
                        value={endTime}
                        disabled={isExtracting}
                        onChange={(e) => handleEndTimeChange(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Numeric Inputs & FPS & Estimated Frames */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-800/80 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Start Time (秒)</label>
                    <input
                      type="number"
                      min={0}
                      max={endTime}
                      step={0.1}
                      value={startTime}
                      disabled={isExtracting}
                      onChange={(e) => handleStartTimeChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">End Time (秒)</label>
                    <input
                      type="number"
                      min={startTime}
                      max={duration}
                      step={0.1}
                      value={endTime}
                      disabled={isExtracting}
                      onChange={(e) => handleEndTimeChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">擷取幀率 (FPS)</label>
                    <select
                      value={fps}
                      disabled={isExtracting}
                      onChange={(e) => setFps(parseInt(e.target.value, 10))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono text-zinc-100"
                    >
                      <option value={4}>4 fps</option>
                      <option value={8}>8 fps (預設)</option>
                      <option value={12}>12 fps</option>
                      <option value={16}>16 fps</option>
                      <option value={24}>24 fps</option>
                    </select>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col justify-center">
                    <span className="text-[10px] text-indigo-300 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      預估擷取張數 ({clipDuration.toFixed(1)}s × {fps})
                    </span>
                    <span className="text-base font-bold font-mono text-white">
                      {estimatedFrames} <span className="text-xs font-normal text-indigo-300">張 PNG</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* FFmpeg Real-time Progress Bar */}
              {(isExtracting || progress) && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-200 font-medium flex items-center gap-2">
                      {isExtracting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {progress?.statusText || '正在處理影片...'}
                    </span>
                    <span className="font-mono font-bold text-indigo-400">
                      {progress?.percent ?? 0}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-200"
                      style={{ width: `${Math.max(5, progress?.percent ?? 0)}%` }}
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300">
                  ⚠️ {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {successMsg}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            擷取完成的序列影像將自動加入待處理佇列，並可直接於 Node 工作流監控
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setVideoTrimmerOpen(false)}
              disabled={isExtracting}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
            >
              關閉
            </button>
            <button
              onClick={handleExtractAndQueue}
              disabled={!activeVideo || isExtracting || estimatedFrames <= 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  FFmpeg 擷取中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  開始擷取並加入佇列 ({estimatedFrames} 張)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

