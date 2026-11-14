import { nativeImage, protocol } from 'electron'
import { createLocalFileResponse } from './localFileResponse'

/**
 * 註冊 `local-media://` 協定。
 *
 * - `local-media://image?path=...` 讀取本機圖片／影片，並支援 Range（讓 <video> 可以 seek）
 * - `local-media://image?path=...&thumb=1` 優先回傳作業系統產生的縮圖
 */
export function registerLocalMediaProtocol(): void {
  protocol.handle('local-media', async (request) => {
    try {
      const url = new URL(request.url)
      const filePath = url.searchParams.get('path')
      const isThumb = url.searchParams.get('thumb') === '1'
      if (!filePath) {
        return new Response('Missing path parameter', { status: 400 })
      }

      if (isThumb) {
        try {
          const thumb = await nativeImage.createThumbnailFromPath(filePath, {
            width: 360,
            height: 360
          })
          if (!thumb.isEmpty()) {
            const jpegBuffer = thumb.toJPEG(82)
            return new Response(new Uint8Array(jpegBuffer), {
              headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=3600'
              }
            })
          }
        } catch {
          // Fallback to full image fetch if OS thumbnail generation fails
        }
      }

      return await createLocalFileResponse({
        filePath,
        method: request.method,
        rangeHeader: request.headers.get('Range')
      })
    } catch (err) {
      console.error('Protocol local-media error:', err)
      return new Response('Failed to load local file', { status: 500 })
    }
  })
}
