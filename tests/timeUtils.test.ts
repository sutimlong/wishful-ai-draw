import { describe, expect, it } from 'vitest'
import {
  clamp,
  formatTimecode,
  percentToTime,
  resolveFilmstripCount,
  snapToFrame,
  timeToPercent
} from '../src/renderer/src/components/video/timeUtils'

describe('videoEditor timeUtils', () => {
  it('clamps values safely', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(15, 0, 10)).toBe(10)
    expect(clamp(Number.NaN, 3, 10)).toBe(3)
  })

  it('formats HH:MM:SS:FF timecodes when fps is provided', () => {
    expect(formatTimecode(0, 8)).toBe('00:00:00:00')
    expect(formatTimecode(1.125, 8)).toBe('00:00:01:01')
    expect(formatTimecode(3661.25, 4)).toBe('01:01:01:01')
    expect(formatTimecode(-2, 8)).toBe('00:00:00:00')
  })

  it('formats HH:MM:SS.mmm when fps is unknown', () => {
    expect(formatTimecode(65.5)).toBe('00:01:05.500')
    expect(formatTimecode(0, 0)).toBe('00:00:00.000')
  })

  it('snaps times to the nearest frame boundary', () => {
    expect(snapToFrame(1.1, 8)).toBeCloseTo(1.125)
    expect(snapToFrame(1.1, 0)).toBeCloseTo(1.1)
    expect(snapToFrame(-1, 8)).toBe(0)
  })

  it('converts between time and timeline percentage', () => {
    expect(timeToPercent(5, 10)).toBeCloseTo(50)
    expect(timeToPercent(15, 10)).toBe(100)
    expect(timeToPercent(5, 0)).toBe(0)

    expect(percentToTime(50, 10)).toBeCloseTo(5)
    expect(percentToTime(150, 10)).toBeCloseTo(10)
    expect(percentToTime(50, 0)).toBe(0)
  })

  it('resolves filmstrip thumbnail count within 8 ~ 24', () => {
    expect(resolveFilmstripCount(5)).toBe(8)
    expect(resolveFilmstripCount(10)).toBe(10)
    expect(resolveFilmstripCount(100)).toBe(24)
    expect(resolveFilmstripCount(0)).toBe(8)
  })
})
