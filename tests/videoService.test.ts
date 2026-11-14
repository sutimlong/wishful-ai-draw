import { describe, expect, it } from 'vitest'
import { execFileSync } from 'child_process'
import ffmpegStatic from 'ffmpeg-static'
import { existsSync, mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  calculateExtractionProgress,
  computeFilmstripFps,
  estimateFrameCount,
  extractFramesFromVideo,
  generateFilmstrip,
  parseTimemarkToSeconds
} from '../src/main/services/videoService'

describe('videoService (Phase 6: 8fps Frame Extraction)', () => {
  it('parses FFmpeg timemark strings and computes progress percentage accurately', () => {
    expect(parseTimemarkToSeconds('00:00:02.50')).toBeCloseTo(2.5)
    expect(parseTimemarkToSeconds('00:01:05.00')).toBeCloseTo(65)

    expect(calculateExtractionProgress('00:00:02.50', 5.0)).toBe(50)
    expect(calculateExtractionProgress('00:00:05.00', 5.0)).toBe(99)
  })

  it('estimates frame count using (endTime - startTime) * fps', () => {
    expect(estimateFrameCount(1.0, 3.5, 8)).toBe(20)
    expect(estimateFrameCount(0, 2, 8)).toBe(16)
    expect(estimateFrameCount(5, 5, 8)).toBe(0)
  })

  it('extracts 8fps PNG sequence frames from a real video segment using ffmpeg-static', async () => {
    if (!ffmpegStatic || !existsSync(ffmpegStatic)) {
      return
    }

    const tempDir = mkdtempSync(join(tmpdir(), 'wishful-video-test-'))
    const sampleVideoPath = join(tempDir, 'sample.mp4')

    try {
      // Generate a 1.5s synthetic test video using ffmpeg lavfi testsrc
      execFileSync(ffmpegStatic, [
        '-y',
        '-f',
        'lavfi',
        '-i',
        'color=c=blue:s=160x120:r=16:d=1.5',
        '-pix_fmt',
        'yuv420p',
        sampleVideoPath
      ])

      const progressUpdates: number[] = []
      const framePaths = await extractFramesFromVideo(
        {
          filePath: sampleVideoPath,
          startTime: 0,
          endTime: 1.0,
          fps: 8
        },
        (prog) => {
          progressUpdates.push(prog.percent)
        }
      )

      // 1.0 second at 8 fps should produce ~8 PNG frames
      expect(framePaths.length).toBeGreaterThanOrEqual(7)
      expect(framePaths.length).toBeLessThanOrEqual(10)
      expect(existsSync(framePaths[0])).toBe(true)
      expect(progressUpdates).toContain(100)
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('computes filmstrip fps from duration and count', () => {
    expect(computeFilmstripFps(10, 20)).toBeCloseTo(2)
    expect(computeFilmstripFps(4, 8)).toBeCloseTo(2)
    expect(computeFilmstripFps(0, 20)).toBe(1)
    // count 會被夾在 2 ~ 60
    expect(computeFilmstripFps(10, 1000)).toBeCloseTo(6)
  })

  it('generates evenly spaced JPEG filmstrip thumbnails in a single ffmpeg pass', async () => {
    if (!ffmpegStatic || !existsSync(ffmpegStatic)) {
      return
    }

    const tempDir = mkdtempSync(join(tmpdir(), 'wishful-filmstrip-test-'))
    const sampleVideoPath = join(tempDir, 'strip.mp4')

    try {
      execFileSync(ffmpegStatic, [
        '-y',
        '-f',
        'lavfi',
        '-i',
        'testsrc=size=160x120:rate=16:duration=1.5',
        '-pix_fmt',
        'yuv420p',
        sampleVideoPath
      ])

      const frames = await generateFilmstrip({
        filePath: sampleVideoPath,
        duration: 1.5,
        count: 8
      })

      expect(frames.length).toBeGreaterThanOrEqual(7)
      expect(frames.length).toBeLessThanOrEqual(8)
      expect(frames[0].time).toBe(0)

      for (const frame of frames) {
        expect(frame.filePath.toLowerCase().endsWith('.jpg')).toBe(true)
        expect(existsSync(frame.filePath)).toBe(true)
        expect(frame.time).toBeGreaterThanOrEqual(0)
        expect(frame.time).toBeLessThan(1.5)
      }

      const times = frames.map((frame) => frame.time)
      expect([...times].sort((a, b) => a - b)).toEqual(times)
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })
})

