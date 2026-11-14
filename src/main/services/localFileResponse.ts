import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { extname } from 'path'
import { Readable } from 'stream'

const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml'
}

export interface ByteRange {
  start: number
  end: number
}

export function contentTypeForPath(filePath: string): string {
  return MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
}

/**
 * 解析單一 `Range: bytes=...` 標頭；無法解析或超出檔案範圍時回傳 null。
 * 支援 `bytes=start-end`、`bytes=start-`、`bytes=-suffixLength` 三種寫法。
 */
export function parseRangeHeader(header: string | null | undefined, size: number): ByteRange | null {
  if (!header) return null
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match) return null

  const startText = match[1]
  const endText = match[2]
  if (startText === '' && endText === '') return null

  if (startText === '') {
    // bytes=-N → 檔案最後 N 個 byte
    const suffixLength = Number(endText)
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null
    return { start: Math.max(0, size - suffixLength), end: size - 1 }
  }

  const start = Number(startText)
  if (!Number.isFinite(start) || start >= size) return null
  const end = endText === '' ? size - 1 : Math.min(Number(endText), size - 1)
  if (!Number.isFinite(end) || end < start) return null
  return { start, end }
}

function createFileStream(filePath: string, range?: ByteRange): ReadableStream<Uint8Array> {
  const nodeStream = range
    ? createReadStream(filePath, { start: range.start, end: range.end })
    : createReadStream(filePath)
  // 客戶端中途取消（例如 <video> 換位置）時會觸發 error，避免變成未處理例外
  nodeStream.on('error', () => undefined)
  return Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>
}

/**
 * 產生本機檔案回應，並支援 HTTP Range（206 Partial Content）。
 *
 * 為什麼一定要支援 Range：Chromium 的媒體管線只有在伺服端宣告 `Accept-Ranges: bytes`
 * 且對範圍請求回 206 時，才會把 `<video>` 視為可 seek；否則 `video.seekable` 會是
 * `[0, 0]`，設定 `currentTime` 會立刻彈回 0，拖曳時間軸時預覽畫面完全不會跟著動。
 */
export async function createLocalFileResponse(options: {
  filePath: string
  method?: string
  rangeHeader?: string | null
}): Promise<Response> {
  const { filePath, method = 'GET', rangeHeader = null } = options

  let size: number
  try {
    const info = await stat(filePath)
    if (!info.isFile()) return new Response('Not a file', { status: 404 })
    size = info.size
  } catch {
    return new Response('File not found', { status: 404 })
  }

  const baseHeaders: Record<string, string> = {
    'Content-Type': contentTypeForPath(filePath),
    'Accept-Ranges': 'bytes'
  }

  if (method === 'HEAD') {
    return new Response(null, {
      status: 200,
      headers: { ...baseHeaders, 'Content-Length': String(size) }
    })
  }

  const range = parseRangeHeader(rangeHeader, size)
  if (range) {
    return new Response(createFileStream(filePath, range), {
      status: 206,
      headers: {
        ...baseHeaders,
        'Content-Length': String(range.end - range.start + 1),
        'Content-Range': `bytes ${range.start}-${range.end}/${size}`
      }
    })
  }

  return new Response(createFileStream(filePath), {
    status: 200,
    headers: { ...baseHeaders, 'Content-Length': String(size) }
  })
}
