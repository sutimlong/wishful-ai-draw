export const IPC_CHANNELS = {
  CONFIG_GET: 'config:get',
  CONFIG_UPDATE: 'config:update',
  CONFIG_VERIFY_KEY: 'config:verify-key',

  FILE_SELECT_IMAGES: 'file:select-images',
  FILE_SELECT_FOLDER: 'file:select-folder',
  FILE_SCAN_PATHS: 'file:scan-paths',
  FILE_SELECT_OUTPUT_DIR: 'file:select-output-dir',
  FILE_OPEN_PATH: 'file:open-path',

  BATCH_START: 'batch:start',
  BATCH_PAUSE: 'batch:pause',
  BATCH_RESUME: 'batch:resume',
  BATCH_CANCEL_ITEM: 'batch:cancel-item',
  BATCH_CANCEL_ALL: 'batch:cancel-all',
  BATCH_SET_CONCURRENCY: 'batch:set-concurrency',

  EVENT_BATCH_ITEM_UPDATED: 'batch:item-updated',
  EVENT_BATCH_QUEUE_STATUS: 'batch:queue-status',

  VIDEO_SELECT_FILE: 'video:select-file',
  VIDEO_EXTRACT_FRAMES: 'video:extractFrames',
  EVENT_VIDEO_PROGRESS: 'video:progress'
} as const

