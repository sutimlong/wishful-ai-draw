// ⚠️ AUTO-GENERATED FILE — 請勿手動編輯
// 由 `npm run sync:fal-models`（scripts/sync-fal-models.mjs）自動產生
// 資料來源：fal.ai 公開模型目錄（categories=image-to-image）、各模型 OpenAPI schema 與模型頁面計價資訊
// 產生日期：2026-11-14　模型數：280
import { DEFAULT_FAL_PRESETS, FalModelPreset } from './types'

/** 精選（人工驗證）模型的分組名稱，永遠排在下拉選單最前面 */
export const CURATED_MODEL_GROUP = '精選推薦（已驗證）'

/**
 * 由 fal.ai 目錄同步而來的模型（依實驗室分組，組內依名稱排序）。
 * `unsupportedFields` 為該模型 schema 不接受的參數，送出前會自動剔除；
 * `pricing` 為 fal.ai 公布的計價資訊（含換算後的單張預估金額）。
 */
const SYNCED_FAL_MODELS: FalModelPreset[] = [
  {
    id: 'fal-ai/image-apps-v2/age-modify',
    name: 'Age Modify',
    description: 'Modify a face to look younger or older while keeping identity realistic.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/aura-sr',
    name: 'AuraSR',
    description: 'Upscale your images with AuraSR.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/ben/v2/image',
    name: 'ben-v2-image',
    description: 'A fast and high quality model for image background removal.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/birefnet',
    name: 'Birefnet Background Removal',
    description: 'bilateral reference framework (BiRefNet) for high-resolution dichotomous image segmentation (DIS)',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/birefnet/v2',
    name: 'Birefnet Background Removal V2',
    description: 'bilateral reference framework (BiRefNet) for high-resolution dichotomous image segmentation (DIS)',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/boogu-image/edit',
    name: 'Boogu Image',
    description: 'Image To Image Model using Boogu-Image',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.04, basis: '$0.04 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 4,
    }
  },
  {
    id: 'fal-ai/codeformer',
    name: 'CodeFormer',
    description: 'Fix distorted or blurred photos of people with CodeFormer.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.0021, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.0021, basis: '$0.0021 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/creative-upscaler',
    name: 'Creative Upscaler',
    description: 'Create creative upscaled images.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'strength', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {
      num_inference_steps: 20,
      guidance_scale: 7.5,
    }
  },
  {
    id: 'fal-ai/ddcolor',
    name: 'DDColor',
    description: 'Bring colors into old or new black and white photos with DDColor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.001, basis: '$0.001 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/dwpose',
    name: 'DWPose Pose Prediction',
    description: 'Predict poses from images.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'seconds', unitPriceUsd: 0.0006, basis: '依使用秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/evf-sam',
    name: 'EVF-SAM2 Segmentation',
    description: 'EVF-SAM2 combines natural language understanding with advanced segmentation capabilities, allowing you to precisely mask image regions using intuitive…',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.005, unit: '1', unitPriceUsd: 0.005, basis: 'fal 計價單位：每次' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-apps-v2/expression-change',
    name: 'Expression Change',
    description: 'Change facial expressions in photos with realistic results.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/florence-2-large/dense-region-caption',
    name: 'Florence-2 Large · florence-2-large/dense-region-caption',
    description: 'Florence-2 is an advanced vision foundation model that uses a prompt-based approach to handle a wide range of vision and vision-language tasks',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/florence-2-large/object-detection',
    name: 'Florence-2 Large · florence-2-large/object-detection',
    description: 'Florence-2 is an advanced vision foundation model that uses a prompt-based approach to handle a wide range of vision and vision-language tasks',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/florence-2-large/ocr-with-region',
    name: 'Florence-2 Large · florence-2-large/ocr-with-region',
    description: 'Florence-2 is an advanced vision foundation model that uses a prompt-based approach to handle a wide range of vision and vision-language tasks',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/florence-2-large/region-proposal',
    name: 'Florence-2 Large · florence-2-large/region-proposal',
    description: 'Florence-2 is an advanced vision foundation model that uses a prompt-based approach to handle a wide range of vision and vision-language tasks',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-apps-v2/hair-change',
    name: 'Hair Change',
    description: 'Change hairstyles and hair colors in photos realistically.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-apps-v2/headshot-photo',
    name: 'Headshot Generator',
    description: 'Generate professional headshot photos with customizable backgrounds.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/iclight-v2',
    name: 'IC-Light-v2 for Image Relighting',
    description: 'An endpoint for re-lighting photos and changing their backgrounds per a given description',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.1, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.1, basis: '$0.1 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 5,
    }
  },
  {
    id: 'fal-ai/image-editing/baby-version',
    name: 'Image Editing',
    description: 'Transform any person into their baby version, while preserving the original pose and expression with childlike features.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/age-progression',
    name: 'Image Editing Age Progression',
    description: 'See how you or others might look at different ages, from younger to older, while preserving core facial features.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/background-change',
    name: 'Image Editing Background Change',
    description: 'Replace your photo\'s background with any scene you desire, from beach sunsets to urban landscapes, with perfect lighting and shadows',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/broccoli-haircut',
    name: 'Image Editing Broccoli Haircut',
    description: 'Transform your character\'s hair into broccoli style while keeping the original characters likeness',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'output_format', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/cartoonify',
    name: 'Image Editing Cartoonify',
    description: 'Transform your photos into vibrant cool cartoons with bold outlines and rich colors.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/color-correction',
    name: 'Image Editing Color Correction',
    description: 'Perfect your photos with professional color grading, balanced tones, and vibrant yet natural colors',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/expression-change',
    name: 'Image Editing Expression Change',
    description: 'Change facial expressions in photos to any emotion you desire, from smiles to serious looks.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/face-enhancement',
    name: 'Image Editing Face Enhancement',
    description: 'Enhance facial features with professional retouching while maintaining a natural, realistic look',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/hair-change',
    name: 'Image Editing Hair Change',
    description: 'Experiment with different hairstyles, from bald to any style you can imagine, while maintaining natural lighting and realistic results.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/object-removal',
    name: 'Image Editing Object Removal',
    description: 'Remove unwanted objects or people from your photos while seamlessly blending the background.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/photo-restoration',
    name: 'Image Editing Photo Restoration',
    description: 'Restore and enhance old or damaged photos by removing imperfections, adding color while preserving the original character and details of the image.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/plushie-style',
    name: 'Image Editing Plushie Style',
    description: 'Transform your photos into cool plushies while keeping the original characters likeness',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'output_format', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/professional-photo',
    name: 'Image Editing Professional Photo',
    description: 'Turn your casual photos into stunning professional studio portraits with perfect lighting and high-end photography style.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/realism',
    name: 'Image Editing Realism',
    description: 'Add details to faces, enhance face features, remove blur.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'output_format', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/reframe',
    name: 'Image Editing Reframe',
    description: 'The reframe endpoint intelligently adjusts an image\'s aspect ratio while preserving the main subject\'s position, composition, pose, and perspective',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/retouch',
    name: 'Image Editing Retouch',
    description: 'Retouch photos of faces. Remove blemishes and improve the skin.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'output_format', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/scene-composition',
    name: 'Image Editing Scene Composition',
    description: 'Place your subject in any scene you imagine, from enchanted forests to urban settings, with professional composition and lighting',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/style-transfer',
    name: 'Image Editing Style Transfer',
    description: 'Transform your photos into artistic masterpieces inspired by famous styles like Van Gogh\'s Starry Night or any artistic style you choose.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/text-removal',
    name: 'Image Editing Text Removal',
    description: 'Remove all text and writing from images while preserving the background and natural appearance.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/time-of-day',
    name: 'Image Editing Time Of Day',
    description: 'Transform your photos to any time of day, from golden hour to midnight, with appropriate lighting and atmosphere.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/weather-effect',
    name: 'Image Editing Weather Effect',
    description: 'Add realistic weather effects like snowfall, rain, or fog to your photos while maintaining the scene\'s mood.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/wojak-style',
    name: 'Image Editing Wojak Style',
    description: 'Transform your photos into wojak style while keeping the original characters likeness',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'output_format', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-editing/youtube-thumbnails',
    name: 'Image Editing Youtube Thumbnails',
    description: 'Generate YouTube thumbnails with custom text',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/image-apps-v2/outpaint',
    name: 'Image Outpaint',
    description: 'Directional outpainting. Choose edges to expand. left, right, top, or center (uniform all sides). Only expanded areas are generated; an optional zoom-out…',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-preprocessors/depth-anything/v2',
    name: 'Image Preprocessors · image-preprocessors/depth-anything/v2',
    description: 'Depth Anything v2 preprocessor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-preprocessors/hed',
    name: 'Image Preprocessors · image-preprocessors/hed',
    description: 'Holistically-Nested Edge Detection (HED) preprocessor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-preprocessors/lineart',
    name: 'Image Preprocessors · image-preprocessors/lineart',
    description: 'Line art preprocessor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-preprocessors/midas',
    name: 'Image Preprocessors · image-preprocessors/midas',
    description: 'MiDaS depth estimation preprocessor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-preprocessors/mlsd',
    name: 'Image Preprocessors · image-preprocessors/mlsd',
    description: 'M-LSD line segment detection preprocessor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-preprocessors/pidi',
    name: 'Image Preprocessors · image-preprocessors/pidi',
    description: 'PIDI (Pidinet) preprocessor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-preprocessors/sam',
    name: 'Image Preprocessors · image-preprocessors/sam',
    description: 'Segment Anything Model (SAM) preprocessor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-preprocessors/scribble',
    name: 'Image Preprocessors · image-preprocessors/scribble',
    description: 'Scribble preprocessor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-preprocessors/teed',
    name: 'Image Preprocessors · image-preprocessors/teed',
    description: 'TEED (Temporal Edge Enhancement Detection) preprocessor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-preprocessors/zoe',
    name: 'Image Preprocessors · image-preprocessors/zoe',
    description: 'ZoeDepth preprocessor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image2svg',
    name: 'Image2svg',
    description: 'Image2SVG transforms raster images into clean vector graphics, preserving visual quality while enabling scalable, customizable SVG outputs with precise…',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.005, unit: 'images', unitPriceUsd: 0.005, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/live-portrait/image',
    name: 'Live Portrait',
    description: 'Transfer expression from a video to a portrait.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-apps-v2/makeup-application',
    name: 'Makeup Changer',
    description: 'Apply realistic makeup styles with adjustable intensity.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/imageutils/marigold-depth',
    name: 'Marigold Depth Estimation',
    description: 'Create depth maps using Marigold depth estimation.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'output_format', 'strength', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {
      num_inference_steps: 10,
    }
  },
  {
    id: 'fal-ai/marigold-v2',
    name: 'Marigold V2 Depth',
    description: 'Estimate depth from a single image with Marigold V2, a diffusion-based depth model built on Qwen-Image-Edit, returning a colorized depth map.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, unit: 'images', unitPriceUsd: 0.03, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/imageutils/depth',
    name: 'Midas Depth Estimation',
    description: 'Create depth maps using Midas depth estimation.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/nafnet/deblur',
    name: 'NAFNet-deblur',
    description: 'Use NAFNet to fix issues like blurriness and noise in your images. This model specializes in image restoration and can help enhance the overall quality of…',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.0225, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.0225, basis: '$0.0225 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/nafnet/denoise',
    name: 'NAFNet-denoise',
    description: 'Use NAFNet to fix issues like blurriness and noise in your images. This model specializes in image restoration and can help enhance the overall quality of…',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.0225, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.0225, basis: '$0.0225 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/object-removal',
    name: 'Object Removal · object-removal',
    description: 'Removes objects and their visual effects using natural language, replacing them with contextually appropriate content',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.006, unit: 'images', unitPriceUsd: 0.006, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/object-removal/bbox',
    name: 'Object Removal · object-removal/bbox',
    description: 'Removes box-selected objects and their visual effects, seamlessly reconstructing the scene with contextually appropriate content.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.006, unit: 'images', unitPriceUsd: 0.006, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-apps-v2/perspective',
    name: 'Perspective Change',
    description: 'Easily adjust the perspective of any image to different angles.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-apps-v2/photo-restoration',
    name: 'Photo Restoration',
    description: 'Restore old or damaged photos by fixing colors, scratches, and resolution.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-apps-v2/photography-effects',
    name: 'Photography Effects',
    description: 'Apply diverse photography styles and effects to transform your images.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.4, unit: 'images', unitPriceUsd: 0.4, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-apps-v2/portrait-enhance',
    name: 'Portrait Enhance',
    description: 'Enhance and refine portrait photos with improved clarity and detail.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.4, unit: 'images', unitPriceUsd: 0.4, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing',
    name: 'Post Processing',
    description: 'Post Processing is an endpoint that can enhance images using a variety of techniques including grain, blur, sharpen, and more.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: '1', unitPriceUsd: 0.001, basis: 'fal 計價單位：每次' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing/blur',
    name: 'Post Processing Blur',
    description: 'Apply Gaussian or Kuwahara blur effects with adjustable radius and sigma parameters',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'images', unitPriceUsd: 0.001, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing/chromatic-aberration',
    name: 'Post Processing Chromatic Aberration',
    description: 'Create chromatic aberration by shifting red, green, and blue channels horizontally or vertically with customizable shift amounts.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'images', unitPriceUsd: 0.001, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing/color-correction',
    name: 'Post Processing Color Correction',
    description: 'Adjust color temperature, brightness, contrast, saturation, and gamma values for color correction.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'images', unitPriceUsd: 0.001, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing/color-tint',
    name: 'Post Processing Color Tint',
    description: 'Apply various color tints (sepia, red, green, blue, cyan, magenta, yellow, purple, orange, warm, cool, lime, navy, vintage, rose, teal, maroon, peach,…',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'images', unitPriceUsd: 0.001, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing/desaturate',
    name: 'Post Processing Desaturate',
    description: 'Reduce color saturation using different methods (luminance Rec.709, luminance Rec.601, average, lightness) with adjustable factor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'images', unitPriceUsd: 0.001, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing/dodge-burn',
    name: 'Post Processing Dodge Burn',
    description: 'Apply dodge and burn effects with multiple modes and adjustable intensity.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'images', unitPriceUsd: 0.001, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing/grain',
    name: 'Post Processing Grain',
    description: 'Apply film grain effect with different styles (modern, analog, kodak, fuji, cinematic, newspaper) and customizable intensity and scale',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'images', unitPriceUsd: 0.001, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing/parabolize',
    name: 'Post Processing Parabolize',
    description: 'Apply a parabolic distortion effect with configurable coefficient and vertex position.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'images', unitPriceUsd: 0.001, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing/sharpen',
    name: 'Post Processing Sharpen',
    description: 'Apply sharpening effects with three modes: basic unsharp mask, smart sharpening with edge preservation, and Contrast Adaptive Sharpening (CAS).',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'images', unitPriceUsd: 0.001, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing/solarize',
    name: 'Post Processing Solarize',
    description: 'Apply solarization effect by inverting pixel values above a threshold',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'images', unitPriceUsd: 0.001, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/post-processing/vignette',
    name: 'Post Processing Vignette',
    description: 'Add a darkening vignette effect around the edges of the image with adjustable strength',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'images', unitPriceUsd: 0.001, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-apps-v2/relighting',
    name: 'Relighting',
    description: 'Adjust and enhance images with different lighting styles.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/imageutils/rembg',
    name: 'Remove Background',
    description: 'Remove the background from an image.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/sam2/auto-segment',
    name: 'Segment Anything Model 2 · sam2/auto-segment',
    description: 'SAM 2 is a model for segmenting images automatically. It can return individual masks or a single mask for the entire image.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/sam2/image',
    name: 'Segment Anything Model 2 · sam2/image',
    description: 'SAM 2 is a model for segmenting images and videos in real-time.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/fast-sdxl/image-to-image',
    name: 'Stable Diffusion XL',
    description: 'Run SDXL at the speed of light',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {
      strength: 0.95,
      num_inference_steps: 25,
      guidance_scale: 7.5,
    }
  },
  {
    id: 'fal-ai/fast-lightning-sdxl/image-to-image',
    name: 'Stable Diffusion XL Lightning',
    description: 'Run SDXL at the speed of light',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {
      strength: 0.95,
      num_inference_steps: 4,
    }
  },
  {
    id: 'fal-ai/image-apps-v2/style-transfer',
    name: 'Style Transfer',
    description: 'Apply artistic styles like impressionism, cubism, or surrealism to your images.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/image-apps-v2/texture-transform',
    name: 'Texture Transform',
    description: 'Transform objects with different surface textures like marble, wood, or fabric.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/esrgan',
    name: 'Upscale Images',
    description: 'Upscale images by a given factor.',
    group: 'fal.ai 工具與影像處理',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', unitPriceUsd: 0.00111, basis: '依運算秒數計費' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux-2/klein/realtime',
    name: 'Flux 2 [klein] Realtime',
    description: 'Realtime generation with FLUX.2 [klein] from Black Forest Labs.',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'strength', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', unitPriceUsd: 0.00194, basis: '依運算秒數計費' },
    defaultParams: {
      num_inference_steps: 3,
    }
  },
  {
    id: 'fal-ai/flux-2/edit',
    name: 'FLUX 2 Edit',
    description: 'Image-to-image editing with FLUX.2 [dev] from Black Forest Labs. Precise modifications using natural language descriptions and hex color control.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.024, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.012, basis: '$0.012 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 2.5,
    }
  },
  {
    id: 'fal-ai/flux-2/flash/edit',
    name: 'FLUX 2 Flash Edit',
    description: 'Image-to-image editing with FLUX.2 [dev] from Black Forest Labs. Precise modifications using natural language descriptions and hex color control—in a flash.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'num_inference_steps', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.005, basis: '$0.005 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {
      guidance_scale: 2.5,
    }
  },
  {
    id: 'fal-ai/flux-2-flex/edit',
    name: 'Flux 2 Flex',
    description: 'Image editing with FLUX.2 [flex] from Black Forest Labs. Supports multi-reference editing with customizable inference steps and enhanced text rendering.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'num_images'],
    pricing: { perImageUsd: 0.1, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.05, basis: '$0.05 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-2/lora/edit',
    name: 'FLUX 2 Lora Edit',
    description: 'Image-to-image editing with LoRA support for FLUX.2 [dev] from Black Forest Labs. Specialized style transfer and domain-specific modifications.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.042, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.021, basis: '$0.021 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 2.5,
    }
  },
  {
    id: 'fal-ai/flux-2-lora-gallery/add-background',
    name: 'Flux 2 Lora Gallery · flux-2-lora-gallery/add-background',
    description: 'Add a background to images with white/clean background',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.042, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.021, basis: '$0.021 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {
      num_inference_steps: 40,
      guidance_scale: 2.5,
    }
  },
  {
    id: 'fal-ai/flux-2-lora-gallery/apartment-staging',
    name: 'Flux 2 Lora Gallery · flux-2-lora-gallery/apartment-staging',
    description: 'Virtually furnishes an empty apartment',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.042, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.021, basis: '$0.021 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {
      num_inference_steps: 40,
      guidance_scale: 2.5,
    }
  },
  {
    id: 'fal-ai/flux-2-lora-gallery/face-to-full-portrait',
    name: 'Flux 2 Lora Gallery · flux-2-lora-gallery/face-to-full-portrait',
    description: 'Extends a face into a full body portrait',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.042, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.021, basis: '$0.021 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {
      num_inference_steps: 40,
      guidance_scale: 2.5,
    }
  },
  {
    id: 'fal-ai/flux-2-lora-gallery/multiple-angles',
    name: 'Flux 2 Lora Gallery · flux-2-lora-gallery/multiple-angles',
    description: 'Generates same object from different angles (azimuth/elevation)',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.042, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.021, basis: '$0.021 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {
      num_inference_steps: 40,
      guidance_scale: 2.5,
    }
  },
  {
    id: 'fal-ai/flux-2-lora-gallery/virtual-tryon',
    name: 'Flux 2 Lora Gallery · flux-2-lora-gallery/virtual-tryon',
    description: 'Virtual clothing try-on (2 images: person + garment)',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.042, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.021, basis: '$0.021 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {
      num_inference_steps: 40,
      guidance_scale: 2.5,
    }
  },
  {
    id: 'fal-ai/flux-2-max/edit',
    name: 'Flux 2 Max',
    description: 'FLUX.2 [max] delivers state-of-the-art image generation and advanced image editing with exceptional realism, precision, and consistency.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'num_images'],
    pricing: { perImageUsd: 0.14, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.07, basis: '$0.07 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux-2-pro/edit',
    name: 'FLUX 2 Pro Edit',
    description: 'Text-to-image generation with FLUX.2 [pro] from Black Forest Labs. Optimized for maximum quality, exceptional photorealism and artistic images.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'num_images'],
    pricing: { perImageUsd: 0.06, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.03, basis: '$0.03 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux-2-pro/outpaint',
    name: 'FLUX 2 Pro Outpaint',
    description: 'Outpainting generation with FLUX.2 [pro] from Black Forest Labs. Optimized for maximum quality, exceptional photorealism and artistic images.',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.06, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.03, basis: '$0.03 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux-2/turbo/edit',
    name: 'FLUX 2 Turbo Edit',
    description: 'Image-to-image editing with FLUX.2 [dev] from Black Forest Labs. Precise modifications using natural language descriptions and hex color control—all at turbo…',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'num_inference_steps', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.016, isEstimate: true, unit: 'processed megapixels', unitPriceUsd: 0.008, basis: '$0.008 / MP × 約 2 MP（輸入＋輸出）' },
    defaultParams: {
      guidance_scale: 2.5,
    }
  },
  {
    id: 'blackforestlabs/flux-3/edit-image',
    name: 'Flux 3 Image',
    description: 'FLUX 3 Image Edit from Black Forest Labs makes precise local edits without changing the rest of the image, and combines up to 10 references into one balanced,…',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images'],
    pricing: { perImageUsd: 0.048, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.048, basis: '$0.048 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'blackforestlabs/flux-3/klein/base/edit-image/lora',
    name: 'FLUX 3 Klein Base Edit LoRA',
    description: 'Edit images with FLUX 3 Image Klein base and up to 3 custom LoRAs.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 50,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'blackforestlabs/flux-3/klein/edit-image/lora',
    name: 'FLUX 3 Klein Edit LoRA',
    description: 'Edit images fast with distilled FLUX 3 Image Klein and up to 3 custom LoRAs.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.012, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.012, basis: '$0.012 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux-kontext-lora',
    name: 'Flux Kontext Lora',
    description: 'Fast endpoint for the FLUX.1 Kontext [dev] model with LoRA support, enabling rapid and high-quality image editing using pre-trained LoRA adaptations for…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 2.5,
    }
  },
  {
    id: 'fal-ai/flux-1/dev/image-to-image',
    name: 'FLUX.1 [dev] · flux-1/dev/image-to-image',
    description: 'FLUX.1 [dev] is a 12 billion parameter flow transformer that generates high-quality images from text. It is suitable for personal and commercial use.',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['negative_prompt', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.95,
      num_inference_steps: 40,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux/dev/image-to-image',
    name: 'FLUX.1 [dev] · flux/dev/image-to-image',
    description: 'FLUX.1 Image-to-Image is a high-performance endpoint for the FLUX.1 [dev] model that enables rapid transformation of existing images, delivering high-quality…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['negative_prompt', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.03, basis: '$0.03 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.95,
      num_inference_steps: 40,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-lora-depth',
    name: 'FLUX.1 [dev] Depth with LoRAs',
    description: 'Generate high-quality images from depth maps using Flux.1 [dev] depth estimation model. The model produces accurate depth representations for scene…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-1/dev/redux',
    name: 'FLUX.1 [dev] Redux · flux-1/dev/redux',
    description: 'FLUX.1 [dev] Redux is a high-performance endpoint for the FLUX.1 [dev] model that enables rapid transformation of existing images, delivering high-quality…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux/dev/redux',
    name: 'FLUX.1 [dev] Redux · flux/dev/redux',
    description: 'FLUX.1 [dev] Redux is a high-performance endpoint for the FLUX.1 [dev] model that enables rapid transformation of existing images, delivering high-quality…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-general/image-to-image',
    name: 'FLUX.1 [dev] with Controlnets and Loras · flux-general/image-to-image',
    description: 'FLUX General Image-to-Image is a versatile endpoint that transforms existing images with support for LoRA, ControlNet, and IP-Adapter extensions, enabling…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.075, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.075, basis: '$0.075 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.85,
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-general/rf-inversion',
    name: 'FLUX.1 [dev] with Controlnets and Loras · flux-general/rf-inversion',
    description: 'A general purpose endpoint for the FLUX.1 [dev] model, implementing the RF-Inversion pipeline. This can be used to edit a reference image based on a prompt.',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'quality', 'safety_tolerance'],
    pricing: { unit: 'compute seconds', basis: '依運算秒數計費' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-lora/image-to-image',
    name: 'FLUX.1 [dev] with LoRAs',
    description: 'FLUX LoRA Image-to-Image is a high-performance endpoint that transforms existing images using FLUX models, leveraging LoRA adaptations to enable rapid and…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.85,
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-1/schnell/redux',
    name: 'FLUX.1 [schnell] Redux · flux-1/schnell/redux',
    description: 'FLUX.1 [schnell] Redux is a high-performance endpoint for the FLUX.1 [schnell] model that enables rapid transformation of existing images, delivering…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.003, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.003, basis: '$0.003 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 4,
    }
  },
  {
    id: 'fal-ai/flux/schnell/redux',
    name: 'FLUX.1 [schnell] Redux · flux/schnell/redux',
    description: 'FLUX.1 [schnell] Redux is a high-performance endpoint for the FLUX.1 [schnell] model that enables rapid transformation of existing images, delivering…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 4,
    }
  },
  {
    id: 'fal-ai/flux-kontext/dev',
    name: 'FLUX.1 Kontext [dev]',
    description: 'Frontier image editing model.',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 2.5,
    }
  },
  {
    id: 'fal-ai/flux-pro/kontext/max',
    name: 'FLUX.1 Kontext [max] · flux-pro/kontext/max',
    description: 'FLUX.1 Kontext [max] is a model with greatly improved prompt adherence and typography generation meet premium consistency for editing without compromise on…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'num_inference_steps', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.08, unit: 'images', unitPriceUsd: 0.08, basis: 'fal 計價單位：每張' },
    defaultParams: {
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-pro/kontext/max/multi',
    name: 'FLUX.1 Kontext [max] · flux-pro/kontext/max/multi',
    description: 'Experimental version of FLUX.1 Kontext [max] with multi image handling capabilities',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'num_inference_steps', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.08, unit: 'images', unitPriceUsd: 0.08, basis: 'fal 計價單位：每張' },
    defaultParams: {
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-pro/kontext',
    name: 'FLUX.1 Kontext [pro] · flux-pro/kontext',
    description: 'FLUX.1 Kontext [pro] handles both text and reference images as inputs, seamlessly enabling targeted, local edits and complex transformations of entire scenes.',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'num_inference_steps', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-pro/kontext/multi',
    name: 'FLUX.1 Kontext [pro] · flux-pro/kontext/multi',
    description: 'Experimental version of FLUX.1 Kontext [pro] with multi image handling capabilities',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'num_inference_steps', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-1/krea/image-to-image',
    name: 'FLUX.1 Krea [dev] · flux-1/krea/image-to-image',
    description: 'FLUX.1 Krea [dev] is a 12 billion parameter flow transformer that generates high-quality images from text with incredible aesthetics. It is suitable for…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['negative_prompt', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.95,
      num_inference_steps: 40,
      guidance_scale: 4.5,
    }
  },
  {
    id: 'fal-ai/flux/krea/image-to-image',
    name: 'FLUX.1 Krea [dev] · flux/krea/image-to-image',
    description: 'FLUX.1 Krea [dev] is a 12 billion parameter flow transformer that generates high-quality images from text with incredible aesthetics. It is suitable for…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['negative_prompt', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.95,
      num_inference_steps: 40,
      guidance_scale: 4.5,
    }
  },
  {
    id: 'fal-ai/flux-1/krea/redux',
    name: 'FLUX.1 Krea [dev] Redux · flux-1/krea/redux',
    description: 'FLUX.1 Krea [dev] Redux is a high-performance endpoint for the FLUX.1 Krea [dev] model that enables rapid transformation of existing images, delivering…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 4.5,
    }
  },
  {
    id: 'fal-ai/flux/krea/redux',
    name: 'FLUX.1 Krea [dev] Redux · flux/krea/redux',
    description: 'FLUX.1 Krea [dev] Redux is a high-performance endpoint for the FLUX.1 Krea [dev] model that enables rapid transformation of existing images, delivering…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'strength', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 4.5,
    }
  },
  {
    id: 'fal-ai/flux-krea-lora/image-to-image',
    name: 'FLUX.1 Krea [dev] with LoRAs',
    description: 'FLUX LoRA Image-to-Image is a high-performance endpoint that transforms existing images using FLUX models, leveraging LoRA adaptations to enable rapid and…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.85,
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-1/srpo/image-to-image',
    name: 'FLUX.1 SRPO [dev] · flux-1/srpo/image-to-image',
    description: 'FLUX.1 SRPO [dev] is a 12 billion parameter flow transformer that generates high-quality images from text with incredible aesthetics. It is suitable for…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['negative_prompt', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.95,
      num_inference_steps: 40,
      guidance_scale: 4.5,
    }
  },
  {
    id: 'fal-ai/flux/srpo/image-to-image',
    name: 'FLUX.1 SRPO [dev] · flux/srpo/image-to-image',
    description: 'FLUX.1 SRPO [dev] is a 12 billion parameter flow transformer that generates high-quality images from text with incredible aesthetics. It is suitable for…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['negative_prompt', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.95,
      num_inference_steps: 40,
      guidance_scale: 4.5,
    }
  },
  {
    id: 'fal-ai/flux-2/klein/4b/edit',
    name: 'FLUX.2 [klein] 4B',
    description: 'Image-to-image editing with FLUX.2 [klein] 4B from Black Forest Labs. Precise modifications using natural language descriptions and hex color control.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.01, basis: '$0.01 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 4,
    }
  },
  {
    id: 'fal-ai/flux-2/klein/4b/base/edit',
    name: 'FLUX.2 [klein] 4B Base',
    description: 'Image-to-image editing with FLUX.2 [klein] 4B Base from Black Forest Labs. Precise modifications using natural language descriptions and hex color control.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.009, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.009, basis: '$0.009 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 5,
    }
  },
  {
    id: 'fal-ai/flux-2/klein/4b/base/edit/lora',
    name: 'FLUX.2 [klein] 4B Base LoRA',
    description: 'Image-to-image editing with LoRA support for FLUX.2 [klein] 4B Base from Black Forest Labs. Specialized style transfer and domain-specific modifications.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.016, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.016, basis: '$0.016 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 5,
    }
  },
  {
    id: 'fal-ai/flux-2/klein/4b/edit/lora',
    name: 'FLUX.2 [klein] 4B LoRA',
    description: 'Image-to-image editing with FLUX.2 [klein] 4B from Black Forest Labs and custom LoRA. Precise modifications using natural language descriptions and hex color…',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.01, basis: '$0.01 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 4,
    }
  },
  {
    id: 'fal-ai/flux-2/klein/9b/edit',
    name: 'FLUX.2 [klein] 9B',
    description: 'Image-to-image editing with FLUX.2 [klein] 9B from Black Forest Labs. Precise modifications using natural language descriptions and hex color control.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.011, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.011, basis: '$0.011 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 4,
    }
  },
  {
    id: 'fal-ai/flux-2/klein/9b/base/edit',
    name: 'FLUX.2 [klein] 9B Base',
    description: 'Image-to-image editing with Flux 2 [klein] 9B Base from Black Forest Labs. Precise modifications using natural language descriptions and hex color control.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.011, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.011, basis: '$0.011 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 5,
    }
  },
  {
    id: 'fal-ai/flux-2/klein/9b/base/edit/lora',
    name: 'FLUX.2 [klein] 9B Base LoRA',
    description: 'Image-to-image editing with LoRA support for FLUX.2 [klein] 9B Base from Black Forest Labs. Specialized style transfer and domain-specific modifications.',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.02, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.02, basis: '$0.02 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 5,
    }
  },
  {
    id: 'fal-ai/flux-2/klein/9b/edit/lora',
    name: 'FLUX.2 [klein] 9B LoRA',
    description: 'Image-to-image editing with FLUX.2 [klein] 9B from Black Forest Labs and custom LoRA. Precise modifications using natural language descriptions and hex color…',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.015, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.015, basis: '$0.015 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 4,
    }
  },
  {
    id: 'blackforestlabs/flux-3/klein/edit-image',
    name: 'FLUX.3 Klein Image Editing',
    description: 'Edits and composes images from text instructions and up to ten references with FLUX.3 Klein, with optional bounding-box controls for object placement and…',
    group: 'Black Forest Labs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.009, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.009, basis: '$0.009 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux-pro/v1.1/redux',
    name: 'FLUX1.1 [pro] Redux',
    description: 'FLUX1.1 [pro] Redux is a high-performance endpoint for the FLUX1.1 [pro] model that enables rapid transformation of existing images, delivering high-quality…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'negative_prompt', 'scheduler', 'quality'],
    pricing: { perImageUsd: 0.05, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.05, basis: '$0.05 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/flux-pro/v1.1-ultra/redux',
    name: 'FLUX1.1 [pro] ultra Redux',
    description: 'FLUX1.1 [pro] ultra Redux is a high-performance endpoint for the FLUX1.1 [pro] model that enables rapid transformation of existing images, delivering…',
    group: 'Black Forest Labs',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.05, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.05, basis: '$0.05 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux-pulid',
    name: 'PuLID Flux',
    description: 'An endpoint for personalized image generation using Flux as per given description.',
    group: 'Black Forest Labs',
    imageInputField: 'reference_image_url',
    unsupportedFields: ['output_format', 'strength', 'scheduler', 'quality', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.0333, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.0333, basis: '$0.0333 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 20,
      guidance_scale: 4,
    }
  },
  {
    id: 'fal-ai/qwen-image/image-to-image',
    name: 'Qwen Image',
    description: 'Qwen-Image (Image-to-Image) transforms and edits input images with high fidelity, enabling precise style transfer, enhancement, and creative modification.',
    group: 'Alibaba',
    imageInputField: 'image_url',
    unsupportedFields: ['scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.02, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.02, basis: '$0.02 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.6,
      num_inference_steps: 30,
      guidance_scale: 2.5,
    }
  },
  {
    id: 'alibaba/qwen-image-3/edit',
    name: 'Qwen Image 3 Image Editing',
    description: 'Edits images from one to three reference images and a natural-language instruction, preserving key details such as facial features and identity while applying…',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/qwen-image-edit/image-to-image',
    name: 'Qwen Image Edit',
    description: 'Image to Image Endpoint for Qwen\'s Image Editing model. Has superior text editing capabilities.',
    group: 'Alibaba',
    imageInputField: 'image_url',
    unsupportedFields: ['scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.03, basis: '$0.03 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.94,
      num_inference_steps: 30,
      guidance_scale: 4,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509',
    name: 'Qwen Image Edit 2509',
    description: 'Endpoint for Qwen\'s Image Editing Plus model also known as Qwen-Image-Edit-2509. Has superior text editing capabilities and multi-image support.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.03, basis: '$0.03 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 50,
      guidance_scale: 4,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509-lora',
    name: 'Qwen Image Edit 2509 Lora',
    description: 'LoRA endpoint for the Qwen Image Edit 2509 model.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 4,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509-lora-gallery/add-background',
    name: 'Qwen Image Edit 2509 Lora Gallery · qwen-image-edit-2509-lora-gallery/add-background',
    description: 'Add a realistic scene behind the object with white background',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509-lora-gallery/face-to-full-portrait',
    name: 'Qwen Image Edit 2509 Lora Gallery · qwen-image-edit-2509-lora-gallery/face-to-full-portrait',
    description: 'Generate full portrait from a cropped face photo',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509-lora-gallery/group-photo',
    name: 'Qwen Image Edit 2509 Lora Gallery · qwen-image-edit-2509-lora-gallery/group-photo',
    description: 'Create group photos',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509-lora-gallery/integrate-product',
    name: 'Qwen Image Edit 2509 Lora Gallery · qwen-image-edit-2509-lora-gallery/integrate-product',
    description: 'Blend products into backgrounds with automatic perspective and lighting correction',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509-lora-gallery/lighting-restoration',
    name: 'Qwen Image Edit 2509 Lora Gallery · qwen-image-edit-2509-lora-gallery/lighting-restoration',
    description: 'Removes harsh shadows and light spots from images, replacing them with soft, even, natural-looking illumination.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['prompt', 'strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509-lora-gallery/multiple-angles',
    name: 'Qwen Image Edit 2509 Lora Gallery · qwen-image-edit-2509-lora-gallery/multiple-angles',
    description: 'Precise camera position and angle control (rotation, zoom, vertical movement)',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['prompt', 'strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509-lora-gallery/next-scene',
    name: 'Qwen Image Edit 2509 Lora Gallery · qwen-image-edit-2509-lora-gallery/next-scene',
    description: 'Create cinematic transitions and scene progressions (camera movements, framing changes)',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509-lora-gallery/remove-element',
    name: 'Qwen Image Edit 2509 Lora Gallery · qwen-image-edit-2509-lora-gallery/remove-element',
    description: 'Remove unwanted elements (objects, people, text) while maintaining image consistency',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509-lora-gallery/remove-lighting',
    name: 'Qwen Image Edit 2509 Lora Gallery · qwen-image-edit-2509-lora-gallery/remove-lighting',
    description: 'Remove existing lighting and apply soft, even illumination',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['prompt', 'strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2509-lora-gallery/shirt-design',
    name: 'Qwen Image Edit 2509 Lora Gallery · qwen-image-edit-2509-lora-gallery/shirt-design',
    description: 'Apply designs/graphics onto people\'s shirts',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2511',
    name: 'Qwen Image Edit 2511 · qwen-image-edit-2511',
    description: 'Endpoint for Qwen\'s Image Editing 2511 model.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.03, basis: '$0.03 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 4.5,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2511/lora',
    name: 'Qwen Image Edit 2511 · qwen-image-edit-2511/lora',
    description: 'Endpoint for Qwen\'s Image Editing 2511 model with LoRa support.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 4.5,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-2511-multiple-angles',
    name: 'Qwen Image Edit 2511 Multiple Angles',
    description: 'Generates same scene from different angles (azimuth/elevation) with Qwen image Edit 2511 and the Lora Multiple Angles',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['prompt', 'strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 4.5,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus',
    name: 'Qwen Image Edit Plus',
    description: 'Endpoint for Qwen\'s Image Editing Plus model also known as Qwen-Image-Edit-2509. Has superior text editing capabilities and multi-image support.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.03, basis: '$0.03 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 50,
      guidance_scale: 4,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus-lora',
    name: 'Qwen Image Edit Plus Lora',
    description: 'LoRA endpoint for the Qwen Image Edit Plus model.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 4,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus-lora-gallery/add-background',
    name: 'Qwen Image Edit Plus Lora Gallery · qwen-image-edit-plus-lora-gallery/add-background',
    description: 'Add a realistic scene behind the object with white background',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus-lora-gallery/face-to-full-portrait',
    name: 'Qwen Image Edit Plus Lora Gallery · qwen-image-edit-plus-lora-gallery/face-to-full-portrait',
    description: 'Generate full portrait from a cropped face photo',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus-lora-gallery/group-photo',
    name: 'Qwen Image Edit Plus Lora Gallery · qwen-image-edit-plus-lora-gallery/group-photo',
    description: 'Create group photos',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus-lora-gallery/integrate-product',
    name: 'Qwen Image Edit Plus Lora Gallery · qwen-image-edit-plus-lora-gallery/integrate-product',
    description: 'Blend products into backgrounds with automatic perspective and lighting correction',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus-lora-gallery/lighting-restoration',
    name: 'Qwen Image Edit Plus Lora Gallery · qwen-image-edit-plus-lora-gallery/lighting-restoration',
    description: 'Removes harsh shadows and light spots from images, replacing them with soft, even, natural-looking illumination.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['prompt', 'strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus-lora-gallery/multiple-angles',
    name: 'Qwen Image Edit Plus Lora Gallery · qwen-image-edit-plus-lora-gallery/multiple-angles',
    description: 'Precise camera position and angle control (rotation, zoom, vertical movement)',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['prompt', 'strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus-lora-gallery/next-scene',
    name: 'Qwen Image Edit Plus Lora Gallery · qwen-image-edit-plus-lora-gallery/next-scene',
    description: 'Create cinematic transitions and scene progressions (camera movements, framing changes)',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus-lora-gallery/remove-element',
    name: 'Qwen Image Edit Plus Lora Gallery · qwen-image-edit-plus-lora-gallery/remove-element',
    description: 'Remove unwanted elements (objects, people, text) while maintaining image consistency',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus-lora-gallery/remove-lighting',
    name: 'Qwen Image Edit Plus Lora Gallery · qwen-image-edit-plus-lora-gallery/remove-lighting',
    description: 'Remove existing lighting and apply soft, even illumination',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['prompt', 'strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-edit-plus-lora-gallery/shirt-design',
    name: 'Qwen Image Edit Plus Lora Gallery · qwen-image-edit-plus-lora-gallery/shirt-design',
    description: 'Apply designs/graphics onto people\'s shirts',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 6,
      guidance_scale: 1,
    }
  },
  {
    id: 'fal-ai/qwen-image-layered',
    name: 'Qwen Image Layered · qwen-image-layered',
    description: 'Qwen-Image-Layered is a model capable of decomposing an image into multiple RGBA layers.',
    group: 'Alibaba',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.05, unit: 'images', unitPriceUsd: 0.05, basis: 'fal 公布每張價格' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 5,
    }
  },
  {
    id: 'fal-ai/qwen-image-layered/lora',
    name: 'Qwen Image Layered · qwen-image-layered/lora',
    description: 'Qwen-Image-Layered is a model capable of decomposing an image into multiple RGBA layers. Use loras to get your custom outputs.',
    group: 'Alibaba',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.06, unit: 'images', unitPriceUsd: 0.06, basis: 'fal 計價單位：每張' },
    defaultParams: {
      num_inference_steps: 28,
      guidance_scale: 5,
    }
  },
  {
    id: 'fal-ai/wan/v2.7/edit',
    name: 'Wan · wan/v2.7/edit',
    description: 'Transform and edit existing images with text-guided instructions using the WAN 2.7 model for creative image manipulation.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, unit: 'images', unitPriceUsd: 0.03, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/wan/v2.7/pro/edit',
    name: 'Wan · wan/v2.7/pro/edit',
    description: 'Edit and transform images using text instructions with the WAN 2.7 Pro model for precise, professional-grade image modifications.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.075, unit: 'images', unitPriceUsd: 0.075, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/wan-25-preview/image-to-image',
    name: 'Wan 2.5 Image to Image',
    description: 'Wan 2.5 image-to-image model.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.05, unit: 'images', unitPriceUsd: 0.05, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'wan/v2.6/image-to-image',
    name: 'Wan v2.6 Image to Image',
    description: 'Wan 2.6 image-to-image model.',
    group: 'Alibaba',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, unit: 'images', unitPriceUsd: 0.03, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/z-image/turbo/controlnet',
    name: 'Z Image Turbo Controlnet',
    description: 'Generate images from text and edge, depth or pose images using Z-Image Turbo, Tongyi-MAI\'s super-fast 6B model.',
    group: 'Alibaba',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.0065, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.0065, basis: '$0.0065 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 8,
    }
  },
  {
    id: 'fal-ai/z-image/turbo/controlnet/lora',
    name: 'Z Image Turbo Controlnet Lora',
    description: 'Generate images from text and edge, depth or pose images using custom LoRA and Z-Image Turbo, Tongyi-MAI\'s super-fast 6B model.',
    group: 'Alibaba',
    imageInputField: 'image_url',
    unsupportedFields: ['strength', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.01, basis: '$0.01 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 8,
    }
  },
  {
    id: 'fal-ai/z-image/turbo/image-to-image',
    name: 'Z Image Turbo Image To Image',
    description: 'Generate images from text and images using Z-Image Turbo, Tongyi-MAI\'s super-fast 6B model.',
    group: 'Alibaba',
    imageInputField: 'image_url',
    unsupportedFields: ['guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.005, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.005, basis: '$0.005 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.6,
      num_inference_steps: 8,
    }
  },
  {
    id: 'fal-ai/z-image/turbo/image-to-image/lora',
    name: 'Z Image Turbo Image To Image Lora',
    description: 'Generate images from text and images using custom LoRA and Z-Image Turbo, Tongyi-MAI\'s super-fast 6B model.',
    group: 'Alibaba',
    imageInputField: 'image_url',
    unsupportedFields: ['guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.0085, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.0085, basis: '$0.0085 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.6,
      num_inference_steps: 8,
    }
  },
  {
    id: 'fal-ai/bria/background/replace',
    name: 'Bria Background Replace',
    description: 'Bria Background Replace allows for efficient swapping of backgrounds in images via text prompts or reference image, delivering realistic and polished results.…',
    group: 'Bria AI',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'generations', unitPriceUsd: 0.04, basis: 'fal 計價單位：每次' },
    defaultParams: {}
  },
  {
    id: 'bria/fibo-edit-1.5/expand',
    name: 'Bria Expand (FIBO-Edit-1.5)',
    description: 'Bria Expand extends an image beyond its borders to any of 9 aspect ratios or a custom canvas up to 25 megapixels. Built on FIBO-Edit-1.5, with optional prompt…',
    group: 'Bria AI',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'bria/guided-remove-background',
    name: 'Bria Guided Remove Background',
    description: 'Background removal you steer with a prompt. Starts from the same clean cut as Bria RMBG, then adds, drops or isolates objects from plain words like "the…',
    group: 'Bria AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, unit: 'images', unitPriceUsd: 0.03, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'bria/increase-resolution',
    name: 'Bria Increase Resolution: Upscale Images up to 4x Without Losing Detail | fal',
    description: 'Upscale any image 2x or 4x, up to 8192×8192, with Bria Increase Resolution. Preserves the original content — no regeneration, no altered details.…',
    group: 'Bria AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/bria/product-shot',
    name: 'Bria Product Shot',
    description: 'Place any product in any scenery with just a prompt or reference image while maintaining high integrity of the product. Trained exclusively on licensed data…',
    group: 'Bria AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'generations', unitPriceUsd: 0.04, basis: 'fal 計價單位：每次' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/bria/background/remove',
    name: 'Bria RMBG 2.0',
    description: 'Bria RMBG 2.0 enables seamless removal of backgrounds from images, ideal for professional editing tasks. Trained exclusively on licensed data for safe and…',
    group: 'Bria AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.018, isEstimate: true, unit: 'generations', unitPriceUsd: 0.018, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'bria/extract-object',
    name: 'Extract Object',
    description: 'Bria Extract Object uses text prompts to isolate a selected object from an image and return it as an RGBA PNG with a transparent background. Ideal for…',
    group: 'Bria AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.02, unit: 'images', unitPriceUsd: 0.02, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'bria/fibo-2/edit',
    name: 'Fibo 2.0 Edit',
    description: 'Fibo 2.0 Edit makes targeted, instruction-based edits from up to four images. Background swaps, product restaging, keeping the product true to the original.…',
    group: 'Bria AI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, isEstimate: true, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'bria/fibo-edit/edit',
    name: 'Fibo Edit',
    description: 'High-fidelity image editing model with state-of-the-art controllability. Combines JSON + Mask + Image for precise, fine-grained edits ideal for production and…',
    group: 'Bria AI',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      guidance_scale: 5,
    }
  },
  {
    id: 'bria/fibo-edit/restore',
    name: 'Fibo Edit [Restore]',
    description: 'Photo restoration model that automatically denoises, deblurs, and enhances old or damaged photos - removes imperfections while preserving original character.',
    group: 'Bria AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'bria/fibo-edit/sketch_to_colored_image',
    name: 'Fibo Edit [Sketch to Image]',
    description: 'Convert line drawings and sketches into photorealistic, fully colored images with preserved structure. Trained exclusively on licensed data for safe…',
    group: 'Bria AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'bria/fibo-edit-1.5/edit',
    name: 'Fibo Edit 1.5 Image Editing',
    description: 'Commercially safe, multi-reference image editing model. Follows natural language instructions alone or with up to 4 reference images, purpose-built for…',
    group: 'Bria AI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'bria/replace-background',
    name: 'Replace Background',
    description: 'Generate professional, eCommerce-ready product shots by replacing backgrounds with realistic lighting and accurate perspective from a simple text prompt.…',
    group: 'Bria AI',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'bria/upscale/creative',
    name: 'Upscale',
    description: 'Professional-grade creative upscaler that doubles resolution up to 10MP, regenerating sharper textures, refined details, and cleaner faces. Trained…',
    group: 'Bria AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/ideogram/v3/layerize-text',
    name: 'Ideogram',
    description: 'Ideogram Layerize takes an existing flat graphic, removes text, and returns structured text containers you can edit/recompose in html or json format.',
    group: 'Ideogram',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.09, unit: 'images', unitPriceUsd: 0.09, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/ideogram/remove-background',
    name: 'Ideogram Remove Background',
    description: 'Remove backgrounds from existing images with Ideogram\'s remove background feature. Isolate subjects cleanly for compositing and creative reuse.',
    group: 'Ideogram',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01, unit: 'images', unitPriceUsd: 0.01, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/ideogram/upscale',
    name: 'Ideogram Upscale',
    description: 'Ideogram Upscale enhances the resolution of the reference image by up to 2X and might enhance the reference image too. Optionally refine outputs with a prompt…',
    group: 'Ideogram',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.06, unit: 'images', unitPriceUsd: 0.06, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/ideogram/v2/remix',
    name: 'Ideogram V2 Remix',
    description: 'Reimagine existing images with Ideogram V2\'s remix feature. Create variations and adaptations while preserving core elements and adding new creative…',
    group: 'Ideogram',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.08, unit: 'images', unitPriceUsd: 0.08, basis: 'fal 計價單位：每張' },
    defaultParams: {
      strength: 0.8,
    }
  },
  {
    id: 'fal-ai/ideogram/v2/turbo/remix',
    name: 'Ideogram V2 Turbo Remix',
    description: 'Rapidly create image variations with Ideogram V2 Turbo Remix. Fast and efficient reimagining of existing images while maintaining creative control through…',
    group: 'Ideogram',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.05, unit: 'images', unitPriceUsd: 0.05, basis: 'fal 計價單位：每張' },
    defaultParams: {
      strength: 0.8,
    }
  },
  {
    id: 'fal-ai/ideogram/v2a/remix',
    name: 'Ideogram V2A Remix',
    description: 'Create variations of existing images with Ideogram V2A Remix while maintaining creative control through prompt guidance.',
    group: 'Ideogram',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      strength: 0.8,
    }
  },
  {
    id: 'fal-ai/ideogram/v2a/turbo/remix',
    name: 'Ideogram V2A Turbo Remix',
    description: 'Rapidly create image variations with Ideogram V2A Turbo Remix. Fast and efficient reimagining of existing images while maintaining creative control through…',
    group: 'Ideogram',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, unit: 'images', unitPriceUsd: 0.025, basis: 'fal 計價單位：每張' },
    defaultParams: {
      strength: 0.8,
    }
  },
  {
    id: 'ideogram/v4/image-to-image',
    name: 'Ideogram V4.0q Image to Image',
    description: 'Ideogram V4.0q Image-to-Image transforms an input image with a text prompt, restyling and reworking the composition while preserving its core structure for…',
    group: 'Ideogram',
    imageInputField: 'image_url',
    unsupportedFields: ['num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.0075, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: '$0.0075 / 1 MP' },
    defaultParams: {
      strength: 0.8,
    }
  },
  {
    id: 'ideogram/v4/image-to-image/lora',
    name: 'Ideogram V4.0q Image to Image LoRA',
    description: 'Ideogram V4.0q Image-to-Image LoRA applies a custom-trained LoRA on top of an input image, steering edits toward a specific style, subject, or brand identity…',
    group: 'Ideogram',
    imageInputField: 'image_url',
    unsupportedFields: ['num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01125, isEstimate: true, unit: 'units', unitPriceUsd: 0.015, basis: '$0.01125 / 1 MP' },
    defaultParams: {
      strength: 0.8,
    }
  },
  {
    id: 'ideogram/v4/tiling',
    name: 'Ideogram V4.0q Tiling',
    description: 'Ideogram V4.0q Tiling generates seamless, edge-matching textures and patterns that repeat infinitely in any direction, ideal for backgrounds, surfaces, and…',
    group: 'Ideogram',
    imageInputField: 'image_url',
    unsupportedFields: ['num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {
      strength: 0.8,
    }
  },
  {
    id: 'ideogram/v4/tiling/lora',
    name: 'Ideogram V4.0q Tiling LoRA',
    description: 'Ideogram V4.0q Tiling LoRA produces seamless repeatable patterns guided by a custom-trained LoRA, locking a specific aesthetic or motif into tileable textures…',
    group: 'Ideogram',
    imageInputField: 'image_url',
    unsupportedFields: ['num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.045, unit: 'images', unitPriceUsd: 0.045, basis: 'fal 計價單位：每張' },
    defaultParams: {
      strength: 0.8,
    }
  },
  {
    id: 'ideogram/v4.5/edit',
    name: 'Ideogram V4.5 Edit',
    description: 'Edit images with Ideogram 4.5: prompt edits with up to 4 reference images, optional mask, and a high-precision mode that keeps unchanged pixels intact.',
    group: 'Ideogram',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'safety_tolerance'],
    pricing: { perImageUsd: 0.008, isEstimate: true, unit: 'units', unitPriceUsd: 0.001, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'ideogram/vector/image-to-vector',
    name: 'Ideogram Vector',
    description: 'Converts images into editable SVG vector graphics, with a default mode for finer details and a simple mode for fewer shapes.',
    group: 'Ideogram',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.1, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/bytedance/seedream/v4/edit',
    name: 'Bytedance Seedream V4 Edit',
    description: 'A new-generation image creation model ByteDance, Seedream 4.0 integrates image generation and image editing capabilities into a single, unified architecture.',
    group: 'Bytedance',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, unit: 'images', unitPriceUsd: 0.03, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/bytedance/seedream/v4.5/edit',
    name: 'Bytedance Seedream V4.5 Edit',
    description: 'A new-generation image creation model ByteDance, Seedream 4.5 integrates image generation and image editing capabilities into a single, unified architecture.',
    group: 'Bytedance',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'bytedance/seedream/v5/flash/edit',
    name: 'Seedream · seedream/v5/flash/edit',
    description: 'Seedream 5.0 Flash is a fast image generation and editing model, built for workflows where speed and budget matter.',
    group: 'Bytedance',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.027, unit: 'images', unitPriceUsd: 0.027, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'bytedance/seedream/v5/flash/layerize',
    name: 'Seedream · seedream/v5/flash/layerize',
    description: 'Seedream 5.0 Flash is a fast image generation and editing model, built for workflows where speed and budget matter.',
    group: 'Bytedance',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.027, unit: 'images', unitPriceUsd: 0.027, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'bytedance/seedream/v5/lite/edit',
    name: 'Seedream · seedream/v5/lite/edit',
    description: 'Image editing endpoint for the fast Lite version of Seedream 5.0, supporting high quality intelligent image editing with multiple inputs.',
    group: 'Bytedance',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, unit: 'images', unitPriceUsd: 0.035, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'bytedance/seedream/v5/pro/edit',
    name: 'Seedream 5.0 Pro Image Editing',
    description: 'Seedream 5.0 Pro is grounded, region-precise image editing model that changes one element while keeping the rest of the frame intact with layer separation,…',
    group: 'Bytedance',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.0675, unit: 'units', unitPriceUsd: 0.0675, basis: 'fal 計價單位：每單位' },
    defaultParams: {}
  },
  {
    id: 'bytedance/seedream/v5/pro/layerize',
    name: 'Seedream 5.0 Pro Layerize',
    description: 'Splits a finished image into independent, editable transparent-PNG layers — background plus separate elements, from a text description, returning 2 to 17…',
    group: 'Bytedance',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03375, unit: 'images', unitPriceUsd: 0.03375, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'bytedance/seedream/v5.5/edit',
    name: 'Seedream 5.5 Edit',
    description: 'Seedream 5.5 edits images from text instructions and up to 10 reference images, with configurable output dimensions and support for transparent PNG backgrounds.',
    group: 'Bytedance',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, isEstimate: true, unit: 'units', unitPriceUsd: 0.03, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'bytedance/seedream/v5.5/layerize',
    name: 'Seedream 5.5 Layerize',
    description: 'Seedream 5.5 decomposes an image into a base image and independently editable PNG layers, with layer positions, stacking order, and optional text recognition.',
    group: 'Bytedance',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, isEstimate: true, unit: 'units', unitPriceUsd: 0.03, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/gemini-25-flash-image/edit',
    name: 'Gemini 2.5 Flash Image',
    description: 'Google\'s famous original image generation and editing model, a.k.a Nano Banana',
    group: 'Google',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.0398, isEstimate: true, unit: 'images', unitPriceUsd: 0.0398, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/gemini-3-pro-image-preview/edit',
    name: 'Gemini 3 Pro Image Preview',
    description: 'Gemini 3 Pro Image (a.k.a Nano Banana Pro) is Google\'s state-of-the-art high-fidelity image generation and editing model',
    group: 'Google',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.15, isEstimate: true, unit: 'images', unitPriceUsd: 0.15, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/gemini-3.1-flash-image-preview/edit',
    name: 'Gemini 3.1 Flash Image Preview',
    description: 'Gemini 3.1 Flash Image (a.k.a. Nano Banana 2) is Google\'s new state-of-the-art fast image generation and editing model',
    group: 'Google',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.08, isEstimate: true, unit: 'images', unitPriceUsd: 0.08, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/nano-banana/edit',
    name: 'Nano Banana',
    description: 'Google\'s famous original image generation and editing model',
    group: 'Google',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.0398, isEstimate: true, unit: 'images', unitPriceUsd: 0.0398, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/nano-banana-2/edit',
    name: 'Nano Banana 2',
    description: 'Nano Banana 2 is Google\'s new state-of-the-art image generation and editing model',
    group: 'Google',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.08, isEstimate: true, unit: 'images', unitPriceUsd: 0.08, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'google/nano-banana-2.1/edit',
    name: 'Nano Banana 2.1 Edit',
    description: 'Nano Banana 2.1 Edit by Google transforms reference images using text instructions, with output resolutions up to 4K and optional video or PDF context.',
    group: 'Google',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.04, isEstimate: true, unit: 'units', unitPriceUsd: 1, basis: 'token 計價（high 品質、1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'google/nano-banana-lite/edit',
    name: 'Nano Banana Lite Edit',
    description: 'Nano banana lite is the efficiency-focused model in the image generation family. Sub-2 second latency with cost-effective generation and editing, fast…',
    group: 'Google',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { unit: 'units', unitPriceUsd: 1, basis: '依 token 用量計價，無法換算單張金額' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/nano-banana-pro/edit',
    name: 'Nano Banana Pro',
    description: 'Nano Banana Pro is Google\'s new state-of-the-art image generation and editing model',
    group: 'Google',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size'],
    pricing: { perImageUsd: 0.15, isEstimate: true, unit: 'images', unitPriceUsd: 0.15, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'topaz/adjust/image',
    name: 'Topaz Adjust Image',
    description: 'Professional color and lighting correction powered by Topaz Labs. Adjust V2 fixes exposure, White Balance corrects color casts, Colorize adds color to…',
    group: 'Topaz Labs',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.08, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: '$0.08 起（每 24 MP）' },
    defaultParams: {}
  },
  {
    id: 'topaz/denoise/image',
    name: 'Topaz Denoise Image',
    description: 'Professional photo denoising powered by Topaz Labs. Normal, Strong and Extreme presets clean noise at source resolution; Denoise Max adds generative detail…',
    group: 'Topaz Labs',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.08, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: '$0.08 起（每 24 MP）' },
    defaultParams: {}
  },
  {
    id: 'topaz/restore/image',
    name: 'Topaz Restore Image',
    description: 'Professional image restoration powered by Topaz Labs. Recover 3 generatively rebuilds natural detail; Dust-Scratch V2 cleans film dust and scratches. Best for…',
    group: 'Topaz Labs',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.08, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: '$0.08 起（每 4 MP）' },
    defaultParams: {}
  },
  {
    id: 'topaz/sharpen/image',
    name: 'Topaz Sharpen Image',
    description: 'Professional photo sharpening powered by Topaz Labs. Models tuned per blur type (lens, motion, portrait, wildlife), plus Super Focus for generative recovery…',
    group: 'Topaz Labs',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.08, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: '$0.08 起（每 24 MP）' },
    defaultParams: {}
  },
  {
    id: 'topaz/upscale/image/creative',
    name: 'Topaz Upscale Image Creative',
    description: 'Professional creative image upscaling powered by Topaz Labs. Bloom 2 reinvents detail with adjustable creativity and color preservation. Best for AI-generated…',
    group: 'Topaz Labs',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.08, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: '$0.08 起（每 2 MP）' },
    defaultParams: {}
  },
  {
    id: 'topaz/upscale/image/generative',
    name: 'Topaz Upscale Image Generative',
    description: 'Professional generative image upscaling powered by Topaz Labs. Wonder 3.5 leads the range, with Redefine for prompt-guided detail and Recovery for extreme…',
    group: 'Topaz Labs',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.08, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: '$0.08 起（每 8 MP）' },
    defaultParams: {}
  },
  {
    id: 'topaz/upscale/image/precision',
    name: 'Topaz Upscale Image Precision',
    description: 'Professional photo upscaling powered by Topaz Labs. Gigapixel precision models (Standard V2, High Fidelity, Low Resolution, CGI, Text Refine) enlarge images…',
    group: 'Topaz Labs',
    imageInputField: 'image_url',
    unsupportedFields: ['prompt', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.08, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: '$0.08 起（每 24 MP）' },
    defaultParams: {}
  },
  {
    id: 'topaz/upscale/image/transparent',
    name: 'Topaz Upscale Image Transparent',
    description: 'Professional transparent-image upscaling powered by Topaz Labs. Preserves the alpha channel end to end with PNG output. Best for logos, stickers and assets…',
    group: 'Topaz Labs',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.08, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: '$0.08 起（每 24 MP）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/gpt-image-1-mini/edit',
    name: 'GPT Image 1 Mini',
    description: 'GPT Image 1 mini combines OpenAI\'s advanced language capabilities, powered by GPT-5, with GPT Image 1 Mini for efficient image generation.',
    group: 'OpenAI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'safety_tolerance'],
    pricing: { perImageUsd: 0.005, isEstimate: true, unit: 'credits', unitPriceUsd: 1, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'openai/gpt-image-2/edit',
    name: 'GPT Image 2 API',
    description: 'GPT Image 2, OpenAI\'s latest image model, is capable of making fine-grained, detailed edits to images.',
    group: 'OpenAI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'safety_tolerance'],
    pricing: { perImageUsd: 0.061, isEstimate: true, unit: 'units', unitPriceUsd: 1, basis: 'token 計價（high 品質、1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'openai/gpt-image-2.5/flare/edit',
    name: 'GPT Image 2.5 Flare Edit',
    description: 'Precise image editing that changes only what\'s asked, keeping subject, composition, and background intact, with reference subjects staying recognizable across…',
    group: 'OpenAI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'safety_tolerance'],
    pricing: { perImageUsd: 0.05268, isEstimate: true, unit: 'units', unitPriceUsd: 1, basis: 'token 計價（high 品質、1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'openai/gpt-image-2.5/sunburst/edit',
    name: 'GPT Image 2.5 Sunburst Edit',
    description: 'Editing built for the tightest control, edits scoped precisely to the instruction, with subject and composition preserved across many rounds of revision.',
    group: 'OpenAI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'safety_tolerance'],
    pricing: { perImageUsd: 0.05268, isEstimate: true, unit: 'units', unitPriceUsd: 1, basis: 'token 計價（high 品質、1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'openai/gpt-image-2.6/flare/edit',
    name: 'GPT Image 2.6 Flare Edit',
    description: 'Precise image editing that changes only what\'s asked, keeping subject, composition, and background intact, with reference subjects staying recognizable across…',
    group: 'OpenAI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'safety_tolerance'],
    pricing: { perImageUsd: 0.05268, isEstimate: true, unit: 'units', unitPriceUsd: 1, basis: 'token 計價（high 品質、1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'openai/gpt-image-2.6/sunburst/edit',
    name: 'GPT Image 2.6 Sunburst Edit',
    description: 'Editing built for the tightest control, edits scoped precisely to the instruction, with subject and composition preserved across many rounds of revision.',
    group: 'OpenAI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'safety_tolerance'],
    pricing: { perImageUsd: 0.05268, isEstimate: true, unit: 'units', unitPriceUsd: 1, basis: 'token 計價（high 品質、1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/gpt-image-1.5/edit',
    name: 'GPT-Image 1.5',
    description: 'GPT Image 1.5 generates high-fidelity images with strong prompt adherence, preserving composition, lighting, and fine-grained detail.',
    group: 'OpenAI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'safety_tolerance'],
    pricing: { perImageUsd: 0.009, isEstimate: true, unit: 'units', unitPriceUsd: 1, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/recraft/vectorize',
    name: 'Recraft',
    description: 'Converts a given raster image to SVG format using Recraft model.',
    group: 'Recraft',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01, unit: 'images', unitPriceUsd: 0.01, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/recraft/upscale/creative',
    name: 'Recraft Creative Upscale',
    description: 'Enhances a given raster image using the \'creative upscale\' tool, increasing image resolution, making the image sharper and cleaner.',
    group: 'Recraft',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.25, unit: 'images', unitPriceUsd: 0.25, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/recraft/upscale/crisp',
    name: 'Recraft Crisp Upscale',
    description: 'Enhances a given raster image using \'crisp upscale\' tool, boosting resolution with a focus on refining small details and faces.',
    group: 'Recraft',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.004, unit: 'images', unitPriceUsd: 0.004, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/recraft/v3/image-to-image',
    name: 'Recraft V3',
    description: 'Recraft V3 is a text-to-image model with the ability to generate long texts, vector art, images in brand style, and much more. As of today, it is SOTA in…',
    group: 'Recraft',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'num_inference_steps', 'guidance_scale', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.04, isEstimate: true, unit: 'images', unitPriceUsd: 0.04, basis: 'fal 公布每張價格' },
    defaultParams: {
      strength: 0.5,
    }
  },
  {
    id: 'fal-ai/kling-image/o3/image-to-image',
    name: 'Kling Image · kling-image/o3/image-to-image',
    description: 'Kling Omni 3: Top-tier image-to-image with flawless consistency.',
    group: 'Kling',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.028, unit: 'images', unitPriceUsd: 0.028, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/kling-image/v3/image-to-image',
    name: 'Kling Image · kling-image/v3/image-to-image',
    description: 'Kling Image V3: Latest kling image model',
    group: 'Kling',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.028, unit: 'images', unitPriceUsd: 0.028, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/kling-image/o1',
    name: 'Kling O1 Image',
    description: 'Perform precise image edits using strong reference control, transforming subjects, styles, and local details while preserving visual consistency.',
    group: 'Kling',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.028, unit: 'images', unitPriceUsd: 0.028, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'minimax/h3-image/edit',
    name: 'MiniMax H3 Image Edit',
    description: 'MiniMax H3 Image Edit transforms and combines up to 16 reference images using text instructions, supporting targeted edits, style changes, and multi-image…',
    group: 'Minimax',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { unit: 'units', unitPriceUsd: 0.001, basis: '依 token 用量計價，無法換算單張金額' },
    defaultParams: {}
  },
  {
    id: 'minimax/h3-image/highspeed/edit',
    name: 'MiniMax H3 Image Highspeed Edit',
    description: 'MiniMax H3 Image Highspeed Edit transforms and combines up to 16 reference images using text instructions. It supports multi-image composition and custom…',
    group: 'Minimax',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { unit: 'units', unitPriceUsd: 0.001, basis: '依 token 用量計價，無法換算單張金額' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/minimax/image-01/subject-reference',
    name: 'Minimax Image Subject Reference',
    description: 'Generate images from text and a reference image using MiniMax Image-01 for consistent character appearance.',
    group: 'Minimax',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01, unit: 'images', unitPriceUsd: 0.01, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'xai/grok-imagine-image/edit',
    name: 'Grok Imagine Image',
    description: 'Edit images precisely with xAI\'s Grok Imagine model',
    group: 'xAI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.022, isEstimate: true, unit: 'images', unitPriceUsd: 0.02, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'xai/grok-imagine-image/v2.0/edit',
    name: 'Grok Imagine Image 2.0',
    description: 'Edit images with xAi\'s Grok Imagine 2.0 model.',
    group: 'xAI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.06, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'xai/grok-imagine-image/quality/edit',
    name: 'Grok Imagine Image Editing Quality',
    description: 'Grok Imagine Pro is an advanced AI model from xAI that creates high-quality visuals from text prompts and allows you to edit or analyze existing images.',
    group: 'xAI',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.05, isEstimate: true, unit: 'units', unitPriceUsd: 0.01, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/clarity-upscaler',
    name: 'Clarity Upscaler',
    description: 'Clarity upscaler for upscaling images with high very fidelity.',
    group: 'Clarity AI',
    imageInputField: 'image_url',
    unsupportedFields: ['output_format', 'strength', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.03, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.03, basis: '$0.03 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      num_inference_steps: 18,
      guidance_scale: 4,
    }
  },
  {
    id: 'clarityai/crystal-upscaler',
    name: 'Crystal Upscaler',
    description: 'An advanced image enhancement tool designed specifically for facial details and portrait photography, utilizing Clarity AI\'s upscaling technology.',
    group: 'Clarity AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.016, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.016, basis: '$0.016 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/patina',
    name: 'PATINA · patina',
    description: 'PATINA creates seamless high-resolution normal, roughness, basecolor (albedo), height (displacement) and metalness maps from images',
    group: 'Fal',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.01, basis: '$0.01 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/patina/material/extract',
    name: 'PATINA · patina/material/extract',
    description: 'Extract seamless tiling textures with PBR attribute maps from images',
    group: 'Fal',
    imageInputField: 'image_url',
    unsupportedFields: ['guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.01, basis: '$0.01 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.6,
      num_inference_steps: 8,
    }
  },
  {
    id: 'krea/v3/edit',
    name: 'Krea 3 Edit',
    description: 'Edits and combines reference images using text instructions, with optional prompt expansion, output-size controls, and reproducible generation through a seed.',
    group: 'Krea',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'scheduler', 'quality', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.025, basis: '$0.025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'krea/v3/realtime',
    name: 'Krea 3 Realtime',
    description: 'Edits an input image in a realtime session using text prompts, with seed control.',
    group: 'Krea',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { unit: 'seconds', unitPriceUsd: 0.013, basis: '依使用秒數計費' },
    defaultParams: {}
  },
  {
    id: 'luma/agent/uni-1/v1/edit',
    name: 'Luma Uni-1 Edit',
    description: 'Luma Uni-1 Edit reworks a source image from a text instruction, preserving the original composition while applying style changes and following optional…',
    group: 'Luma AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.003, unit: 'images', unitPriceUsd: 0.003, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'luma/agent/uni-1/v1/max/edit',
    name: 'Luma Uni-1 Edit Max',
    description: 'Luma Uni-1 Max Edit applies text-guided edits to a source image at maximum fidelity, holding the original structure while honoring reference images for…',
    group: 'Luma AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.003, unit: 'images', unitPriceUsd: 0.003, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'microsoft/mai-image-2.5/edit',
    name: 'Mai Image 2.5',
    description: 'MAI-Image-2.5 is Microsoft\'s photorealistic image generation and editing model that turns text prompts or uploaded images into high-quality, design-ready…',
    group: 'Microsoft',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { unit: 'credits', unitPriceUsd: 1, basis: '依 token 用量計價，無法換算單張金額' },
    defaultParams: {}
  },
  {
    id: 'microsoft/mai-image-2.5-pro/edit',
    name: 'MAI Image 2.5 Pro (Edit)',
    description: 'Apply precise, controllable edits to a reference image while preserving composition, typography, identity, and fine visual detail.',
    group: 'Microsoft',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.27, isEstimate: true, unit: 'credits', unitPriceUsd: 1.5, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/phota/edit',
    name: 'Phota',
    description: 'Phota\'s model enables personalized photo editing, preserving identity while erasing distractions seamlessly.',
    group: 'Photalabs',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.09, isEstimate: true, unit: 'units', unitPriceUsd: 0.09, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/phota/enhance',
    name: 'Phota Enhance',
    description: 'Enhance images while preserving identities with Phota',
    group: 'Photalabs',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.13, unit: 'images', unitPriceUsd: 0.13, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'pixelcut/background-removal',
    name: 'Pixelcut Background Remover',
    description: 'Pixelcut’s Background Remover enables fast, ultra high-quality removal of backgrounds from images. Perfect for e-commerce and image editing workflows. Powered…',
    group: 'Pixelcut',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.016, unit: 'images', unitPriceUsd: 0.016, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'pixelcut/product-photo',
    name: 'Pixelcut Product Photo',
    description: 'Pixelcut\'s Background Remover produces fast, high-quality cutouts built for e-commerce product imagery',
    group: 'Pixelcut',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.024, unit: 'images', unitPriceUsd: 0.024, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'rundiffusion-fal/juggernaut-flux/base/image-to-image',
    name: 'Juggernaut Flux Base',
    description: 'Juggernaut Base Flux by RunDiffusion is a drop-in replacement for Flux [Dev] that delivers sharper details, richer colors, and enhanced realism, while…',
    group: 'Rundiffusion',
    imageInputField: 'image_url',
    unsupportedFields: ['negative_prompt', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.035, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.035, basis: '$0.035 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.95,
      num_inference_steps: 40,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'rundiffusion-fal/juggernaut-flux/pro/image-to-image',
    name: 'Juggernaut Flux Pro',
    description: 'Juggernaut Pro Flux by RunDiffusion is the flagship Juggernaut model rivaling some of the most advanced image models available, often surpassing them in…',
    group: 'Rundiffusion',
    imageInputField: 'image_url',
    unsupportedFields: ['negative_prompt', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.055, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.055, basis: '$0.055 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.95,
      num_inference_steps: 40,
      guidance_scale: 3.5,
    }
  },
  {
    id: 'fal-ai/sam-3/image-rle',
    name: 'Sam 3',
    description: 'SAM 3 is a unified foundation model for promptable segmentation in images and videos. It can detect, segment, and track objects using text or visual prompts…',
    group: 'Sam',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.005, unit: 'units', unitPriceUsd: 0.005, basis: 'fal 計價單位：每單位' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/sam-3/image',
    name: 'Segment Anything Model 3',
    description: 'SAM 3 is a unified foundation model for promptable segmentation in images and videos. It can detect, segment, and track objects using text or visual prompts…',
    group: 'Sam',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.005, unit: 'units', unitPriceUsd: 0.005, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/seedvr/upscale/image',
    name: 'SeedVR2 · seedvr/upscale/image',
    description: 'Use SeedVR2 to upscale your images',
    group: 'SeedVR',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.001, basis: '$0.001 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/seedvr/upscale/image/seamless',
    name: 'SeedVR2 · seedvr/upscale/image/seamless',
    description: 'Use SeedVR2 to upscale images, retaining seamless tiling',
    group: 'SeedVR',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.0025, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.0025, basis: '$0.0025 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/feynobg',
    name: 'Feynobg Background Remover',
    description: 'FeyNobg is a state of the art AI model for background removal from feyninc',
    group: 'feyninc',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.001, unit: 'generations', unitPriceUsd: 0.001, basis: 'fal 計價單位：每次' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/finegrain-eraser',
    name: 'Finegrain Eraser',
    description: 'Finegrain Eraser removes objects—along with their shadows, reflections, and lighting artifacts—using only natural language, seamlessly filling the scene with…',
    group: 'Finegrain',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.18, isEstimate: true, unit: 'images', unitPriceUsd: 0.045, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/hidream-i1-full/image-to-image',
    name: 'Hidream I1 Full',
    description: 'HiDream-I1 full is a new open-source image generative foundation model with 17B parameters that achieves state-of-the-art image generation quality within…',
    group: 'Hidream',
    imageInputField: 'image_url',
    unsupportedFields: ['scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.05, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.05, basis: '$0.05 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      strength: 0.75,
      num_inference_steps: 50,
      guidance_scale: 5,
    }
  },
  {
    id: 'hitem3d/hi3d/image-to-relief',
    name: 'Hi3D Image to Relief',
    description: 'Generate a 3D relief depth map with Hi3D from a single image.',
    group: 'Hitem3D',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.2, unit: 'credits', unitPriceUsd: 0.02, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'meta/muse-image/edit',
    name: 'Meta Muse Image Edit',
    description: 'Meta\'s Muse Image model does precise edits that change only what you ask, stay coherent across turns, and compose from multiple reference images.',
    group: 'Meta',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01, unit: 'images', unitPriceUsd: 0.01, basis: 'fal 計價單位：每張' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/sam-3-1/image',
    name: 'Sam 3 1',
    description: 'SAM 3.1 builds comes with Object Multiplex, a shared-memory approach for joint multi-object tracking that delivers faster speeds with larger number of objects…',
    group: 'SAM',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.01, unit: 'units', unitPriceUsd: 0.01, basis: 'fal 公布每張價格' },
    defaultParams: {}
  },
  {
    id: 'smoretalk-ai/rembg-enhance',
    name: 'Rembg Enhance (Remove Background Enhance)',
    description: 'Rembg-enhance is optimized for 2D vector images, 3D graphics, and photos by leveraging matting technology.',
    group: 'Smoretalk AI',
    imageInputField: 'image_url',
    includeDiffusionParams: false,
    unsupportedFields: ['prompt', 'output_format', 'strength', 'num_inference_steps', 'guidance_scale', 'negative_prompt', 'seed', 'scheduler', 'quality', 'image_size', 'num_images', 'safety_tolerance'],
    pricing: { perImageUsd: 0.006, unit: 'generations', unitPriceUsd: 0.006, basis: 'fal 計價單位：每次' },
    defaultParams: {}
  },
  {
    id: 'fal-ai/hunyuan-image/v3/instruct/edit',
    name: 'Hunyuan Image',
    description: 'Image editing endpoint for Hunyuan Image 3.0 Instruct.',
    group: 'Tencent',
    imageInputField: 'image_urls',
    isArrayImageInput: true,
    unsupportedFields: ['strength', 'num_inference_steps', 'negative_prompt', 'scheduler', 'quality', 'safety_tolerance'],
    pricing: { perImageUsd: 0.09, isEstimate: true, unit: 'megapixels', unitPriceUsd: 0.09, basis: '$0.09 / MP × 約 1 MP（1024×1024）' },
    defaultParams: {
      guidance_scale: 3.5,
    }
  }
]

/**
 * 以 id 正規化比對，避免 fal-ai/xxx、openai/xxx 之類的別名重複列出
 * （例如 fal-ai/gpt-image-2.6-sunburst/edit 與 openai/gpt-image-2.6/sunburst/edit 是同一個模型）。
 */
function normalizeModelId(id: string): string {
  return id
    .toLowerCase()
    .replace(/^(fal-ai|fal|openai)\//, '')
    .replace(/[^a-z0-9]/g, '')
}

const curatedModels: FalModelPreset[] = DEFAULT_FAL_PRESETS.map((preset) => {
  // 精選模型的計價資訊沿用 fal.ai 同步到的同名項目（別名以正規化 id 比對）
  const synced = SYNCED_FAL_MODELS.find(
    (model) => normalizeModelId(model.id) === normalizeModelId(preset.id)
  )
  return {
    ...preset,
    group: CURATED_MODEL_GROUP,
    pricing: preset.pricing ?? synced?.pricing
  }
})
const curatedKeys = new Set(curatedModels.map((preset) => normalizeModelId(preset.id)))

/** 「AI 模型選擇」使用的完整清單：精選模型 + fal.ai 全站圖生圖模型 */
export const FAL_MODEL_CATALOG: FalModelPreset[] = [
  ...curatedModels,
  ...SYNCED_FAL_MODELS.filter((model) => !curatedKeys.has(normalizeModelId(model.id)))
]

/** 下拉選單的分組順序（精選組在最前面） */
export const FAL_MODEL_GROUPS: string[] = FAL_MODEL_CATALOG.reduce<string[]>((groups, model) => {
  const group = model.group ?? '其他'
  if (!groups.includes(group)) groups.push(group)
  return groups
}, [])
