export const IPC_CHANNELS = {
  CONFIG_GET: 'config:get',
  CONFIG_UPDATE: 'config:update',
  CONFIG_VERIFY_KEY: 'config:verify-key',
  ACCOUNT_BILLING: 'account:billing',
  PROMPT_OPTIMIZE: 'prompt:optimize',
  DEEPSEEK_BALANCE: 'deepseek:balance',

  AUTH_GET_STATE: 'auth:get-state',
  AUTH_START_LOGIN: 'auth:start-login',
  AUTH_LOGIN_WITH_SERIAL: 'auth:login-with-serial',
  AUTH_LOGOUT: 'auth:logout',
  EVENT_AUTH_CHANGED: 'auth:changed',

  FILE_SELECT_IMAGES: 'file:select-images',
  FILE_SELECT_REFERENCE_IMAGE: 'file:select-reference-image',
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

  TEXT_TO_IMAGE_GENERATE: 'text-to-image:generate',
  TEXT_TO_IMAGE_DOWNLOAD: 'text-to-image:download',
  TEXT_TO_IMAGE_LIST_OUTPUTS: 'text-to-image:list-outputs',
  TEXT_TO_IMAGE_COPY_TO_DOWNLOADS: 'text-to-image:copy-to-downloads',
  TEXT_TO_IMAGE_SAVE_AS: 'text-to-image:save-as',

  EVENT_BATCH_ITEM_UPDATED: 'batch:item-updated',
  EVENT_BATCH_QUEUE_STATUS: 'batch:queue-status',

  VIDEO_SELECT_FILE: 'video:select-file',
  VIDEO_EXTRACT_FRAMES: 'video:extractFrames',
  VIDEO_GENERATE_FILMSTRIP: 'video:generateFilmstrip',
  EVENT_VIDEO_PROGRESS: 'video:progress'
} as const

