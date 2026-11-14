import { FalModelPreset } from './types'

/**
 * 手動補充的文生圖模型（不會被 `npm run sync:fal-text-to-image` 覆蓋）。
 *
 * 這些模型多為「編輯／參考圖」模型，原本屬於圖生圖目錄，
 * 但可以在提示詞之外選擇性（或必須）提供參考圖，因此補進文生圖頁面的模型庫。
 * 名稱統一在後面加上「（可參考圖）」方便辨識；
 * `requiresReferenceImage` 為 true 表示一定要上傳參考圖才能生成。
 */
export const FAL_TEXT_TO_IMAGE_EXTRA_MODELS: FalModelPreset[] = [
  {
    id: 'fal-ai/nano-banana-pro/edit',
    name: 'Nano Banana Pro（可參考圖）',
    description:
      "Google's state-of-the-art image generation and editing model, with optional reference images.",
    group: 'Google',
    imageInputField: '',
    referenceImageField: 'image_urls',
    isArrayReferenceImage: true,
    unsupportedFields: ['image_size', 'width', 'height'],
    pricing: {
      perImageUsd: 0.15,
      isEstimate: true,
      unit: 'images',
      unitPriceUsd: 0.15,
      basis: 'fal 公布每張價格'
    },
    defaultParams: {}
  },
  {
    id: 'fal-ai/nano-banana-2/edit',
    name: 'Nano Banana 2（可參考圖）',
    description:
      "Nano Banana 2 is Google's new state-of-the-art image generation and editing model.",
    group: 'Google',
    imageInputField: '',
    referenceImageField: 'image_urls',
    isArrayReferenceImage: true,
    unsupportedFields: ['image_size', 'width', 'height'],
    pricing: {
      perImageUsd: 0.08,
      isEstimate: true,
      unit: 'images',
      unitPriceUsd: 0.08,
      basis: 'fal 公布每張價格'
    },
    defaultParams: {}
  },
  {
    id: 'blackforestlabs/flux-3/edit-image',
    name: 'FLUX 3 Edit Image（可參考圖）',
    description:
      'FLUX 3 Image Edit from Black Forest Labs makes precise local edits without changing the rest of the image, and combines up to 10 references into one balanced result.',
    group: 'Black Forest Labs',
    imageInputField: '',
    referenceImageField: 'image_urls',
    isArrayReferenceImage: true,
    requiresReferenceImage: true,
    unsupportedFields: ['image_size', 'width', 'height', 'num_images', 'seed'],
    pricing: {
      perImageUsd: 0.048,
      isEstimate: true,
      unit: 'megapixels',
      unitPriceUsd: 0.048,
      basis: '$0.048 / MP × 約 1 MP（1024×1024）'
    },
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux-2/edit',
    name: 'FLUX 2 Edit（可參考圖）',
    description:
      'Image-to-image editing with FLUX.2 [dev] from Black Forest Labs. Precise modifications using natural language descriptions and hex color control.',
    group: 'Black Forest Labs',
    imageInputField: '',
    referenceImageField: 'image_urls',
    isArrayReferenceImage: true,
    requiresReferenceImage: true,
    imageSizeEnum: [
      'landscape_16_9',
      'landscape_4_3',
      'portrait_16_9',
      'portrait_4_3',
      'square',
      'square_hd'
    ],
    unsupportedFields: ['aspect_ratio', 'width', 'height'],
    pricing: {
      perImageUsd: 0.024,
      isEstimate: true,
      unit: 'processed megapixels',
      unitPriceUsd: 0.012,
      basis: '$0.012 / MP × 約 2 MP（輸入＋輸出）'
    },
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux-pro/kontext/max/multi',
    name: 'FLUX.1 Kontext Max Multi（可參考圖）',
    description:
      'Experimental version of FLUX.1 Kontext [max] with multi image handling capabilities.',
    group: 'Black Forest Labs',
    imageInputField: '',
    referenceImageField: 'image_urls',
    isArrayReferenceImage: true,
    requiresReferenceImage: true,
    unsupportedFields: ['image_size', 'width', 'height'],
    pricing: {
      perImageUsd: 0.08,
      unit: 'images',
      unitPriceUsd: 0.08,
      basis: 'fal 計價單位：每張'
    },
    defaultParams: {}
  },
  {
    id: 'fal-ai/flux-pro/kontext/multi',
    name: 'FLUX.1 Kontext Pro Multi（可參考圖）',
    description:
      'Experimental version of FLUX.1 Kontext [pro] with multi image handling capabilities.',
    group: 'Black Forest Labs',
    imageInputField: '',
    referenceImageField: 'image_urls',
    isArrayReferenceImage: true,
    requiresReferenceImage: true,
    unsupportedFields: ['image_size', 'width', 'height'],
    pricing: {
      perImageUsd: 0.04,
      unit: 'images',
      unitPriceUsd: 0.04,
      basis: 'fal 計價單位：每張'
    },
    defaultParams: {}
  },
  {
    id: 'bytedance/seedream/v5.5/edit',
    name: 'Seedream 5.5 Edit（可參考圖）',
    description:
      'Seedream 5.5 edits images from text instructions and up to 10 reference images, with configurable output dimensions and support for transparent PNG backgrounds.',
    group: 'Bytedance',
    imageInputField: '',
    referenceImageField: 'image_urls',
    isArrayReferenceImage: true,
    requiresReferenceImage: true,
    imageSizeEnum: [
      'landscape_16_9',
      'landscape_4_3',
      'portrait_16_9',
      'portrait_4_3',
      'square',
      'square_hd'
    ],
    unsupportedFields: ['aspect_ratio', 'width', 'height', 'seed'],
    pricing: {
      perImageUsd: 0.03,
      isEstimate: true,
      unit: 'units',
      unitPriceUsd: 0.03,
      basis: 'fal 公布每張價格'
    },
    defaultParams: {}
  },
  {
    id: 'bytedance/seedream/v5/pro/edit',
    name: 'Seedream 5.0 Pro Edit（可參考圖）',
    description:
      'Seedream 5.0 Pro is a grounded, region-precise image editing model that changes one element while keeping the rest of the frame intact with layer separation.',
    group: 'Bytedance',
    imageInputField: '',
    referenceImageField: 'image_urls',
    isArrayReferenceImage: true,
    requiresReferenceImage: true,
    imageSizeEnum: [
      'landscape_16_9',
      'landscape_4_3',
      'portrait_16_9',
      'portrait_4_3',
      'square',
      'square_hd'
    ],
    unsupportedFields: ['aspect_ratio', 'width', 'height', 'seed'],
    pricing: {
      perImageUsd: 0.0675,
      isEstimate: true,
      unit: 'units',
      unitPriceUsd: 0.0675,
      basis: 'fal 公布每張價格'
    },
    defaultParams: {}
  },
  {
    id: 'openai/gpt-image-2/edit',
    name: 'GPT Image 2 Edit（可參考圖）',
    description:
      "GPT Image 2, OpenAI's latest image model, is capable of making fine-grained, detailed edits to images.",
    group: 'OpenAI',
    imageInputField: '',
    referenceImageField: 'image_urls',
    isArrayReferenceImage: true,
    requiresReferenceImage: true,
    imageSizeEnum: [
      'landscape_16_9',
      'landscape_4_3',
      'portrait_16_9',
      'portrait_4_3',
      'square',
      'square_hd'
    ],
    unsupportedFields: ['aspect_ratio', 'width', 'height', 'seed'],
    pricing: {
      perImageUsd: 0.061,
      isEstimate: true,
      unit: 'units',
      unitPriceUsd: 1,
      basis: 'token 計價（high 品質、1024×1024）'
    },
    defaultParams: {}
  },
  {
    id: 'fal-ai/kling-image/o1',
    name: 'Kling O1 Image（可參考圖）',
    description:
      'Perform precise image edits using strong reference control, transforming subjects, styles, and local details while preserving visual consistency.',
    group: 'Kling',
    imageInputField: '',
    referenceImageField: 'image_urls',
    isArrayReferenceImage: true,
    requiresReferenceImage: true,
    unsupportedFields: ['image_size', 'width', 'height', 'seed'],
    pricing: {
      perImageUsd: 0.028,
      unit: 'images',
      unitPriceUsd: 0.028,
      basis: 'fal 計價單位：每張'
    },
    defaultParams: {}
  },
  {
    id: 'fal-ai/vidu/reference-to-image',
    name: 'Vidu Reference to Image（可參考圖）',
    description:
      'Generate images from a text prompt with reference images, preserving subject identity and style.',
    group: 'Vidu',
    imageInputField: '',
    referenceImageField: 'reference_image_urls',
    isArrayReferenceImage: true,
    requiresReferenceImage: true,
    unsupportedFields: ['image_size', 'width', 'height', 'num_images', 'output_format'],
    pricing: {
      perImageUsd: 0.05,
      unit: 'images',
      unitPriceUsd: 0.05,
      basis: 'fal 計價單位：每張'
    },
    defaultParams: {}
  },
  {
    id: 'bria/fibo-2/edit',
    name: 'Fibo 2.0 Edit（可參考圖）',
    description:
      'Fibo 2.0 Edit makes targeted, instruction-based edits from up to four images. Background swaps, product restaging, keeping the product true to the original.',
    group: 'Bria AI',
    imageInputField: '',
    referenceImageField: 'image_urls',
    isArrayReferenceImage: true,
    requiresReferenceImage: true,
    promptField: 'instruction',
    unsupportedFields: ['image_size', 'width', 'height', 'num_images', 'output_format'],
    pricing: {
      perImageUsd: 0.04,
      isEstimate: true,
      unit: 'images',
      unitPriceUsd: 0.04,
      basis: 'fal 公布每張價格'
    },
    defaultParams: {}
  }
]
