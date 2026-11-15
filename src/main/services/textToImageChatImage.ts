import { nativeImage } from 'electron'
import { readFileSync } from 'fs'
import { extname } from 'path'

/** 送給 DeepSeek 看圖前縮圖的最長邊（降低 base64 大小與 token 用量） */
const MAX_VISION_IMAGE_DIMENSION = 1024

function mimeTypeFromPath(filePath: string): string | null {
  switch (extname(filePath).toLowerCase()) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    default:
      return null
  }
}

/**
 * 把本機圖片轉成 DeepSeek 可接受的 data URL。
 *
 * 優先使用 Electron nativeImage 縮到 1024px 並轉 JPEG（大幅減少請求大小）；
 * 若 nativeImage 無法解析（例如部分 WebP），退回原始檔案的 base64。
 */
export function toTextToImageChatImageDataUrl(filePath: string): string | null {
  try {
    const image = nativeImage.createFromPath(filePath)
    if (!image.isEmpty()) {
      const size = image.getSize()
      let resized = image
      if (size.width > 0 && size.height > 0) {
        const scale = Math.min(
          1,
          MAX_VISION_IMAGE_DIMENSION / Math.max(size.width, size.height)
        )
        if (scale < 1) {
          resized = image.resize({
            width: Math.max(1, Math.round(size.width * scale)),
            height: Math.max(1, Math.round(size.height * scale)),
            quality: 'good'
          })
        }
      }
      const jpeg = resized.toJPEG(82)
      if (jpeg.length > 0) {
        return `data:image/jpeg;base64,${jpeg.toString('base64')}`
      }
    }

    const mimeType = mimeTypeFromPath(filePath)
    if (!mimeType) return null
    const buffer = readFileSync(filePath)
    return `data:${mimeType};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}
