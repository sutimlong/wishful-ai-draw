#!/usr/bin/env node
/**
 * 從 fal.ai 公開目錄同步「所有可用文字生成影片 (text-to-video) 模型」與即時牌價。
 *
 * 執行：
 *   npm run sync:fal-text-to-video
 */

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncFalVideoCatalog } from './lib/falVideoCatalogSync.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

syncFalVideoCatalog({
  projectRoot: PROJECT_ROOT,
  mode: 'text-to-video',
  category: 'text-to-video',
  outputRelativePath: 'src/shared/falTextToVideoCatalog.ts',
  exportName: 'FAL_TEXT_TO_VIDEO_CATALOG',
  scriptFileName: 'sync-fal-text-to-video.mjs',
  syncScript: 'sync:fal-text-to-video',
  titleZh: '文生影片'
}).catch((err) => {
  console.error('同步文生影片模型失敗：', err)
  process.exit(1)
})
