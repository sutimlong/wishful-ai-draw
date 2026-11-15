import React from 'react'
import { useImageToVideoStore } from '../store/useTextToVideoStore'
import { VideoGenerationPage } from './TextToVideoPage'

/**
 * 「圖片生成影片」頁面，複用與「文字生成影片」相同的介面配置與雙模式互動，模型選單載入 fal.ai 圖生影片目錄。
 */
export const ImageToVideoPage: React.FC = () => {
  const store = useImageToVideoStore()
  return <VideoGenerationPage modeKind="image-to-video" store={store} />
}
