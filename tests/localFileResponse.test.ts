import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  contentTypeForPath,
  createLocalFileResponse,
  parseRangeHeader
} from '../src/main/services/localFileResponse'

const CONTENT = '0123456789abcdefghij' // 20 bytes

describe('parseRangeHeader', () => {
  it('parses start-end, start- and -suffix forms', () => {
    expect(parseRangeHeader('bytes=0-9', 20)).toEqual({ start: 0, end: 9 })
    expect(parseRangeHeader('bytes=5-', 20)).toEqual({ start: 5, end: 19 })
    expect(parseRangeHeader('bytes=-4', 20)).toEqual({ start: 16, end: 19 })
  })

  it('clamps the end offset to the file size', () => {
    expect(parseRangeHeader('bytes=10-999', 20)).toEqual({ start: 10, end: 19 })
  })

  it('returns null for missing, malformed or unsatisfiable ranges', () => {
    expect(parseRangeHeader(null, 20)).toBeNull()
    expect(parseRangeHeader('', 20)).toBeNull()
    expect(parseRangeHeader('items=0-9', 20)).toBeNull()
    expect(parseRangeHeader('bytes=-', 20)).toBeNull()
    expect(parseRangeHeader('bytes=30-', 20)).toBeNull()
    expect(parseRangeHeader('bytes=9-3', 20)).toBeNull()
  })
})

describe('contentTypeForPath', () => {
  it('maps common media extensions and falls back to octet-stream', () => {
    expect(contentTypeForPath('/tmp/a.MP4')).toBe('video/mp4')
    expect(contentTypeForPath('/tmp/a.mov')).toBe('video/quicktime')
    expect(contentTypeForPath('/tmp/a.png')).toBe('image/png')
    expect(contentTypeForPath('/tmp/a.unknown')).toBe('application/octet-stream')
  })
})

describe('createLocalFileResponse', () => {
  let tempDir: string
  let filePath: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'wishful-range-'))
    filePath = join(tempDir, 'sample.mp4')
    writeFileSync(filePath, CONTENT)
  })

  afterEach(() => {
    if (tempDir && existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('serves the whole file with Accept-Ranges so <video> becomes seekable', async () => {
    const response = await createLocalFileResponse({ filePath, rangeHeader: 'bytes=0-' })

    expect(response.status).toBe(206)
    expect(response.headers.get('Accept-Ranges')).toBe('bytes')
    expect(response.headers.get('Content-Type')).toBe('video/mp4')
    expect(response.headers.get('Content-Range')).toBe(`bytes 0-19/20`)
    expect(response.headers.get('Content-Length')).toBe('20')
    expect(await response.text()).toBe(CONTENT)
  })

  it('returns 206 with the requested slice', async () => {
    const response = await createLocalFileResponse({ filePath, rangeHeader: 'bytes=4-9' })

    expect(response.status).toBe(206)
    expect(response.headers.get('Content-Range')).toBe('bytes 4-9/20')
    expect(response.headers.get('Content-Length')).toBe('6')
    expect(await response.text()).toBe('456789')
  })

  it('supports suffix ranges and returns 200 when no range is requested', async () => {
    const suffix = await createLocalFileResponse({ filePath, rangeHeader: 'bytes=-5' })
    expect(suffix.status).toBe(206)
    expect(await suffix.text()).toBe('fghij')

    const full = await createLocalFileResponse({ filePath })
    expect(full.status).toBe(200)
    expect(full.headers.get('Accept-Ranges')).toBe('bytes')
    expect(full.headers.get('Content-Length')).toBe('20')
    expect(await full.text()).toBe(CONTENT)
  })

  it('handles HEAD requests without a body', async () => {
    const response = await createLocalFileResponse({ filePath, method: 'HEAD' })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Length')).toBe('20')
    expect(await response.text()).toBe('')
  })

  it('returns 404 for missing files and directories', async () => {
    const missing = await createLocalFileResponse({ filePath: join(tempDir, 'nope.mp4') })
    expect(missing.status).toBe(404)

    const dir = join(tempDir, 'folder')
    mkdirSync(dir)
    const directory = await createLocalFileResponse({ filePath: dir })
    expect(directory.status).toBe(404)
  })
})
