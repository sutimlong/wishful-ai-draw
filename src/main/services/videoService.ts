import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { mkdir, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { tmpdir } from 'os'
import { basename, extname, join } from 'path'
import { VideoExtractOptions, VideoExtractProgress, VideoFilmstripOptions } from '../../shared/types'

// Configure fluent-ffmpeg to use the bundled static binary (supporting unpacked asar in production)
if (ffmpegStatic) {
  const resolvedBinaryPath = ffmpegStatic.replace('app.asar', 'app.asar.unpacked')
  ffmpeg.setFfmpegPath(resolvedBinaryPath)
}

/**
 * 將 FFmpeg timemark (例如 "00:01:23.45") 轉換為秒數
 */
export function parseTimemarkToSeconds(timemark?: string): number {
  if (!timemark || typeof timemark !== 'string') return 0
  const parts = timemark.trim().split(':')
  if (parts.length !== 3) return 0
  const hours = parseFloat(parts[0]) || 0
  const minutes = parseFloat(parts[1]) || 0
  const seconds = parseFloat(parts[2]) || 0
  return hours * 3600 + minutes * 60 + seconds
}

/**
 * 根據已處理秒數與目標剪裁區間長度計算進度百分比 (0 ~ 99)
 */
export function calculateExtractionProgress(
  timemark: string | undefined,
  clipDurationSec: number,
  rawPercent?: number
): number {
  if (clipDurationSec > 0 && timemark) {
    const elapsed = parseTimemarkToSeconds(timemark)
    const ratio = Math.round((elapsed / clipDurationSec) * 100)
    if (ratio > 0) {
      return Math.max(1, Math.min(99, ratio))
    }
  }
  if (typeof rawPercent === 'number' && !Number.isNaN(rawPercent)) {
    return Math.max(1, Math.min(99, Math.round(rawPercent)))
  }
  return 10
}

/**
 * 計算預估擷取張數：Math.max(1, Math.round((endTime - startTime) * fps))
 */
export function estimateFrameCount(startTime: number, endTime: number, fps = 8): number {
  const duration = Math.max(0, endTime - startTime)
  if (duration === 0) return 0
  return Math.max(1, Math.round(duration * fps))
}

/**
 * 在系統暫存區建立專屬序列圖輸出資料夾並執行 FFmpeg 8fps 擷取
 */
export async function extractFramesFromVideo(
  options: VideoExtractOptions,
  onProgress?: (progress: VideoExtractProgress) => void
): Promise<string[]> {
  const { filePath, startTime, endTime, fps = 8 } = options

  if (!filePath || !existsSync(filePath)) {
    throw new Error(`找不到影片檔案：${filePath}`)
  }

  const safeStart = Math.max(0, Number(startTime) || 0)
  const safeEnd = Number(endTime) || 0
  const clipDuration = safeEnd - safeStart

  if (clipDuration <= 0) {
    throw new Error('剪裁終點時間 (End Time) 必須大於起點時間 (Start Time)')
  }

  const safeFps = Math.max(1, Math.min(60, Number(fps) || 8))
  const videoBaseName = basename(filePath, extname(filePath)).replace(/[^a-zA-Z0-9_-]/g, '_')
  const sessionFolder = `${videoBaseName}_${Date.now()}`
  const outputDir = join(tmpdir(), 'wishful-ai-video-frames', sessionFolder)

  await mkdir(outputDir, { recursive: true })

  const outputPattern = join(outputDir, `${videoBaseName}_frame_%04d.png`)

  onProgress?.({
    filePath,
    percent: 2,
    statusText: `正在初始化 FFmpeg (${safeFps} fps)...`
  })

  await new Promise<void>((resolve, reject) => {
    ffmpeg(filePath)
      .setStartTime(safeStart)
      .setDuration(clipDuration)
      .outputOptions([`-r ${safeFps}`, '-f image2'])
      .output(outputPattern)
      .on('progress', (prog) => {
        const percent = calculateExtractionProgress(prog.timemark, clipDuration, prog.percent)
        onProgress?.({
          filePath,
          percent,
          currentFps: prog.currentFps,
          timemark: prog.timemark,
          statusText: `正在擷取序列影像 (${percent}%)...`
        })
      })
      .on('end', () => {
        resolve()
      })
      .on('error', (err) => {
        reject(new Error(`FFmpeg 影片擷取失敗: ${err.message}`))
      })
      .run()
  })

  const files = await readdir(outputDir)
  const framePaths = files
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => join(outputDir, f))

  onProgress?.({
    filePath,
    percent: 100,
    statusText: `擷取完成！共產生 ${framePaths.length} 張序列圖`
  })

  return framePaths
}

/** 單張已產生的膠捲縮圖（尚未轉成 URL，方便單元測試與解耦 IPC） */
export interface GeneratedFilmstripFrame {
  /** 此縮圖對應的影片秒數 */
  time: number
  /** 縮圖檔案的絕對路徑 */
  filePath: string
}

/**
 * 依影片長度與目標張數，計算均勻取樣時應使用的影格率 (fps)。
 * 例如 10 秒要 20 張 → 2 fps。
 */
export function computeFilmstripFps(durationSec: number, count: number): number {
  const safeDuration = Number(durationSec) || 0
  const safeCount = Math.max(2, Math.min(60, Math.round(Number(count) || 20)))
  if (safeDuration <= 0) return 1
  return safeCount / safeDuration
}

/**
 * 以單一 FFmpeg pass 均勻取樣，產生時間軸膠捲縮圖 (JPEG)。
 * 不需 ffprobe：影片長度由前端 <video> metadata 提供。
 */
export async function generateFilmstrip(
  options: VideoFilmstripOptions,
  onProgress?: (progress: VideoExtractProgress) => void
): Promise<GeneratedFilmstripFrame[]> {
  const { filePath, duration } = options
  const count = Math.max(8, Math.min(24, Math.round(Number(options.count) || 20)))

  if (!filePath || !existsSync(filePath)) {
    throw new Error(`找不到影片檔案：${filePath}`)
  }

  const safeDuration = Number(duration) || 0
  if (safeDuration <= 0) {
    throw new Error('影片長度無效，無法產生時間軸縮圖')
  }

  const fps = computeFilmstripFps(safeDuration, count)
  const videoBaseName = basename(filePath, extname(filePath)).replace(/[^a-zA-Z0-9_-]/g, '_')
  const sessionFolder = `${videoBaseName}_strip_${Date.now()}`
  const outputDir = join(tmpdir(), 'wishful-ai-video-filmstrip', sessionFolder)

  await mkdir(outputDir, { recursive: true })

  const outputPattern = join(outputDir, `${videoBaseName}_thumb_%03d.jpg`)

  onProgress?.({
    filePath,
    percent: 5,
    statusText: `正在產生時間軸縮圖 (${count} 張)...`
  })

  await new Promise<void>((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions([
        `-vf fps=${fps.toFixed(6)},scale=160:-1`,
        `-frames:v ${count}`,
        '-q:v 4',
        '-f image2'
      ])
      .output(outputPattern)
      .on('end', () => {
        resolve()
      })
      .on('error', (err) => {
        reject(new Error(`FFmpeg 時間軸縮圖產生失敗: ${err.message}`))
      })
      .run()
  })

  const files = await readdir(outputDir)
  const framePaths = files
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => join(outputDir, f))

  const total = framePaths.length

  onProgress?.({
    filePath,
    percent: 100,
    statusText: `時間軸縮圖完成，共 ${total} 張`
  })

  return framePaths.map((thumbPath, index) => ({
    time: Number(((index / Math.max(1, total)) * safeDuration).toFixed(3)),
    filePath: thumbPath
  }))
}

