# Phase 1：Electron 應用程式基底與專案架構 (`01_APP_FOUNDATION.md`)

> **使用方式**：將本檔案完整內容複製或指定給 AI 執行，建立具備型別安全、IPC 通訊基底與本地檔案操作能力的 Electron 專案骨架。

---

## 提示詞內容 (Prompt)

```markdown
# Role
你是一位精通 Electron、React 18、TypeScript 與桌面端安全架構的資深全端工程師。

# Goal
我們正在開發一款名為 **Wishful AI Draw** 的桌面應用程式，功能是連結 `fal.ai` API，支援使用者批量匯入本地圖片並批量透過 AI 模型生成新圖片。
本階段（Phase 1）的目標是：**建立完整、可運行的 Electron + Vite + React + TypeScript 應用程式基底、共用型別系統、IPC 安全通訊橋樑，以及本地檔案與設定管理模組。**

# Technical Requirements

## 1. 專案初始化與目錄結構
請使用 `electron-vite` (搭配 React + TypeScript + Tailwind CSS) 初始化專案，並建立以下嚴謹的目錄結構：

```text
Wishful_Ai_Draw/
├── src/
│   ├── main/                 # Electron 主程序 (Node.js 環境)
│   │   ├── index.ts          # 視窗初始化與生命週期管理
│   │   ├── ipc/              # IPC Handlers 模組化目錄
│   │   │   ├── config.ipc.ts # API Key 與偏好設定讀寫
│   │   │   ├── file.ipc.ts   # 本地檔案選取、資料夾掃描、圖片儲存
│   │   │   └── batch.ipc.ts  # 批量任務控制通道 (Phase 1 先建骨架)
│   │   └── services/
│   │       └── store.ts      # 使用 electron-store + safeStorage 管理設定
│   ├── preload/              # Preload 腳本 (Context Bridge)
│   │   ├── index.ts          # 透過 contextBridge.exposeInMainWorld('electronAPI', ...) 暴露安全 API
│   │   └── index.d.ts        # Window.electronAPI 全域型別宣告
│   ├── shared/               # Main、Preload、Renderer 共用的型別與常數
│   │   ├── types.ts          # 核心資料結構 (BatchTask, AppConfig, FalModelConfig 等)
│   │   └── ipc-channels.ts   # 集中定義 IPC Channel 名稱常數，禁止硬編碼字串
│   └── renderer/             # React 前端介面
│       └── src/
│           ├── App.tsx       # 基礎測試頁，驗證 IPC 通訊與設定讀寫正常
│           └── main.tsx
├── package.json
├── electron.vite.config.ts
└── tsconfig.json
```

## 2. 共用型別定義 (`src/shared/types.ts`)
請定義完整的 TypeScript 介面，作為後續階段的標準契約：
- `TaskStatus`: `'idle' | 'uploading' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'`
- `BatchItem`:
  - `id: string` (UUID)
  - `sourceFilePath: string` (本地輸入圖片絕對路徑)
  - `sourceFileName: string`
  - `sourcePreviewUrl?: string` (本地安全協定 URL 或 Base64 縮圖)
  - `customPrompt?: string` (單張圖片專屬微調提示詞，可覆蓋全域 Prompt)
  - `status: TaskStatus`
  - `progress: number` (0 ~ 100)
  - `remoteInputUrl?: string` (上傳至 fal.storage 後的 URL)
  - `outputImageUrl?: string` (fal.ai 回傳的生成圖片 URL)
  - `savedFilePath?: string` (自動下載儲存至本地的完整路徑)
  - `errorMessage?: string`
  - `startedAt?: number`
  - `completedAt?: number`
- `FalModelPreset`:
  - `id: string` (例如 `'fal-ai/flux/dev/image-to-image'`, `'fal-ai/flux-pro/kontext'`, `'fal-ai/creative-upscaler'`)
  - `name: string`
  - `description: string`
  - `imageInputField: string` (不同模型接收圖片的欄位名稱，例如 `'image_url'`)
  - `defaultParams: Record<string, unknown>` (如 `strength`, `num_inference_steps`, `guidance_scale`)
- `AppSettings`:
  - `falApiKey: string` (在前端顯示時需支援遮罩或狀態檢查)
  - `outputDirectory: string` (預設輸出資料夾路徑)
  - `concurrency: number` (最大同時請求數量，預設 2，範圍 1~10)
  - `autoSaveOutput: boolean` (生成完成後自動下載至本地)
  - `namingPattern: string` (例如 `'{original_name}_ai_{timestamp}'`)

## 3. 本地圖片安全協定與檔案操作 (`src/main/ipc/file.ipc.ts`)
- 註冊自訂安全協定（例如 `local-media://` 使用 `protocol.handle` 與 `net.fetch`），讓 Renderer 可以直接且高效地在 `<img>` 標籤顯示本地高解析度圖片，而無需關閉 `webSecurity`。
- 實作以下 IPC 方法：
  - `selectImages()`: 開啟原生檔案選擇器，支援多選圖片 (`png`, `jpg`, `jpeg`, `webp`)。
  - `selectFolderToImport()`: 選擇一個資料夾，自動掃描裡面所有支援格式的圖片並回傳檔案清單。
  - `selectOutputDirectory()`: 選擇生成結果儲存的目標資料夾。
  - `openFolderInExplorer(path: string)`: 使用 `shell.showItemInFolder` 或 `shell.openPath` 在 Finder / 檔案總管開啟輸出目錄。

## 4. API Key 安全儲存 (`src/main/services/store.ts`)
- 整合 Electron 原生 `safeStorage`（若系統支援）或 `electron-store` 來安全儲存 `falApiKey`。
- 提供 IPC 方法：`getSettings()`, `updateSettings(partialSettings)`, `verifyApiKeyFormat(key)`。

## 5. Electron 安全規範
- BrowserWindow 必須設定 `contextIsolation: true`、`nodeIntegration: false`、`sandbox: false`（若 Preload 需載入型別橋接）。
- 所有主程序功能必須透過 `src/preload/index.ts` 的 `window.electronAPI` 暴露，並確保 TypeScript 具備完整的自動補全提示。

# Deliverables & Verification
請實作上述所有檔案，安裝所需依賴，並執行型別檢查 (`npm run typecheck` 或 `tsc --noEmit`) 與建置測試 (`npm run build`)，確保零錯誤。
```

---

## 階段一驗收標準 (Acceptance Criteria)

- [ ] 執行 `npm run dev` 能順利開啟 Electron 桌面視窗，且無 Console 報錯。
- [ ] `src/shared/types.ts` 與 `src/preload/index.d.ts` 型別完整，`npm run typecheck` 通過。
- [ ] 點擊測試按鈕可開啟系統原生檔案選擇器選取多張圖片，並透過 `local-media://` 協定在畫面上顯示預覽圖。
- [ ] 輸入 `fal.ai` API Key 與選擇輸出資料夾後，重啟應用程式仍能正確讀取設定。

