/**
 * 此檔案由 scripts/sync-fal-image-to-video.mjs 自動產生，請勿手動修改！
 * 若需重新從 fal.ai 同步最新圖生影片模型與牌價，請執行：
 *   npm run sync:fal-image-to-video
 *
 * 產生時間：2026-11-15T18:10:48.286Z
 * 收錄模型數：138
 */

import { FalModelPreset } from './types'

export const FAL_IMAGE_TO_VIDEO_CATALOG: FalModelPreset[] = [
  {
    "id": "fal-ai/kling-video/v3/pro/image-to-video",
    "name": "Kling Video v3 Image to Video [Pro]",
    "description": "Kling 3.0 Pro: Top-tier image-to-video with cinematic visuals, fluid motion, and native audio generation, with custom element support.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "5"
    },
    "audioField": "generate_audio",
    "unsupportedFields": [
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.14,
      "basis": "$0.14 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "minimax/h3-max/image-to-video",
    "name": "H3 Max Image to Video",
    "description": "fal's H3 Max is a post-trained variant of MiniMax H3, tuned for stronger prompt adherence and better aesthetics while co-optimized with our custom inference stack for higher throughput with no compromises on output quality",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "min": 0.92,
      "max": 15,
      "default": 5
    },
    "resolutionEnum": [
      "480P",
      "768P",
      "1080P"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {
      "prompt_expansion_mode": "balanced"
    }
  },
  {
    "id": "minimax/h3-max-turbo/image-to-video",
    "name": "H3 Max Turbo Image to Video",
    "description": "fal's H3 Max Turbo is a post-trained variant of MiniMax H3, tuned for stronger prompt adherence and better aesthetics while co-optimized with our custom inference stack for higher throughput with no compromises on output quality",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "min": 0.92,
      "max": 15,
      "default": 5
    },
    "resolutionEnum": [
      "480P",
      "768P",
      "1080P"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.025,
      "basis": "$0.025 / 秒"
    },
    "defaultParams": {
      "prompt_expansion_mode": "balanced"
    }
  },
  {
    "id": "kling/v4/image-to-video",
    "name": "Kling 4.0 Image to Video",
    "description": "Kling 4.0 animates a starting image into a 3 to 30-second video at 720p or 1080p, with optional ending frames and per-shot prompts.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 30,
      "default": 5
    },
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.157,
      "basis": "$0.157 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
    "name": "Kling Video",
    "description": "Kling 2.5 Turbo Pro: Top-tier image-to-video generation with unparalleled motion fluidity, cinematic visuals, and exceptional prompt precision.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "endImageField": "tail_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "10"
      ],
      "default": "5"
    },
    "unsupportedFields": [
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.07,
      "basis": "$0.07 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "minimax/h3-max/reference-to-video",
    "name": "H3 Max Reference to Video",
    "description": "fal's H3 Max is a post-trained variant of MiniMax H3, tuned for stronger prompt adherence and better aesthetics while co-optimized with our custom inference stack for higher throughput with no compromises on output quality",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "min": 0.92,
      "max": 15,
      "default": 5
    },
    "aspectRatioEnum": [
      "adaptive",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480P",
      "768P",
      "1080P"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {
      "prompt_expansion_mode": "balanced"
    }
  },
  {
    "id": "fal-ai/kling-video/v3/standard/image-to-video",
    "name": "Kling Video v3 Image to Video [Standard]",
    "description": "Kling 3.0 Standard: Top-tier image-to-video with cinematic visuals, fluid motion, and native audio generation, with custom element support.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "5"
    },
    "audioField": "generate_audio",
    "unsupportedFields": [
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.14,
      "basis": "$0.14 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "blackforestlabs/flux-3-max/image-to-video",
    "name": "FLUX 3 Max Image to Video",
    "description": "fal’s FLUX 3 Max is a post-trained variant of FLUX 3 Video, tuned for stronger prompt adherence and better visual quality while optimized for lower latency.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Black Forest Labs",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "enum": [
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20
      ],
      "default": 5
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "2:1",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "720p",
      "1080p",
      "2K",
      "4K"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.085,
      "basis": "$0.085 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "bytedance/seedance-2.5/us/reference-to-video",
    "name": "Seedance 2.5 US Reference to Video",
    "description": "US-hosted ByteDance Seedance 2.5 generates video with native audio from up to 30 images, 10 videos, and 10 audio references. Supports reference-guided generation, video editing, and extension at 480p, 720p or 1080p.",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "requiresPrompt": false,
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "1000 tokens",
      "unitPriceUsd": 0.0214,
      "basis": "$0.0214 / 1K tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/v2.6/pro/image-to-video",
    "name": "Kling Video v2.6 Image to Video",
    "description": "Kling 2.6 Pro: Top-tier image-to-video with cinematic visuals, fluid motion, and native audio generation.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "10"
      ],
      "default": "5"
    },
    "audioField": "generate_audio",
    "unsupportedFields": [
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.07,
      "basis": "$0.07 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "alibaba/wan-3.0/image-to-video",
    "name": "Wan 3.0",
    "description": "Wan 3.0 is the latest generation AI video model, delivering enhanced motion smoothness, superior scene fidelity, and greater visual coherence.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "min": 2,
      "max": 30,
      "default": 5
    },
    "aspectRatioEnum": [
      "adaptive",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "alibaba/wan-3.0-prime/image-to-video",
    "name": "Wan 3.0 Prime",
    "description": "Wan 3.0 Prime Image-to-Video turns still images into dynamic, cinematic sequences with rapid turnaround, natural motion, and excellent visual continuity. It preserves the identity, composition, and atmosphere of the source image while introducing expressive movement, camera dynamics, and richly detailed animation.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "min": 2,
      "max": 30,
      "default": 5
    },
    "aspectRatioEnum": [
      "adaptive",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "minimax/h3/image-to-video",
    "name": "MiniMax H3 Image to Video",
    "description": "MiniMax H3 is a frontier video model. This endpoint animates a supplied image into 2K video, using it as the opening frame or pairs a first and last frame to control a transition between two images with the aspect ratio following the input.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "min": 5,
      "max": 15,
      "default": 5
    },
    "resolutionEnum": [
      "480P",
      "768P",
      "2K",
      "4K"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "bytedance/seedance-2.5/us/image-to-video",
    "name": "Seedance 2.5 US Image to Video",
    "description": "US-hosted ByteDance Seedance 2.5 animates still images with synchronized audio and optional end-frame control. Generate videos up to 30 seconds at 480p, 720p or 1080p.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto"
    ],
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "1000 tokens",
      "unitPriceUsd": 0.0214,
      "basis": "$0.0214 / 1K tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "google/gemini-omni-flash/v1.2/image-to-video",
    "name": "Gemini Omni Flash 1.2 Image to Video",
    "description": "Gemini Omni Flash 1.2 is Google's multimodal video model. This endpoint animates a start image into video with synchronized native audio, with an optional end image for first-to-last-frame interpolation of up to 10 seconds. Output is available at 360p, 720p, 1080p, or 4K, with durations from 3 to 15 seconds.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Google Veo / Gemini",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 15,
      "default": 8
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16"
    ],
    "resolutionEnum": [
      "360p",
      "720p",
      "1080p",
      "4k"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.0273,
      "basis": "$0.0273 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "minimax/h3/reference-to-video",
    "name": "MiniMax H3 Reference to Video",
    "description": "MiniMax H3 is a frontier video model. This endpoint generates 2K video from multimodal references up to 9 images for subject and style, 3 video clips for motion, and 3 audio clips each cited in the prompt by order, keeping subjects consistent while following the referenced motion and audio.",
    "imageInputField": "reference_image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "durationSpec": {
      "type": "number",
      "min": 5,
      "max": 15,
      "default": 5
    },
    "aspectRatioEnum": [
      "adaptive",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480P",
      "768P",
      "2K",
      "4K"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "google/gemini-omni-flash/v1.2/reference-to-video",
    "name": "Gemini Omni Flash 1.2 Reference to Video",
    "description": "Gemini Omni Flash 1.2 is Google's multimodal video model. This endpoint generates video from a text prompt combined with up to ten reference images and up to three reference videos, each addressable in the prompt, using them as visual references for subjects and settings. Output is available at 360p, 720p, 1080p, or 4K, with durations from 3 to 15 seconds.",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Google Veo / Gemini",
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 15,
      "default": 8
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16"
    ],
    "resolutionEnum": [
      "360p",
      "720p",
      "1080p",
      "4k"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.0273,
      "basis": "$0.0273 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "google/gemini-omni-flash/v1.1/image-to-video",
    "name": "Gemini Omni Flash 1.1 Image to Video",
    "description": "Gemini Omni Flash 1.1 is Google's multimodal video model. This endpoint animates a still image into video with synchronized audio, extending a single frame into coherent motion that reflects the logic of the real world.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Google Veo / Gemini",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 10,
      "default": 8
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16"
    ],
    "resolutionEnum": [
      "360p",
      "720p",
      "1080p",
      "4k"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.03,
      "basis": "$0.03 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/v2.5-turbo/standard/image-to-video",
    "name": "Kling Video",
    "description": "Kling 2.5 Turbo Standard: Top-tier image-to-video generation with unparalleled motion fluidity, cinematic visuals, and exceptional prompt precision.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "10"
      ],
      "default": "5"
    },
    "unsupportedFields": [
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.042,
      "basis": "$0.042 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "bytedance/seedance-2.0/fast/image-to-video",
    "name": "Seedance 2.0 Fast Image to Video",
    "description": "ByteDance's most advanced image-to-video model, fast tier. Lower latency and cost with synchronized audio, start and end frame control, and motion prompts.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "1000 tokens",
      "unitPriceUsd": 0.0112,
      "basis": "$0.0112 / 1K tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "xai/grok-imagine-video/image-to-video",
    "name": "Grok Imagine Video",
    "description": "Generate videos from images with audio using xAI's Grok Imagine Video model.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "xAI Grok",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 15,
      "default": 6
    },
    "aspectRatioEnum": [
      "auto",
      "16:9",
      "4:3",
      "3:2",
      "1:1",
      "2:3",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/o3/pro/image-to-video",
    "name": "Kling O3 Image to Video [Pro]",
    "description": "Generate a video by taking a start frame and an end frame, animating the transition between them while following text-driven style and scene guidance.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "5"
    },
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.14,
      "basis": "$0.14 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/bytedance/seedance/v1/pro/fast/image-to-video",
    "name": "Bytedance Seedance V1 Pro Fast Image To Video",
    "description": "Image to Video endpoint for Seedance 1.0 Pro Fast, a next-generation video model designed to deliver maximum performance at minimal cost",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "durationSpec": {
      "type": "string",
      "enum": [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16",
      "auto"
    ],
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "1m tokens",
      "unitPriceUsd": 1,
      "basis": "$1.00 / 1M tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "xai/grok-imagine-video/v1.5/image-to-video",
    "name": "Grok Imagine Video 1.5",
    "description": "Generate videos from images with audio using xAI's Grok Imagine 1.5 Video model.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "xAI Grok",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 15,
      "default": 6
    },
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.01,
      "basis": "$0.01 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/o3/pro/reference-to-video",
    "name": "Kling O3 Reference to Video [Pro]",
    "description": "Transform images, elements, and text into consistent, high-quality video scenes, ensuring stable character identity, object details, and environments.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.14,
      "basis": "$0.14 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "xai/grok-imagine-video/v1.5/lite/image-to-video",
    "name": "Grok Imagine Video 1.5 Lite Image to Video",
    "description": "Generate videos from images using xAI's Grok Imagine Video 1.5 Lite model.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "xAI Grok",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 15,
      "default": 6
    },
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 0.01,
      "basis": "$0.01 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/o3/standard/image-to-video",
    "name": "Kling O3 Image to Video [Pro]",
    "description": "Generate a video by taking a start frame and an end frame, animating the transition between them while following text-driven style and scene guidance.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "5"
    },
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.14,
      "basis": "$0.14 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/bytedance/seedance/v1/pro/image-to-video",
    "name": "Seedance 1.0 Pro",
    "description": "Seedance 1.0 Pro, a high quality video generation model developed by Bytedance.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16",
      "auto"
    ],
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "1m tokens",
      "unitPriceUsd": 2.5,
      "basis": "$2.50 / 1M tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "bytedance/seedance-2.0/fast/reference-to-video",
    "name": "Seedance 2.0 Fast Reference to Video",
    "description": "ByteDance's most advanced reference-to-video model, fast tier. Lower latency and cost with up to 9 images, 3 videos, and 3 audio clips as inputs.",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "1000 tokens",
      "unitPriceUsd": 0.0112,
      "basis": "$0.0112 / 1K tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v6/image-to-video",
    "name": "PixVerse V6 Image To Video",
    "description": "Pixverse's latest V6 Model",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 15,
      "default": 5
    },
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio_switch",
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.005,
      "basis": "$0.005 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "lightricks/ltx-2.5/image-to-video/pro",
    "name": "LTX 2.5 Image to Video Pro",
    "description": "LTX-2.5 is Lightricks' open-source audio-video model. This endpoint animates a still image into video with synchronized audio in a single pass, in a quality-optimized mode for high-fidelity final output.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        6,
        8,
        10,
        "auto"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "16:9",
      "9:16"
    ],
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 0.01,
      "basis": "$0.01 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "google/gemini-omni-flash/v1.1/reference-to-video",
    "name": "Gemini Omni Flash 1.1 Reference to Video",
    "description": "Gemini Omni Flash 1.1 is Google's multimodal video model. This endpoint generates video from combined multimodal references, images, videos and text together. Reasoning across all inputs to produce a single coherent result, with characters retaining their face, clothing, and voice throughout",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Google Veo / Gemini",
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 10,
      "default": 8
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16"
    ],
    "resolutionEnum": [
      "360p",
      "720p",
      "1080p",
      "4k"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.03,
      "basis": "$0.03 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/hailuo-02/standard/image-to-video",
    "name": "MiniMax Hailuo 02 [Standard] (Image to Video)",
    "description": "MiniMax Hailuo-02 Image To Video API (Standard, 768p, 512p): Advanced image-to-video generation model with 768p and 512p resolutions",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "6",
        "10"
      ],
      "default": "6"
    },
    "resolutionEnum": [
      "512P",
      "768P"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.045,
      "basis": "$0.045 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "kling/v4/flash/image-to-video",
    "name": "Kling 4.0 Flash Image to Video",
    "description": "Kling 4.0 Flash animates a starting image into a 720p video, with optional text prompts and durations from 3 to 20 seconds.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 20,
      "default": 5
    },
    "resolutionEnum": [
      "720p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.094,
      "basis": "$0.094 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/o3/standard/reference-to-video",
    "name": "Kling O3 Reference to Video [Standard]",
    "description": "Transform images, elements, and text into consistent, high-quality video scenes, ensuring stable character identity, object details, and environments.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.14,
      "basis": "$0.14 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "minimax/h3-max-turbo/reference-to-video",
    "name": "H3 Max Turbo Reference to Video",
    "description": "Generate video with synchronized audio from a prompt and image, video, or audio references with H3 Max Turbo, at 480p, 768p, or 1080p for up to 15 seconds.",
    "imageInputField": "reference_image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "durationSpec": {
      "type": "number",
      "min": 0.92,
      "max": 15,
      "default": 5
    },
    "aspectRatioEnum": [
      "adaptive",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480P",
      "768P",
      "1080P"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {
      "prompt_expansion_mode": "balanced"
    }
  },
  {
    "id": "heygen/heygen-video/image-to-video",
    "name": "HeyGen Video Image to Video",
    "description": "HeyGen Video animates your image as the first frame of a 5 to 15 second clip, with generated sound, built on MiniMax H3 and post-trained by HeyGen.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "HeyGen",
    "durationSpec": {
      "type": "number",
      "min": 5,
      "max": 15,
      "default": 5
    },
    "resolutionEnum": [
      "480p",
      "768p",
      "1080p",
      "2k"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.02,
      "basis": "$0.02 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/wan/v2.7/image-to-video",
    "name": "Wan",
    "description": "Wan 2.7 is the latest generation AI video model, delivering enhanced motion smoothness, superior scene fidelity, and greater visual coherence.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "enum": [
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15
      ],
      "default": 5
    },
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.1,
      "basis": "$0.10 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/heygen/avatar4/image-to-video",
    "name": "Heygen",
    "description": "Heygen Photo Avatar 4 Model",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "HeyGen",
    "requiresPrompt": false,
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "4:5",
      "5:4",
      "1:1",
      "auto"
    ],
    "resolutionEnum": [
      "360p",
      "480p",
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "duration",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.1,
      "basis": "$0.10 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "bytedance/seedance-2.0/mini/image-to-video",
    "name": "Seedance 2.0 Mini Image to Video",
    "description": "Seedance 2.0 Mini is a faster version of Seedance 2.0 that brings great performance and high generation speed at a lower cost.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "1000 tokens",
      "unitPriceUsd": 0.007,
      "basis": "$0.007 / 1K tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "bytedance/seedance-2.0/mini/reference-to-video",
    "name": "Seedance 2.0 Mini",
    "description": "Seedance 2.0 Mini is a faster version of Seedance 2.0 that brings great performance and high generation speed at a lower cost.",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "1000 tokens",
      "unitPriceUsd": 0.007,
      "basis": "$0.007 / 1K tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "blackforestlabs/flux-3/image-to-video",
    "name": "FLUX 3 Image to Video",
    "description": "FLUX 3 is Black Forest Labs' frontier video model. This endpoint animates a single still image into video, extending one frame into coherent, natural motion.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Black Forest Labs",
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "2:1",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "720p",
      "1080p",
      "1440p",
      "2160p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.085,
      "basis": "$0.085 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/v3/turbo/pro/image-to-video",
    "name": "Kling Video V3 Turbo Pro Image to Video",
    "description": "Generate high quality 1080p videos from images using Kling's Turbo 3.0 model, with improved lipsync and multishot generation capabilities.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "5"
    },
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.14,
      "basis": "$0.14 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "google/gemini-omni-flash/image-to-video",
    "name": "Gemini Omni Flash",
    "description": "Animates a still image into video with audio. Extends a single frame into coherent motion, grounded in Gemini's physical understanding of how scenes and subjects behave.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Google Veo / Gemini",
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 10,
      "default": 8
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 1,
      "basis": "$1.00 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/wan-25-preview/image-to-video",
    "name": "Wan 2.5 Image to Video",
    "description": "Wan 2.5 image-to-video model.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "10"
      ],
      "default": "5"
    },
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "minimax/h3-max/camera-controls",
    "name": "H3 Max Camera Controls",
    "description": "H3 Max Multi Angle turns a single image into a video with precise, keyframe-based control over the camera's orbit, elevation, and distance in 3D space",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "requiresPrompt": false,
    "durationSpec": {
      "type": "number",
      "min": 0.92,
      "max": 15,
      "default": 5
    },
    "resolutionEnum": [
      "480P",
      "768P",
      "1080P"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {
      "prompt_expansion_mode": "balanced"
    }
  },
  {
    "id": "fal-ai/kling-video/v3/turbo/standard/image-to-video",
    "name": "Kling Video V3 Standard Turbo Image to Video",
    "description": "Kling 3.0 Turbo Standard animates a first and last frame reference image into 720P video with native audio, delivering quick, affordable image-driven motion for fast turnaround",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "5"
    },
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.112,
      "basis": "$0.112 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video",
    "name": "MiniMax Hailuo 2.3 Fast [Standard] (Image to Video)",
    "description": "MiniMax Hailuo-2.3-Fast Image To Video API (Standard, 768p): Advanced fast image-to-video generation model with 768p resolution",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "durationSpec": {
      "type": "string",
      "enum": [
        "6",
        "10"
      ],
      "default": "6"
    },
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 0.19,
      "basis": "$0.19 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "heygen/heygen-video/reference-to-video",
    "name": "HeyGen Video Reference to Video",
    "description": "HeyGen Video builds a new 5 to 15 second scene with sound that keeps the products, people or places from your reference images, videos or audio.",
    "imageInputField": "reference_image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "HeyGen",
    "durationSpec": {
      "type": "number",
      "min": 5,
      "max": 15,
      "default": 5
    },
    "aspectRatioEnum": [
      "adaptive",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "768p",
      "1080p",
      "2k"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.02,
      "basis": "$0.02 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/o1/image-to-video",
    "name": "Kling O1 First Frame Last Frame to Video [Pro]",
    "description": "Generate a video by taking a start frame and an end frame, animating the transition between them while following text-driven style and scene guidance.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10"
      ],
      "default": "5"
    },
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.112,
      "basis": "$0.112 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltx-2.3/image-to-video/fast",
    "name": "LTX 2.3 Video Fast",
    "description": "LTX-2.3 is a high-quality, fast AI video model available in Pro and Fast variants for text-to-video, image-to-video, and audio-to-video.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "enum": [
        6,
        8,
        10,
        12,
        14,
        16,
        18,
        20
      ],
      "default": 6
    },
    "aspectRatioEnum": [
      "auto",
      "16:9",
      "9:16"
    ],
    "resolutionEnum": [
      "1080p",
      "1440p",
      "2160p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.06,
      "basis": "$0.06 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "xai/grok-imagine-video/v1.5/reference-to-video",
    "name": "Grok Imagine Video 1.5 Reference to Video",
    "description": "Generate videos from images and audio references using xAI's Grok Imagine 1.5 Video model.",
    "imageInputField": "reference_image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "xAI Grok",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 15,
      "default": 8
    },
    "aspectRatioEnum": [
      "16:9",
      "4:3",
      "3:2",
      "1:1",
      "2:3",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.01,
      "basis": "$0.01 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/v3/4k/image-to-video",
    "name": "Kling Video",
    "description": "Kling's Native 4K is a video generation model that directly outputs professional-grade 4K video in one step, eliminating the need for post-production upscaling",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "5"
    },
    "audioField": "generate_audio",
    "unsupportedFields": [
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.42,
      "basis": "$0.42 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "lightricks/ltx-2.5/image-to-video/fast",
    "name": "LTX 2.5 Image to Video Fast",
    "description": "LTX-2.5 is Lightricks' open-source audio-video model. This endpoint animates a still image into video with synchronized audio in a single pass, in a speed-optimized mode for quick iteration.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        6,
        8,
        10,
        12,
        14,
        16,
        18,
        20,
        "auto"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "16:9",
      "9:16"
    ],
    "resolutionEnum": [
      "720p",
      "1080p",
      "1440p",
      "2160p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 0.01,
      "basis": "$0.01 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "xai/grok-imagine-video/reference-to-video",
    "name": "Grok Imagine Reference to Video",
    "description": "Generate videos using multiple reference images with xAI's Grok Imagine video model",
    "imageInputField": "reference_image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "xAI Grok",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 10,
      "default": 8
    },
    "aspectRatioEnum": [
      "16:9",
      "4:3",
      "3:2",
      "1:1",
      "2:3",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/hailuo-2.3/standard/image-to-video",
    "name": "MiniMax Hailuo 2.3 [Standard] (Image to Video)",
    "description": "MiniMax Hailuo-2.3 Image To Video API (Standard, 768p): Advanced image-to-video generation model with 768p resolution",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "durationSpec": {
      "type": "string",
      "enum": [
        "6",
        "10"
      ],
      "default": "6"
    },
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 0.28,
      "basis": "$0.28 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "luma/agent/ray/v3.2/image-to-video",
    "name": "Luma Ray 3.2 Image to Video",
    "description": "Luma Ray 3.2 animates a source image into cinematic motion guided by a text prompt, preserving the starting frame's look while controlling resolution, duration, and seamless looping.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Luma Ray",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "seconds_string",
      "enum": [
        "5s",
        "10s"
      ],
      "default": "5s"
    },
    "aspectRatioEnum": [
      "3:4",
      "4:3",
      "1:1",
      "9:16",
      "16:9",
      "21:9"
    ],
    "resolutionEnum": [
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.03,
      "basis": "$0.03 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "wan/v2.6/image-to-video",
    "name": "Wan v2.6 Image to Video",
    "description": "Wan 2.6 image-to-video model.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "10",
        "15"
      ],
      "default": "5"
    },
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.1,
      "basis": "$0.10 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "wan/v2.6/image-to-video/flash",
    "name": "V2.6",
    "description": "Wan 2.6 image-to-video flash model.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "10",
        "15"
      ],
      "default": "5"
    },
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v6/transition",
    "name": "PixVerse V6 Transition",
    "description": "Pixverse's latest v6 Model.",
    "imageInputField": "first_image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 15,
      "default": 5
    },
    "aspectRatioEnum": [
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16",
      "2:3",
      "3:2",
      "21:9"
    ],
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio_switch",
    "unsupportedFields": [
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.005,
      "basis": "$0.005 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/q4/image-to-video",
    "name": "Vidu Q4",
    "description": "Vidu Q4 turns a first-frame image into 3 to 16 second videos with native audio at up to 4K. Best for animating stills, product shots and character scenes with dialogue.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Vidu",
    "requiresPrompt": false,
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 16,
      "default": 5
    },
    "resolutionEnum": [
      "540p",
      "720p",
      "1080p",
      "2K",
      "4K"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 0.0035,
      "basis": "$0.0035 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "google/gemini-omni-flash/reference-to-video",
    "name": "Gemini Omni Flash",
    "description": "Generates video with audio from combined multimodal references. Accepts text, images, audio, and video together as input to guide subject, motion, style, and sound in the output.",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Google Veo / Gemini",
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 10,
      "default": 8
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 1,
      "basis": "$1.00 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/hailuo-2.3/pro/image-to-video",
    "name": "MiniMax Hailuo 2.3 [Pro] (Image to Video)",
    "description": "MiniMax Hailuo-2.3 Image To Video API (Pro, 1080p): Advanced image-to-video generation model with 1080p resolution",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 0.49,
      "basis": "$0.49 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "bytedance/seedance-2.0/us/reference-to-video",
    "name": "Seedance 2.0 US Reference to Video",
    "description": "US hosted version of ByteDance's most advanced reference-to-video model. Generate video from up to 9 images, 3 videos, and 3 audio clips with native audio and cinematic camera control.",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p",
      "4k"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "1000 tokens",
      "unitPriceUsd": 0.014,
      "basis": "$0.014 / 1K tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "tbc/mischief-1/image-to-video",
    "name": "Mischief 1",
    "description": "TBC mischief 1 is the world's first neuron-derived video model. Generate videos 5x faster at a fraction of the cost, so you can explore more ideas, experiment freely, and make more mischief.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "TBC",
    "durationSpec": {
      "type": "number",
      "enum": [
        3,
        5
      ],
      "default": 5
    },
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.005,
      "basis": "$0.005 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/hailuo-02/pro/image-to-video",
    "name": "MiniMax Hailuo 02 [Pro] (Image to Video)",
    "description": "MiniMax Hailuo-02 Image To Video API (Pro, 1080p): Advanced image-to-video generation model with 1080p resolution",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "endImageField": "end_image_url",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.08,
      "basis": "$0.08 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "bytedance/seedance-2.0/us/image-to-video",
    "name": "Seedance 2.0 US Image to Video",
    "description": "US hosted version of ByteDance's most advanced image-to-video model. Animate still images into cinematic video with synchronized audio, start and end frame control, and motion prompts.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p",
      "4k"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "1000 tokens",
      "unitPriceUsd": 0.014,
      "basis": "$0.014 / 1K tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/hailuo-02-fast/image-to-video",
    "name": "Minimax",
    "description": "Create blazing fast and economical videos with MiniMax Hailuo-02 Image To Video API at 512p resolution",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "durationSpec": {
      "type": "string",
      "enum": [
        "6",
        "10"
      ],
      "default": "6"
    },
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.017,
      "basis": "$0.017 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/q4/reference-to-video",
    "name": "Vidu Q4 Reference to Video",
    "description": "Vidu Q4 generates videos from up to 12 reference images and 3 voice clips, keeping characters, objects, and voices consistent across up to 16 seconds at up to 4K.",
    "imageInputField": "reference_image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Vidu",
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 16,
      "default": 5
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "4:3",
      "3:4",
      "1:1"
    ],
    "resolutionEnum": [
      "540p",
      "720p",
      "1080p",
      "2K",
      "4K"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 0.0035,
      "basis": "$0.0035 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltx-2.3/image-to-video",
    "name": "LTX 2.3 Video Pro",
    "description": "LTX-2.3 is a high-quality, fast AI video model available in Pro and Fast variants for text-to-video, image-to-video, and audio-to-video.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "enum": [
        6,
        8,
        10
      ],
      "default": 6
    },
    "aspectRatioEnum": [
      "auto",
      "16:9",
      "9:16"
    ],
    "resolutionEnum": [
      "1080p",
      "1440p",
      "2160p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.08,
      "basis": "$0.08 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "blackforestlabs/flux-3/first-last-frame-to-video",
    "name": "Flux 3 First Last Frame to Video",
    "description": "FLUX 3 is Black Forest Labs' frontier video model. This endpoint generates the video between a defined start and end frame, interpolating a smooth, coherent transition from the first image to the last.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Black Forest Labs",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "durationSpec": {
      "type": "number",
      "enum": [
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20
      ],
      "default": 5
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "2:1",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "720p",
      "1080p",
      "1440p",
      "2160p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.085,
      "basis": "$0.085 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "alibaba/happy-horse/image-to-video",
    "name": "Happy Horse",
    "description": "Alibaba's #1-ranked Happy Horse 1.0 — generate 1080p video with synchronized native audio and multilingual lip-sync from text prompts or images.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
    "requiresPrompt": false,
    "durationSpec": {
      "type": "number",
      "enum": [
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15
      ],
      "default": 5
    },
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 0.14,
      "basis": "$0.14 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/wan/v2.7/reference-to-video",
    "name": "Wan 2.7 Reference to Video",
    "description": "Wan 2.7 is the latest generation AI video model, delivering enhanced motion smoothness, superior scene fidelity, and greater visual coherence.",
    "imageInputField": "reference_image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
    "durationSpec": {
      "type": "number",
      "enum": [
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10
      ],
      "default": 5
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1",
      "4:3",
      "3:4"
    ],
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.1,
      "basis": "$0.10 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/o3/4k/image-to-video",
    "name": "Kling Video",
    "description": "Kling's Native 4K is a video generation model that directly outputs professional-grade 4K video in one step, eliminating the need for post-production upscaling",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "5"
    },
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.42,
      "basis": "$0.42 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "alibaba/happy-horse/v1.1/image-to-video",
    "name": "Happy Horse 1.1 Image to Video",
    "description": "Happy Horse 1.1 is Alibaba's #1-ranked video model. This image-to-video endpoint animates a still image into 1080p video with synchronized native audio and multilingual lip-sync",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
    "requiresPrompt": false,
    "durationSpec": {
      "type": "number",
      "enum": [
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15
      ],
      "default": 5
    },
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.14,
      "basis": "$0.14 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/q3/image-to-video",
    "name": "Vidu",
    "description": "Vidu's latest Q3 pro models.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Vidu",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 16,
      "default": 5
    },
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.07,
      "basis": "$0.07 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/o1/standard/image-to-video",
    "name": "Kling O1 First Frame Last Frame to Video [Standard]",
    "description": "Generate a video by taking a start frame and an end frame, animating the transition between them while following text-driven style and scene guidance.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10"
      ],
      "default": "5"
    },
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.084,
      "basis": "$0.084 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/o1/reference-to-video",
    "name": "Kling O1 Reference Image to Video [Pro]",
    "description": "Transform images, elements, and text into consistent, high-quality video scenes, ensuring stable character identity, object details, and environments.",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.112,
      "basis": "$0.112 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/q3/image-to-video/turbo",
    "name": "Vidu",
    "description": "Vidu's Q3 Turbo Model",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Vidu",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 16,
      "default": 5
    },
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.035,
      "basis": "$0.035 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/o3/4k/reference-to-video",
    "name": "Kling Video",
    "description": "Kling's Native 4K is a video generation model that directly outputs professional-grade 4K video in one step, eliminating the need for post-production upscaling",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.42,
      "basis": "$0.42 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/c1/image-to-video",
    "name": "PixVerse C1 Image To Video",
    "description": "Animate images into cinematic videos with PixVerse C1, supporting 1080p resolution and native audio generation.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 15,
      "default": 5
    },
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio_switch",
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.005,
      "basis": "$0.005 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "pixverse/v6/max/image-to-video",
    "name": "PixVerse V6 Max Image To Video",
    "description": "Generate videos from images with PixVerse V6 Max, with optional audio and multi-clip generation.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 15,
      "default": 5
    },
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio_switch",
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.009,
      "basis": "$0.009 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "alibaba/happy-horse/v1.1/reference-to-video",
    "name": "Happy Horse 1.1 Reference to Video",
    "description": "Happy Horse 1.1 is Alibaba's #1-ranked video model. This reference-to-video endpoint turns up to 9 reference images into 1080p video with synchronized native audio and multilingual lip-sync for consistent characters.",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
    "durationSpec": {
      "type": "number",
      "enum": [
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15
      ],
      "default": 5
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1",
      "4:3",
      "3:4",
      "21:9",
      "9:21",
      "5:4",
      "4:5"
    ],
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.14,
      "basis": "$0.14 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v5/image-to-video",
    "name": "PixVerse V5 Image To Video",
    "description": "Generate high quality video clips from text and image prompts using PixVerse v5",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "8"
      ],
      "default": "5"
    },
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "video segments",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 片段"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v5.5/image-to-video",
    "name": "PixVerse V5.5 Image To Video",
    "description": "Generate high quality video clips from text and image prompts using PixVerse v5.5",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "8",
        "10"
      ],
      "default": "5"
    },
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio_switch",
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "alibaba/happy-horse/reference-to-video",
    "name": "Happy Horse",
    "description": "Generate 1080p video with synchronized native audio from a text prompt and references. Aspect ratios: 16:9, 9:16, 1:1, 4:3, 3:4. Duration: 3–15s.",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
    "durationSpec": {
      "type": "number",
      "enum": [
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15
      ],
      "default": 5
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1",
      "4:3",
      "3:4"
    ],
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.14,
      "basis": "$0.14 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltx-video-13b-distilled/image-to-video",
    "name": "LTX Video-0.9.7 13B Distilled",
    "description": "Generate videos from prompts and images using LTX Video-0.9.7 13B Distilled and custom LoRA",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "aspectRatioEnum": [
      "9:16",
      "1:1",
      "16:9",
      "auto"
    ],
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "unsupportedFields": [
      "duration",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 0.04,
      "basis": "$0.04 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/video-01/image-to-video",
    "name": "MiniMax (Hailuo AI) Video 01",
    "description": "Generate video clips from your images using MiniMax Video model",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.5,
      "basis": "$0.50 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltxv-13b-098-distilled/image-to-video",
    "name": "LTX-Video 13B 0.9.8 Distilled",
    "description": "Generate long videos from prompts and images using LTX Video-0.9.8 13B Distilled and custom LoRA",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "aspectRatioEnum": [
      "9:16",
      "1:1",
      "16:9",
      "auto"
    ],
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "unsupportedFields": [
      "duration",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.02,
      "basis": "$0.02 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltx-2.3-22b/distilled/image-to-video",
    "name": "LTX-2.3 22B Distilled",
    "description": "Generate video with audio from images using LTX-2.3 Distilled",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "endImageField": "end_image_url",
    "videoSizeEnum": [
      "auto",
      "square_hd",
      "square",
      "portrait_4_3",
      "portrait_16_9",
      "landscape_4_3",
      "landscape_16_9"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "resolution"
    ],
    "pricing": {
      "unit": "megapixels",
      "unitPriceUsd": 0.001205,
      "basis": "$0.0012 / MP"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/hailuo-2.3-fast/pro/image-to-video",
    "name": "MiniMax Hailuo 2.3 Fast [Pro] (Image to Video)",
    "description": "MiniMax Hailuo-2.3-Fast Image To Video API (Pro, 1080p): Advanced fast image-to-video generation model with 1080p resolution",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.33,
      "basis": "$0.33 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "blackforestlabs/flux-3/image-to-video/draft",
    "name": "Flux 3 Image To Video Draft",
    "description": "FLUX.3 is Black Forest Labs' frontier audio/video model. Generate fast, low-cost draft previews that animate a still image, with a reusable draft cache for full-quality enhancement.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Black Forest Labs",
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "2:1",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.03,
      "basis": "$0.03 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltx-video/image-to-video",
    "name": "LTX Video (preview)",
    "description": "Generate videos from images using LTX Video 0.9.1",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.02,
      "basis": "$0.02 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v4.5/image-to-video",
    "name": "PixVerse V4.5 Image To Video",
    "description": "Generate high quality video clips from text and image prompts using PixVerse v4.5",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "8"
      ],
      "default": "5"
    },
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "video segments",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 片段"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/longcat-video/distilled/image-to-video/720p",
    "name": "LongCat Video Distilled",
    "description": "Generate long videos in 720p/30fps from images using LongCat Video Distilled",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "LongCat Video",
    "requiresPrompt": false,
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.01,
      "basis": "$0.01 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v5/transition",
    "name": "PixVerse V5 Transition",
    "description": "Create seamless transition between images using PixVerse v5",
    "imageInputField": "first_image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "8"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "video_size"
    ],
    "pricing": {
      "unit": "video segments",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 片段"
    },
    "defaultParams": {}
  },
  {
    "id": "pixelcut/looping-video",
    "name": "Pixelcut Looping Video",
    "description": "Turn one product photo into a seamless 5 to 15 second video loop with a locked camera, subtle ambient motion or a full 360° spin.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Pixelcut",
    "requiresPrompt": false,
    "durationSpec": {
      "type": "number",
      "min": 5,
      "max": 15,
      "default": 5
    },
    "resolutionEnum": [
      "480p",
      "768p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.08,
      "basis": "$0.08 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltx-2.3-22b/image-to-video",
    "name": "LTX-2.3 22B",
    "description": "Generate video with audio from images using LTX-2.3",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "endImageField": "end_image_url",
    "videoSizeEnum": [
      "auto",
      "square_hd",
      "square",
      "portrait_4_3",
      "portrait_16_9",
      "landscape_4_3",
      "landscape_16_9"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "resolution"
    ],
    "pricing": {
      "unit": "megapixels",
      "unitPriceUsd": 0.001605,
      "basis": "$0.00161 / MP"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/q2/image-to-video/turbo",
    "name": "Vidu",
    "description": "Use the latest Vidu Q2 models which much more better quality and control on your videos.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Vidu",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "enum": [
        2,
        3,
        4,
        5,
        6,
        7,
        8
      ],
      "default": 4
    },
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/longcat-video/distilled/image-to-video/480p",
    "name": "LongCat Video Distilled",
    "description": "Generate long videos from images using LongCat Video Distilled",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "LongCat Video",
    "requiresPrompt": false,
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.005,
      "basis": "$0.005 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltx-2.3-quality/image-to-video",
    "name": "Ltx 2.3 Quality",
    "description": "Generate high-quality video with audio from images using LTX-2.3",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "resolutionEnum": [
      "auto",
      "square_hd",
      "square",
      "portrait_4_3",
      "portrait_16_9",
      "landscape_4_3",
      "landscape_16_9"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "video_size"
    ],
    "pricing": {
      "unit": "megapixels",
      "unitPriceUsd": 0.0024075,
      "basis": "$0.00241 / MP"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/q3/reference-to-video/mix",
    "name": "Vidu",
    "description": "Vidu's latest Q3 Reference to Video Mix model",
    "imageInputField": "reference_image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Vidu",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 16,
      "default": 5
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "4:3",
      "3:4",
      "1:1"
    ],
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.07,
      "basis": "$0.07 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "blackforestlabs/flux-3/first-last-frame-to-video/draft",
    "name": "Flux 3 First Last Frame to Video Draft",
    "description": "FLUX.3 is Black Forest Labs' frontier audio/video model. Generate fast, low-cost draft previews between a start and an end frame, with a reusable draft cache for full-quality enhancement.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Black Forest Labs",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "durationSpec": {
      "type": "number",
      "enum": [
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20
      ],
      "default": 5
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "2:1",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.03,
      "basis": "$0.03 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/c1/transition",
    "name": "PixVerse C1 Transition",
    "description": "Create seamless cinematic transitions between two images with PixVerse C1, with native audio and up to 1080p.",
    "imageInputField": "first_image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 15,
      "default": 5
    },
    "aspectRatioEnum": [
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16",
      "2:3",
      "3:2",
      "21:9"
    ],
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio_switch",
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.005,
      "basis": "$0.005 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/o1/standard/reference-to-video",
    "name": "Kling O1 Reference Image to Video [Standard]",
    "description": "Transform images, elements, and text into consistent, high-quality video scenes, ensuring stable character identity, object details, and environments.",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "durationSpec": {
      "type": "string",
      "enum": [
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.084,
      "basis": "$0.084 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v5.5/transition",
    "name": "PixVerse V5.5 Transition",
    "description": "Pixverse Transition",
    "imageInputField": "first_image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "8",
        "10"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio_switch",
    "unsupportedFields": [
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ovi/image-to-video",
    "name": "Ovi",
    "description": "Ovi can generate videos with audio from image and text inputs.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Ovi",
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.2,
      "basis": "$0.20 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/video-01-live/image-to-video",
    "name": "MiniMax (Hailuo AI) Video 01",
    "description": "Generate video clips from your images using MiniMax Video model",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.5,
      "basis": "$0.50 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/longcat-video/image-to-video/720p",
    "name": "LongCat Video",
    "description": "Generate long videos in 720p/30fps from images using LongCat Video",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "LongCat Video",
    "requiresPrompt": false,
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.04,
      "basis": "$0.04 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/framepack/flf2v",
    "name": "Framepack",
    "description": "Framepack is an efficient Image-to-video model that autoregressively generates videos.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "framepack",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "aspectRatioEnum": [
      "16:9",
      "9:16"
    ],
    "resolutionEnum": [
      "720p",
      "480p"
    ],
    "unsupportedFields": [
      "duration",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.0333,
      "basis": "$0.0333 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/q2/reference-to-video/pro",
    "name": "Vidu",
    "description": "Use the latest Vidu Q2 Pro models which much more better quality and control on your videos.",
    "imageInputField": "reference_image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Vidu",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 8,
      "default": 4
    },
    "resolutionEnum": [
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.1,
      "basis": "$0.10 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "nvidia/cosmos-3-super/image-to-video",
    "name": "Cosmos 3 Super Image to Video",
    "description": "Cosmos3 is a collection of Omnimodal world models capable of generating dynamic, high-quality video, image, audio, and action commands from combinations of text, image, video, and action trajectory inputs.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "NVIDIA",
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/framepack",
    "name": "Framepack",
    "description": "Framepack is an efficient Image-to-video model that autoregressively generates videos.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "framepack",
    "aspectRatioEnum": [
      "16:9",
      "9:16"
    ],
    "resolutionEnum": [
      "720p",
      "480p"
    ],
    "unsupportedFields": [
      "duration",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.0333,
      "basis": "$0.0333 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/q2/image-to-video/pro",
    "name": "Vidu",
    "description": "Use the latest Vidu Q2 models which much more better quality and control on your videos.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Vidu",
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "number",
      "enum": [
        2,
        3,
        4,
        5,
        6,
        7,
        8
      ],
      "default": 4
    },
    "resolutionEnum": [
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/q1/reference-to-video",
    "name": "Vidu",
    "description": "Generate video clips from your multiple image references using Vidu Q1",
    "imageInputField": "reference_image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Vidu",
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "credits",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 點數"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v5.6/image-to-video",
    "name": "PixVerse V5.6 Image To Video",
    "description": "Use the latest pixverse v5.6 model to turn your texts and images into amazing videos.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "8",
        "10"
      ],
      "default": "5"
    },
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio_switch",
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.15,
      "basis": "$0.15 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/q1/image-to-video",
    "name": "Vidu Image to Video",
    "description": "Vidu Q1 Image to Video generates high-quality 1080p videos with exceptional visual quality and motion diversity from a single image",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Vidu",
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "credits",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 點數"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/image-to-video",
    "name": "Vidu Image to Video",
    "description": "Vidu Image to Video generates high-quality videos with exceptional visual quality and motion diversity from a single image",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Vidu",
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "defaultParams": {}
  },
  {
    "id": "moonvalley/marey/i2v",
    "name": "Marey Realism V1.5",
    "description": "Generate a video starting from an image as the first frame with Marey, a generative video model trained exclusively on fully licensed data.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Moonvalley Marey",
    "durationSpec": {
      "type": "seconds_string",
      "enum": [
        "5s",
        "10s"
      ],
      "default": "5s"
    },
    "unsupportedFields": [
      "aspect_ratio",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "5 seconds",
      "unitPriceUsd": 1.5,
      "basis": "$1.50 / 每 5 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kandinsky6-pro/image-to-video",
    "name": "Kandinsky 6.0 Pro",
    "description": "Kandinsky 6.0 Pro turns a start frame into a high-resolution, cinematic video clip with controllable motion and strong visual fidelity.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Kandinsky",
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1",
      "4:3",
      "3:4",
      "auto"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 1.4,
      "basis": "$1.40 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/q1/start-end-to-video",
    "name": "Vidu Start End to Video",
    "description": "Vidu Q1 Start-End to Video generates smooth transition 1080p videos between specified start and end images.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Vidu",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "credits",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 點數"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/start-end-to-video",
    "name": "Vidu Start-End to Video",
    "description": "Vidu Start-End to Video generates smooth transition videos between specified start and end images.",
    "imageInputField": "start_image_url",
    "includeDiffusionParams": false,
    "group": "Vidu",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "unsupportedFields": [
      "negative_prompt",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "defaultParams": {}
  },
  {
    "id": "fal-ai/framepack/f1",
    "name": "Framepack F1",
    "description": "Framepack is an efficient Image-to-video model that autoregressively generates videos.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "framepack",
    "aspectRatioEnum": [
      "16:9",
      "9:16"
    ],
    "resolutionEnum": [
      "720p",
      "480p"
    ],
    "unsupportedFields": [
      "duration",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.0333,
      "basis": "$0.0333 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v4/image-to-video",
    "name": "PixVerse V4 Image To Video",
    "description": "Generate high quality video clips from text and image prompts using PixVerse v4",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "8"
      ],
      "default": "5"
    },
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "video segments",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 片段"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/video-01-subject-reference",
    "name": "MiniMax (Hailuo AI) Video 01 Subject Reference",
    "description": "Generate video clips maintaining consistent, realistic facial features and identity across dynamic video content",
    "imageInputField": "subject_reference_image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.5,
      "basis": "$0.50 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/longcat-video/image-to-video/480p",
    "name": "LongCat Video",
    "description": "Generate long videos from images using LongCat Video",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "LongCat Video",
    "requiresPrompt": false,
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "seconds",
      "unitPriceUsd": 0.025,
      "basis": "$0.025 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v4.5/transition",
    "name": "PixVerse V4.5 Transition",
    "description": "Create seamless transition between images using PixVerse v4.5",
    "imageInputField": "first_image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "8"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "video_size"
    ],
    "pricing": {
      "unit": "video segments",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 片段"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v5.6/transition",
    "name": "PixVerse V5.6 Transition",
    "description": "Use the latest pixverse v5.6 model to turn your texts and images into amazing videos.",
    "imageInputField": "first_image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "8",
        "10"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "audioField": "generate_audio_switch",
    "unsupportedFields": [
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.15,
      "basis": "$0.15 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/vidu/reference-to-video",
    "name": "Vidu Reference to Video",
    "description": "Vidu Reference to Video creates videos by using a reference images and combining them with a prompt.",
    "imageInputField": "reference_image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "Vidu",
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "duration",
      "resolution",
      "video_size"
    ],
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/video-01-director/image-to-video",
    "name": "MiniMax (Hailuo AI) Video 01 Director - Image to Video",
    "description": "Generate video clips more accurately with respect to initial image, natural language descriptions, and using camera movement instructions for shot control.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "aspect_ratio",
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "videos",
      "unitPriceUsd": 0.5,
      "basis": "$0.50 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v3.5/image-to-video",
    "name": "PixVerse V3.5 Image To Video",
    "description": "Generate high quality video clips from text and image prompts using PixVerse v3.5",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "8"
      ],
      "default": "5"
    },
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "aspect_ratio",
      "video_size"
    ],
    "pricing": {
      "unit": "video segments",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 片段"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v4.5/image-to-video/fast",
    "name": "PixVerse V4.5 Image To Video Fast",
    "description": "Generate fast high quality video clips from text and image prompts using PixVerse v4.5",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "resolutionEnum": [
      "360p",
      "540p",
      "720p"
    ],
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "video_size"
    ],
    "pricing": {
      "unit": "video segments",
      "unitPriceUsd": 0.1,
      "basis": "$0.10 / 片段"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v4/image-to-video/fast",
    "name": "PixVerse V4 Image To Video Fast",
    "description": "Generate fast high quality video clips from text and image prompts using PixVerse v4",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "resolutionEnum": [
      "360p",
      "540p",
      "720p"
    ],
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "video_size"
    ],
    "pricing": {
      "unit": "video segments",
      "unitPriceUsd": 0.1,
      "basis": "$0.10 / 片段"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v3.5/image-to-video/fast",
    "name": "PixVerse V3.5 Image To Video Fast",
    "description": "Generate high quality video clips from text and image prompts quickly using PixVerse v3.5 Fast",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "resolutionEnum": [
      "360p",
      "540p",
      "720p"
    ],
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "video_size"
    ],
    "pricing": {
      "unit": "video segments",
      "unitPriceUsd": 0.1,
      "basis": "$0.10 / 片段"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v3.5/transition",
    "name": "PixVerse V3.5 Transition",
    "description": "Create seamless transition between images using PixVerse v3.5",
    "imageInputField": "first_image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
    "endImageField": "end_image_url",
    "requiresEndImage": true,
    "durationSpec": {
      "type": "string",
      "enum": [
        "5",
        "8"
      ],
      "default": "5"
    },
    "aspectRatioEnum": [
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "360p",
      "540p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
      "video_size"
    ],
    "pricing": {
      "unit": "video segments",
      "unitPriceUsd": 0.05,
      "basis": "$0.05 / 片段"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltx-2.3-quality/ingredient",
    "name": "Ltx 2.3 Quality",
    "description": "Generate high-quality video with audio from reference, character sheet, storyboard using LTX-2.3",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "resolutionEnum": [
      "auto",
      "square_hd",
      "square",
      "portrait_4_3",
      "portrait_16_9",
      "landscape_4_3",
      "landscape_16_9"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
      "video_size"
    ],
    "pricing": {
      "unit": "megapixels",
      "unitPriceUsd": 0.0024075,
      "basis": "$0.00241 / MP"
    },
    "defaultParams": {}
  },
  {
    "id": "bytedance/seedance-2.5/flash/image-to-video",
    "name": "Seedance 2.5 Flash Image to Video",
    "description": "Dreamina Seedance 2.5 Flash is the fast tier of Seedance 2.5. It animates a still image into a 4 to 30 second clip with native audio at 480p or 720p, with optional end-frame control.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "requiresPrompt": false,
    "endImageField": "end_image_url",
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto"
    ],
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "seed",
      "video_size"
    ],
    "pricing": {
      "unit": "1000 tokens",
      "unitPriceUsd": 0.014,
      "basis": "$0.014 / 1K tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "bytedance/seedance-2.5/flash/reference-to-video",
    "name": "Seedance 2.5 Flash Reference to Video",
    "description": "Dreamina Seedance 2.5 Flash is the fast tier of Seedance 2.5. It generates, edits and extends video from up to 10 images, 5 videos and 5 audio references at 480p or 720p.",
    "imageInputField": "image_urls",
    "isArrayImageInput": true,
    "includeDiffusionParams": false,
    "group": "ByteDance Seedance",
    "requiresPrompt": false,
    "durationSpec": {
      "type": "string",
      "enum": [
        "auto",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30"
      ],
      "default": "auto"
    },
    "aspectRatioEnum": [
      "auto",
      "21:9",
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16"
    ],
    "resolutionEnum": [
      "480p",
      "720p"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "negative_prompt",
      "video_size"
    ],
    "pricing": {
      "unit": "1000 tokens",
      "unitPriceUsd": 0.014,
      "basis": "$0.014 / 1K tokens"
    },
    "defaultParams": {}
  }
]
