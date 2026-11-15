/**
 * 此檔案由 scripts/sync-fal-text-to-video.mjs 自動產生，請勿手動修改！
 * 若需重新從 fal.ai 同步最新文生影片模型與牌價，請執行：
 *   npm run sync:fal-text-to-video
 *
 * 產生時間：2026-11-15T17:18:12.129Z
 * 收錄模型數：84
 */

import { FalModelPreset } from './types'

export const FAL_TEXT_TO_VIDEO_CATALOG: FalModelPreset[] = [
  {
    "id": "minimax/h3-max/text-to-video",
    "name": "MiniMax H3 Max Text to Video",
    "description": "fal's H3 Max is a post-trained variant of MiniMax H3, tuned for stronger prompt adherence and better aesthetics while co-optimized with our custom inference stack for higher throughput with no compromises on output quality",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "durationSpec": {
      "type": "number",
      "min": 0.92,
      "max": 15,
      "default": 5
    },
    "aspectRatioEnum": [
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
    "id": "minimax/h3-max-turbo/text-to-video",
    "name": "H3 Max Turbo Text to Video",
    "description": "fal's H3 Max Turbo is a post-trained variant of MiniMax H3, tuned for stronger prompt adherence and better aesthetics while co-optimized with our custom inference stack for higher throughput with no compromises on output quality",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "durationSpec": {
      "type": "number",
      "min": 0.92,
      "max": 15,
      "default": 5
    },
    "aspectRatioEnum": [
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
      "unitPriceUsd": 0.025,
      "basis": "$0.025 / 秒"
    },
    "defaultParams": {
      "prompt_expansion_mode": "balanced"
    }
  },
  {
    "id": "blackforestlabs/flux-3-max/text-to-video",
    "name": "FLUX 3 Max Text to Video",
    "description": "fal’s FLUX 3 Max is a post-trained variant of FLUX 3 Video, tuned for stronger prompt adherence and better visual quality while optimized for lower latency.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Black Forest Labs",
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
    "id": "fal-ai/kling-video/v3/pro/text-to-video",
    "name": "Kling Video v3 Text to Video [Pro]",
    "description": "Kling 3.0 Pro: Top-tier text-to-video with cinematic visuals, fluid motion, and native audio generation, with multi-shot support.",
    "imageInputField": "image_url",
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
    "id": "bytedance/seedance-2.5/us/text-to-video",
    "name": "Seedance 2.5 US Text to Video",
    "description": "US-hosted ByteDance Seedance 2.5 generates cinematic video from text with synchronized audio, up to 30-second duration, and 480p, 720p or 1080p output.",
    "imageInputField": "image_url",
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
    "id": "alibaba/wan-3.0/text-to-video",
    "name": "Wan Text to Video",
    "description": "Wan 3.0 is the latest generation AI video model, delivering enhanced motion smoothness, superior scene fidelity, and greater visual coherence.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
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
    "id": "kling/v4/text-to-video",
    "name": "Kling 4.0 Text to Video",
    "description": "Kling 4.0 generates videos from text prompts at 720p or 1080p, with durations from 3 to 30 seconds and support for per-shot prompts.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 30,
      "default": 5
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1",
      "21:9"
    ],
    "resolutionEnum": [
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
      "unitPriceUsd": 0.157,
      "basis": "$0.157 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kling-video/v2.5-turbo/pro/text-to-video",
    "name": "Kling v2.5 Text to Video",
    "description": "Kling 2.5 Turbo Pro: Top-tier text-to-video generation with unparalleled motion fluidity, cinematic visuals, and exceptional prompt precision.",
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
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "unsupportedFields": [
      "seed",
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
    "id": "fal-ai/kling-video/v3/standard/text-to-video",
    "name": "Kling Video v3 Text to Video [Standard]",
    "description": "Kling 3.0 Standard: Top-tier text-to-video with cinematic visuals, fluid motion, and native audio generation, with multi-shot support.",
    "imageInputField": "image_url",
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
    "id": "minimax/h3/text-to-video",
    "name": "MiniMax H3 Text to Video",
    "description": "MiniMax H3 is a frontier video model. This endpoint generates video from a text prompt alone, rendering at 2K in durations from 5 to 15 seconds across seven aspect ratios.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "MiniMax Hailuo",
    "durationSpec": {
      "type": "number",
      "min": 5,
      "max": 15,
      "default": 5
    },
    "aspectRatioEnum": [
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
    "id": "google/gemini-omni-flash/v1.2/text-to-video",
    "name": "Gemini Omni Flash 1.2 Text to Video",
    "description": "Gemini Omni Flash 1.2 is Google's multimodal video model. This endpoint generates video with synchronized native audio from a text prompt, at 360p, 720p, 1080p, or 4K, in 16:9 or 9:16, with durations from 3 to 15 seconds.",
    "imageInputField": "image_url",
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
    "id": "bytedance/seedance-2.0/fast/text-to-video",
    "name": "Seedance 2.0 Fast Text to Video",
    "description": "ByteDance's most advanced text-to-video model, fast tier. Lower latency and cost with cinematic output, native audio, multi-shot editing, and director-level camera control.",
    "imageInputField": "image_url",
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
    "id": "google/gemini-omni-flash/v1.1/text-to-video",
    "name": "Gemini Omni Flash 1.1 Text to Video",
    "description": "Gemini Omni Flash 1.1 is Google's multimodal video model. This endpoint generates video with synchronized native audio from a text prompt, grounded in Gemini's real-world knowledge and physics understanding, with cinematic camera control expressed in natural language.",
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
    "id": "alibaba/wan-3.0-prime/text-to-video",
    "name": "Wan 3.0 Prime",
    "description": "Wan 3.0 Prime Text-to-Video transforms written prompts into polished videos with accelerated generation, fluid motion, strong scene fidelity, and coherent visual storytelling. Built for fast creative iteration, it brings complex ideas to life while preserving visual detail and cinematic consistency throughout each shot.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Alibaba Wan",
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
    "id": "xai/grok-imagine-video/text-to-video",
    "name": "Grok Imagine Video",
    "description": "Generate videos with audio from text using Grok Imagine Video.",
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
    "id": "fal-ai/kling-video/v2.6/pro/text-to-video",
    "name": "Kling Video v2.6 Text to Video",
    "description": "Kling 2.6 Pro: Top-tier text-to-video with cinematic visuals, fluid motion, and native audio generation.",
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
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "seed",
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
    "id": "fal-ai/pixverse/v6/text-to-video",
    "name": "PixVerse V6 Text To Video",
    "description": "Pixverse's latest v6 Model.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
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
    "id": "heygen/heygen-video/text-to-video",
    "name": "HeyGen Video Text to Video",
    "description": "HeyGen Video, built on MiniMax H3 and post-trained by HeyGen, turns a prompt into a 5 to 15 second clip with its own sound.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "HeyGen",
    "durationSpec": {
      "type": "number",
      "min": 5,
      "max": 15,
      "default": 5
    },
    "aspectRatioEnum": [
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
    "id": "blackforestlabs/flux-3/text-to-video",
    "name": "Flux 3 Text to Video",
    "description": "FLUX 3 is Black Forest Labs' frontier video model. This endpoint generates video directly from a text prompt, translating a written description into motion, composition, and scene.",
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
    "id": "xai/grok-imagine-video/v1.5/text-to-video",
    "name": "Grok Imagine Video 1.5 Text to Video",
    "description": "Generate videos from prompts with audio using xAI's Grok Imagine 1.5 Video model.",
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
      "unitPriceUsd": 0.01,
      "basis": "$0.01 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "bytedance/seedance-2.0/mini/text-to-video",
    "name": "Seedance 2.0 Mini Text to Video",
    "description": "Seedance 2.0 Mini is a faster version of Seedance 2.0 that brings great performance and high generation speed at a lower cost.",
    "imageInputField": "image_url",
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
    "id": "xai/grok-imagine-video/v1.5/lite/text-to-video",
    "name": "Grok Imagine Video 1.5 Lite Text to Video",
    "description": "Generate videos from text prompts using xAI's Grok Imagine Video 1.5 Lite model.",
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
      "720p",
      "1080p"
    ],
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
    "id": "kling/v4/flash/text-to-video",
    "name": "Kling 4.0 Flash Text to Video",
    "description": "Kling 4.0 Flash generates videos from text prompts at 720p, with durations from 3 to 20 seconds and configurable aspect ratios.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Kuaishou Kling",
    "durationSpec": {
      "type": "number",
      "min": 3,
      "max": 20,
      "default": 5
    },
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1",
      "21:9"
    ],
    "resolutionEnum": [
      "720p"
    ],
    "unsupportedFields": [
      "negative_prompt",
      "seed",
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
    "id": "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video",
    "name": "Bytedance Seedance V1 Pro Fast Text To Video",
    "description": "Text to Video endpoint for Seedance 1.0 Pro Fast, a next-generation video model designed to deliver maximum performance at minimal cost",
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
      "unit": "1m tokens",
      "unitPriceUsd": 1,
      "basis": "$1.00 / 1M tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltx-2.3/text-to-video/fast",
    "name": "LTX 2.3 Video Fast",
    "description": "LTX-2.3 is a high-quality, fast AI video model available in Pro and Fast variants for text-to-video, image-to-video, and audio-to-video.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
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
    "id": "fal-ai/kling-video/o3/standard/text-to-video",
    "name": "Kling O3 Text to Video [Standard]",
    "description": "Generate realistic videos using Kling O3 from Kling Team!",
    "imageInputField": "image_url",
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
    "id": "fal-ai/kling-video/o3/pro/text-to-video",
    "name": "Kling O3 Text to Video [Pro]",
    "description": "Generate realistic videos using Kling O3 from Kling Team!",
    "imageInputField": "image_url",
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
    "id": "google/gemini-omni-flash",
    "name": "Gemini Omni Flash",
    "description": "Creates video with synchronized audio from text input. Grounded in Gemini's real-world knowledge, with improved physics understanding for more coherent motion and interaction.",
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
    "id": "fal-ai/minimax/hailuo-02/standard/text-to-video",
    "name": "MiniMax Hailuo 02 [Standard] (Text to Video)",
    "description": "MiniMax Hailuo-02 Text To Video API (Standard, 768p): Advanced video generation model with 768p resolution",
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
      "unitPriceUsd": 0.045,
      "basis": "$0.045 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "lightricks/ltx-2.5/text-to-video/fast",
    "name": "Ltx 2.5 Text to Video Fast",
    "description": "LTX-2.5 is Lightricks' open-source audio-video model. This endpoint generates synchronized video and audio from a text prompt in a single pass, in a speed-optimized mode built for rapid iteration and previews.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
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
    "id": "creatify/boreal",
    "name": "Boreal",
    "description": "Create product, UGC, and presenter videos with synchronized native audio from text, with optional image and audio inputs.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Creatify AI",
    "durationSpec": {
      "type": "number",
      "min": 1,
      "max": 20,
      "default": 10
    },
    "aspectRatioEnum": [
      "auto",
      "16:9",
      "9:16",
      "1:1",
      "4:3",
      "3:4"
    ],
    "resolutionEnum": [
      "720p",
      "1080p",
      "2k"
    ],
    "referenceImageField": "image_url",
    "unsupportedFields": [
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
    "id": "fal-ai/wan-25-preview/text-to-video",
    "name": "Wan 2.5 Text to Video",
    "description": "Wan 2.5 text-to-video model.",
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
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "resolutionEnum": [
      "480p",
      "720p",
      "1080p"
    ],
    "unsupportedFields": [
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
    "id": "fal-ai/wan/v2.7/text-to-video",
    "name": "Wan Text to Video",
    "description": "Wan 2.7 is the latest generation AI video model, delivering enhanced motion smoothness, superior scene fidelity, and greater visual coherence.",
    "imageInputField": "image_url",
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
    "id": "fal-ai/bytedance/seedance/v1/pro/text-to-video",
    "name": "Seedance 1.0 Pro",
    "description": "Seedance 1.0 Pro, a high quality video generation model developed by Bytedance.",
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
      "unit": "1m tokens",
      "unitPriceUsd": 2.5,
      "basis": "$2.50 / 1M tokens"
    },
    "defaultParams": {}
  },
  {
    "id": "lightricks/ltx-2.5/text-to-video/pro",
    "name": "Ltx 2.5 Text to Video Fast",
    "description": "LTX-2.5 is Lightricks' open-source audio-video model. This endpoint generates synchronized video and audio from a text prompt in a single pass, in a quality-optimized mode for final, high-fidelity output.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
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
    "id": "fal-ai/kling-video/v3/turbo/standard/text-to-video",
    "name": "Kling Video V3 Standard Turbo Text to Video",
    "description": "Kling 3.0 Turbo Standard is a fast, cost-efficient video generation model that turns text prompts directly into 720P video with native audio, optimized for rapid iteration and high-volume production",
    "imageInputField": "image_url",
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
    "id": "fal-ai/ltx-2.3/text-to-video",
    "name": "LTX Video 2.3 Pro",
    "description": "LTX-2.3 is a high-quality, fast AI video model available in Pro and Fast variants for text-to-video, image-to-video, and audio-to-video.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
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
    "id": "wan/v2.6/text-to-video",
    "name": "Wan v2.6 Text to Video",
    "description": "Wan 2.6 text-to-video model.",
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
    "id": "fal-ai/minimax/hailuo-2.3/standard/text-to-video",
    "name": "MiniMax Hailuo 2.3 [Standard] (Text to Video)",
    "description": "MiniMax Hailuo-2.3 Text To Video API (Standard, 768p): Advanced text-to-video generation model with 768p resolution",
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
    "id": "fal-ai/kling-video/v3/turbo/pro/text-to-video",
    "name": "Kling Video V3 Turbo Pro Text to Video",
    "description": "Generate high quality 1080p videos using Kling's Turbo 3.0 model, with improved lipsync and multishot generation capabilities.",
    "imageInputField": "image_url",
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
    "id": "fal-ai/kling-video/v3/4k/text-to-video",
    "name": "Kling Video V3 Text to Video 4K",
    "description": "Kling's Native 4K is a video generation model that directly outputs professional-grade 4K video in one step, eliminating the need for post-production upscaling",
    "imageInputField": "image_url",
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
    "id": "alibaba/happy-horse/v1.1/text-to-video",
    "name": "Happy Horse 1.1 Text to Video",
    "description": "Happy Horse 1.1 is Alibaba's #1-ranked video model. This text-to-video endpoint generates 1080p video with synchronized native audio and multilingual lip-sync from a text prompt alone.",
    "imageInputField": "image_url",
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
    "id": "pixverse/v6/max/text-to-video",
    "name": "PixVerse V6 Max Text To Video",
    "description": "Generate videos from text with PixVerse V6 Max, with optional audio and multi-clip generation.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
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
      "unitPriceUsd": 0.009,
      "basis": "$0.009 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltx-video",
    "name": "LTX Video (preview)",
    "description": "Generate videos from prompts using LTX Video 0.9.1",
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
    "id": "luma/agent/ray/v3.2/text-to-video",
    "name": "Luma Ray 3.2 Text to Video",
    "description": "Luma Ray 3.2 generates cinematic video from a text prompt, with control over resolution, duration, and seamless looping, plus reference images to lock in subject and style.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Luma Ray",
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
    "id": "fal-ai/pixverse/v5/text-to-video",
    "name": "PixVerse V5 Text To Video",
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
    "id": "alibaba/happy-horse/text-to-video",
    "name": "Happy Horse",
    "description": "Generate 1080p video with synchronized native audio from a text prompt. Aspect ratios: 16:9, 9:16, 1:1, 4:3, 3:4. Duration: 3–15s.",
    "imageInputField": "image_url",
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
    "id": "fal-ai/vidu/q3/text-to-video",
    "name": "Vidu",
    "description": "Vidu's latest Q3 pro models",
    "imageInputField": "image_url",
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
    "id": "blackforestlabs/flux-3/text-to-video/draft",
    "name": "Flux 3 Text To Video Draft",
    "description": "FLUX.3 is Black Forest Labs' frontier audio/video model. Generate fast, low-cost draft previews from a text prompt, with a reusable draft cache for full-quality enhancement.",
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
    "id": "fal-ai/minimax/video-01",
    "name": "MiniMax (Hailuo AI) Video 01",
    "description": "Generate video clips from your prompts using MiniMax model",
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
    "id": "fal-ai/pixverse/c1/text-to-video",
    "name": "PixVerse C1 Text To Video",
    "description": "Generate film-grade videos from text prompts with native audio, up to 1080p and 15 seconds, using PixVerse C1.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
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
    "id": "fal-ai/pixverse/v5.5/text-to-video",
    "name": "PixVerse V5.5 Text To Video",
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
    "id": "fal-ai/ltx-video-13b-distilled",
    "name": "LTX Video-0.9.7 13B Distilled",
    "description": "Generate videos from prompts using LTX Video-0.9.7 13B Distilled and custom LoRA",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "aspectRatioEnum": [
      "9:16",
      "1:1",
      "16:9"
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
      "unit": "videos",
      "unitPriceUsd": 0.04,
      "basis": "$0.04 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/hailuo-02/pro/text-to-video",
    "name": "MiniMax Hailuo 02 [Pro] (Text to Video)",
    "description": "MiniMax Hailuo-02 Text To Video API (Pro, 1080p): Advanced video generation model with 1080p resolution",
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
      "unit": "seconds",
      "unitPriceUsd": 0.08,
      "basis": "$0.08 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v4.5/text-to-video",
    "name": "PixVerse V4.5 Text To Video",
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
    "id": "fal-ai/minimax/hailuo-2.3/pro/text-to-video",
    "name": "MiniMax Hailuo 2.3 [Pro] (Text to Video)",
    "description": "MiniMax Hailuo-2.3 Text To Video API (Pro, 1080p): Advanced text-to-video generation model with 1080p resolution",
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
    "id": "bytedance/seedance-2.0/us/text-to-video",
    "name": "Seedance 2.0 US Text to Video",
    "description": "US hosted version of ByteDance's most advanced text-to-video model. Cinematic output with native audio, multi-shot editing, real-world physics, and director-level camera control.",
    "imageInputField": "image_url",
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
    "id": "fal-ai/kling-video/o3/4k/text-to-video",
    "name": "Kling Video",
    "description": "Kling's Native 4K is a video generation model that directly outputs professional-grade 4K video in one step, eliminating the need for post-production upscaling",
    "imageInputField": "image_url",
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
    "id": "fal-ai/vidu/q3/text-to-video/turbo",
    "name": "Vidu",
    "description": "Vidu's Q3 Turbo Model.",
    "imageInputField": "image_url",
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
      "unitPriceUsd": 0.035,
      "basis": "$0.035 / 部"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/minimax/video-01-live",
    "name": "MiniMax (Hailuo AI) Video 01 Live",
    "description": "Generate video clips from your prompts using MiniMax model",
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
    "id": "fal-ai/ltx-2.3-22b/distilled/text-to-video",
    "name": "LTX-2.3 22B Distilled",
    "description": "Generate video with audio from text using LTX-2.3 Distilled",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "videoSizeEnum": [
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
    "id": "fal-ai/longcat-video/distilled/text-to-video/720p",
    "name": "LongCat Video Distilled",
    "description": "Generate long videos in 720p/30fps from text using LongCat Video Distilled",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "LongCat Video",
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
      "unit": "seconds",
      "unitPriceUsd": 0.01,
      "basis": "$0.01 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/heygen/avatar5/digital-twin",
    "name": "Heygen v5 Digital Twin",
    "description": "Create natural HeyGen Avatar V digital twin videos from text or audio, with lip-sync, optional backgrounds, captions, and MP4/WebM output.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "HeyGen",
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "4:5",
      "5:4",
      "1:1",
      "auto"
    ],
    "resolutionEnum": [
      "720p",
      "1080p",
      "4k"
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
    "id": "fal-ai/longcat-video/distilled/text-to-video/480p",
    "name": "LongCat Video Distilled",
    "description": "Generate long videos from text using LongCat Video Distilled",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "LongCat Video",
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
      "unit": "seconds",
      "unitPriceUsd": 0.005,
      "basis": "$0.005 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ltx-2.3-quality/text-to-video",
    "name": "Ltx 2.3 Quality",
    "description": "Generate high-quality video with audio from text using LTX-2.3",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "resolutionEnum": [
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
    "id": "fal-ai/ltxv-13b-098-distilled",
    "name": "LTX-Video 13B 0.9.8 Distilled",
    "description": "Generate long videos from prompts using LTX Video-0.9.8 13B Distilled and custom LoRA",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "aspectRatioEnum": [
      "9:16",
      "1:1",
      "16:9"
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
    "id": "fal-ai/ltx-2.3-22b/text-to-video",
    "name": "LTX-2.3 22B",
    "description": "Generate video with audio from text using LTX-2.3",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Lightricks LTX",
    "videoSizeEnum": [
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
    "id": "fal-ai/vidu/q2/text-to-video",
    "name": "Vidu",
    "description": "Use the latest Vidu Q2 models which much more better quality and control on your videos.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Vidu",
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
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "resolutionEnum": [
      "360p",
      "520p",
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
    "id": "fal-ai/pixverse/v5.6/text-to-video",
    "name": "PixVerse V5.6 Text To Video",
    "description": "Use the latest pixverse v5.6 model to turn your texts into amazing videos.",
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
    "id": "fal-ai/heygen/v3/video-agent",
    "name": "Heygen Video Agent",
    "description": "Generate videos with a single prompt. Describe what you want in plain text, and the agent handles avatar selection, scripting, scene composition - all in one.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "HeyGen",
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
      "unitPriceUsd": 0.034,
      "basis": "$0.034 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/kandinsky6-pro/text-to-video",
    "name": "Kandinsky 6.0 Pro",
    "description": "Kandinsky 6.0 Pro is Kandinsky Lab's flagship text-to-video model, generating high-resolution clips with cinematic motion and precise prompt adherence.",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Kandinsky",
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1",
      "4:3",
      "3:4"
    ],
    "audioField": "generate_audio",
    "unsupportedFields": [
      "duration",
      "resolution",
      "video_size"
    ],
    "pricing": {
      "unit": "units",
      "unitPriceUsd": 1.35,
      "basis": "$1.35 / 計費單位"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/ovi",
    "name": "Ovi Text to Video",
    "description": "A unified paradigm for audio-video generation",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "Ovi",
    "resolutionEnum": [
      "512x992",
      "992x512",
      "960x512",
      "512x960",
      "720x720",
      "448x1120",
      "1120x448"
    ],
    "unsupportedFields": [
      "aspect_ratio",
      "duration",
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
    "id": "fal-ai/longcat-video/text-to-video/720p",
    "name": "LongCat Video",
    "description": "Generate long videos in 720p/30fps from text using LongCat Video",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "LongCat Video",
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "unsupportedFields": [
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
    "id": "fal-ai/vidu/q1/text-to-video",
    "name": "Vidu Text to Video",
    "description": "Vidu Q1 Text to Video generates high-quality 1080p videos with exceptional visual quality and motion diversity",
    "imageInputField": "image_url",
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
    "id": "fal-ai/longcat-video/text-to-video/480p",
    "name": "LongCat Video",
    "description": "Generate long videos from text using LongCat Video",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "LongCat Video",
    "aspectRatioEnum": [
      "16:9",
      "9:16",
      "1:1"
    ],
    "unsupportedFields": [
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
    "id": "fal-ai/minimax/video-01-director",
    "name": "MiniMax (Hailuo AI) Video 01 Director",
    "description": "Generate video clips more accurately with respect to natural language descriptions and using camera movement instructions for shot control.",
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
    "id": "fal-ai/pixverse/v4/text-to-video",
    "name": "PixVerse V4 Text To Video",
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
    "id": "fal-ai/heygen/v2/video-agent",
    "name": "Heygen",
    "description": "Heygen Text to Video Generation Model",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "HeyGen",
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
      "unitPriceUsd": 0.034,
      "basis": "$0.034 / 秒"
    },
    "defaultParams": {}
  },
  {
    "id": "fal-ai/pixverse/v3.5/text-to-video",
    "name": "PixVerse V3.5 Text To Video",
    "description": "Generate high quality video clips from text prompts using PixVerse v3.5",
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
    "id": "moonvalley/marey/t2v",
    "name": "Marey Realism V1.5",
    "description": "Generate a video from a text prompt with Marey, a generative video model trained exclusively on fully licensed data.",
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
    "id": "fal-ai/pixverse/v4.5/text-to-video/fast",
    "name": "PixVerse V4.5 Text To Video Fast",
    "description": "Generate high quality and fast video clips from text and image prompts using PixVerse v4.5 fast",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
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
      "720p"
    ],
    "unsupportedFields": [
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
    "id": "fal-ai/pixverse/v3.5/text-to-video/fast",
    "name": "PixVerse V3.5 Text To Video Fast",
    "description": "Generate high quality video clips quickly from text prompts using PixVerse v3.5 Fast",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
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
      "720p"
    ],
    "unsupportedFields": [
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
    "id": "fal-ai/pixverse/v4/text-to-video/fast",
    "name": "PixVerse V4 Text To Video Fast",
    "description": "Generate high quality and fast video clips from text and image prompts using PixVerse v4 fast",
    "imageInputField": "image_url",
    "includeDiffusionParams": false,
    "group": "PixVerse",
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
      "720p"
    ],
    "unsupportedFields": [
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
    "id": "bytedance/seedance-2.5/flash/text-to-video",
    "name": "Seedance 2.5 Flash Text to Video",
    "description": "Dreamina Seedance 2.5 Flash is the fast tier of Seedance 2.5. It generates 4 to 30 second video with native audio from a text prompt at 480p or 720p.",
    "imageInputField": "image_url",
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
      "seed",
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
