import React, { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Film,
  FolderOpen,
  Keyboard,
  Layers,
  Loader2,
  Scissors,
  Sparkles,
  X
} from 'lucide-react'
import { VideoExtractProgress } from '@shared/types'
import { useBatchStore } from '../store/useBatchStore'
import { FilmstripTimeline } from './video/FilmstripTimeline'
import { VideoPreview } from './video/VideoPreview'
import { formatTimecode } from './video/timeUtils'
import { useVideoEditor } from './video/useVideoEditor'

export const VideoTrimmer: React.FC = () => {
  const isVideoTrimmerOpen = useBatchStore((s) => s.isVideoTrimmerOpen)
  const activeVideo = useBatchStore((s) => s.activeVideo)
  const setVideoTrimmerOpen = useBatchStore((s) => s.setVideoTrimmerOpen)
  const openVideoDialog = useBatchStore((s) => s.openVideoDialog)
  const addTasks = useBatchStore((s) => s.addTasks)

  const [isExtracting, setIsExtracting] = useState(false)
  const [progress, setProgress] = useState<VideoExtractProgress | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const editor = useVideoEditor({
    filePath: activeVideo?.filePath ?? null,
    isOpen: isVideoTrimmerOpen,
    shortcutsEnabled: isVideoTrimmerOpen && !isExtracting,
    onEscape: () => {
      if (!isExtracting) setVideoTrimmerOpen(false)
    }
  })

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

  const { fps, setFps, startTime, endTime, clipDuration, duration } = editor
  const estimatedFrames =
    clipDuration > 0 && fps > 0 ? Math.max(1, Math.round(clipDuration * fps)) : 0

  const handleExtractAndQueue = async (): Promise<void> => {
    if (!activeVideo) return
    if (endTime <= startTime) {
      setErrorMsg('終點時間 (End Time) 必須大於起點時間 (Start Time)')
      return
    }

    editor.pause()
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

  if (!isVideoTrimmerOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                影片剪輯與 {fps} fps 序列圖擷取器 (Video Editor)
              </h2>
              <p className="text-[11px] text-zinc-400">
                拖曳時間軸 In/Out 把手設定範圍，透過本地 FFmpeg 轉成連續 PNG 並推入批次佇列
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openVideoDialog}
              disabled={isExtracting}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              更換影片
            </button>
            <button
              onClick={() => !isExtracting && setVideoTrimmerOpen(false)}
              disabled={isExtracting}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
              <VideoPreview
                src={activeVideo.previewUrl}
                fileName={activeVideo.fileName}
                editor={editor}
                disabled={isExtracting}
              />

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <FilmstripTimeline
                  duration={duration}
                  currentTime={editor.currentTime}
                  startTime={startTime}
                  endTime={endTime}
                  fps={fps}
                  filmstrip={editor.filmstrip}
                  isLoadingFilmstrip={editor.isLoadingFilmstrip}
                  disabled={isExtracting}
                  onSeek={editor.scrubTo}
                  onChangeStart={editor.setStartTime}
                  onChangeEnd={editor.setEndTime}
                  onScrubStart={editor.beginScrub}
                  onScrubEnd={editor.endScrub}
                />

                <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={editor.markIn}
                      disabled={isExtracting || duration <= 0}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-indigo-500/40 text-[11px] text-indigo-200 disabled:opacity-50"
                    >
                      設為起點 (I)
                    </button>
                    <button
                      onClick={editor.markOut}
                      disabled={isExtracting || duration <= 0}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 text-[11px] text-emerald-200 disabled:opacity-50"
                    >
                      設為終點 (O)
                    </button>
                    <button
                      onClick={editor.goToIn}
                      disabled={isExtracting || duration <= 0}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300 disabled:opacity-50"
                    >
                      跳到起點 (Q)
                    </button>
                    <button
                      onClick={editor.goToOut}
                      disabled={isExtracting || duration <= 0}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300 disabled:opacity-50"
                    >
                      跳到終點 (W)
                    </button>
                  </div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                    <Keyboard className="w-3.5 h-3.5" />
                    Space 播放 · J/K/L 穿梭 · ←→ 逐格 · Shift+←→ ±1 秒 · ↑↓ In/Out
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                    剪裁參數與輸出設定
                  </span>
                  <span className="font-mono text-[11px] text-zinc-400">
                    選取長度 {formatTimecode(clipDuration, fps)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">起點 In (秒)</label>
                    <input
                      type="number"
                      min={0}
                      max={endTime}
                      step={fps > 0 ? 1 / fps : 0.1}
                      value={startTime}
                      disabled={isExtracting}
                      onChange={(e) => editor.setStartTime(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">終點 Out (秒)</label>
                    <input
                      type="number"
                      min={startTime}
                      max={duration}
                      step={fps > 0 ? 1 / fps : 0.1}
                      value={endTime}
                      disabled={isExtracting}
                      onChange={(e) => editor.setEndTime(parseFloat(e.target.value) || 0)}
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
                      {[4, 8, 12, 16, 24].map((option) => (
                        <option key={option} value={option}>
                          {option} fps{option === 8 ? ' (預設)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col justify-center">
                    <span className="text-[10px] text-indigo-300 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      預估擷取張數 ({clipDuration.toFixed(1)}s × {fps})
                    </span>
                    <span className="text-base font-bold font-mono text-white">
                      {estimatedFrames}{' '}
                      <span className="text-xs font-normal text-indigo-300">張 PNG</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-800/80">
                  <span>In {formatTimecode(startTime, fps)}</span>
                  <span>Duration {formatTimecode(clipDuration, fps)}</span>
                  <span>Out {formatTimecode(endTime, fps)}</span>
                </div>
              </div>

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

        <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-500">
            擷取完成的序列影像將自動加入待處理佇列，並可直接於 Node 工作流監控
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setVideoTrimmerOpen(false)}
              disabled={isExtracting}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium disabled:opacity-50"
            >
              關閉 (Esc)
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
