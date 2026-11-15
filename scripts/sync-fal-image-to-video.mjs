#!/usr/bin/env node
/**
 * 從 fal.ai 公開目錄同步「所有可用圖片生成影片 (image-to-video) 模型」與即時牌價。
 *
 * 執行：
 *   npm run sync:fal-image-to-video
 */

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncFalVideoCatalog } from './lib/falVideoCatalogSync.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

syncFalVideoCatalog({
  projectRoot: PROJECT_ROOT,
  mode: 'image-to-video',
  category: 'image-to-video',
  outputRelativePath: 'src/shared/falImageToVideoCatalog.ts',
  exportName: 'FAL_IMAGE_TO_VIDEO_CATALOG',
  scriptFileName: 'sync-fal-image-to-video.mjs',
  syncScript: 'sync:fal-image-to-video',
  titleZh: '圖生影片'
}).catch((err) => {
  console.error('同步圖生影片模型失敗：', err)
  process.exit(1)
})
