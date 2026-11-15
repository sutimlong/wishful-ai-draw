# Wishful AI Draw — AI 開發與檔案讀寫導覽 (`AGENTS.md`)

> 本文件專為**第一次讀取此專案的 AI 助手**設計，協助在最短時間內掌握應用程式的架構、核心流程，以及「修改程式碼」與「執行期磁碟 / 雲端 I/O」的正確讀寫位置。

---

## 1. 專案總覽與技術棧

**Wishful AI Draw**（`wishful-ai-draw`）是一個整合 **fal.ai**、**DeepSeek** 與 **Google Workspace** 的 Electron 桌面應用程式，主要提供兩大工作區與影片前處理功能：
- **圖片風格化 (`stylize`)**：批次匯入圖片（或從影片抽幀匯入），透過 React Flow 節點式流程圖與參數面板設定 **fal.ai** 圖生圖與 4 段後處理流程，高並發執行並自動存檔與計費紀錄。
- **文字生成圖片 (`text-to-image`)**：挑選文生圖／參考圖編輯模型（可選單圖或最多 10 張參考圖），生成後自動存檔至專屬「文生圖」資料夾並展示歷史作品。
- **AI 輔助與管理機制**：DeepSeek 提示詞優化與餘額查詢、影片時間軸裁切抽幀（FFmpeg）、Google OAuth (PKCE) 或授權序號登入驗證、以及 Google Sheets 雲端白名單／角色權限／用量審計寫入。

### 技術棧與路徑別名
- **Runtime / UI**：Electron 33、React 18、TypeScript 5、Tailwind CSS 3、Zustand 5、`@xyflow/react`、`lucide-react`
- **Build / Test**：`electron-vite` (`electron.vite.config.ts`)、`electron-builder` (`electron-builder.yml`)、Vitest (`vitest.config.ts`，Node 測試環境)
- **TypeScript / Vite Path Aliases**（見 `electron.vite.config.ts`、`tsconfig.node.json`、`tsconfig.web.json`、`vitest.config.ts`）：
  - `@shared` → `src/shared`（Main / Preload / Renderer / Tests 共用）
  - `@renderer` → `src/renderer/src`（僅 Renderer）

---

## 2. 應用程式是如何運作的（4 層架構與核心流程）

```text
[ Renderer (src/renderer/src) ]  React 18 + Zustand + @xyflow/react
        │  只能透過 window.electronAPI 與 local-media:// 存取系統資源
        ▼
[ Preload (src/preload/index.ts) ]  contextBridge.exposeInMainWorld + webUtils.getPathForFile
        │  透過 src/shared/ipc-channels.ts 定義的 36 個 IPC Channels 通訊
        ▼
[ Main (src/main/) ]  7 組 ipc/*.ipc.ts + 28 支 services/*.ts (fs / safeStorage / ffmpeg / API)
        ▲
[ Shared (src/shared/) ]  型別、IPC 常數、定價估算、角色判定、模型目錄
```

### 啟動與安全邊界 (`src/main/index.ts`)
1. 在 `app.whenReady()` **之前**，先向 Electron 註冊特權自訂協定 `local-media`（`standard`、`secure`、`supportFetchAPI`、`stream`、`bypassCSP`）。
2. 就緒後執行：設定視窗／macOS Dock 圖示 → 註冊 `local-media://` handler (`localMediaProtocol.ts`) → 呼叫 `ensureOutputDirectories()` 建立輸出資料夾 → 註冊 7 組 IPC handlers (`config`, `auth`, `file`, `batch`, `prompt`, `video`, `textToImage`) → 建立主視窗。
3. 視窗安全設定：`contextIsolation: true`、`nodeIntegration: false`、`sandbox: false`。Renderer **不可直接呼叫 Node `fs` 或讀取 `file://`**。

### 登入與雙模式切換流程 (`src/renderer/src/App.tsx`)
1. **Auth Gate**：`App.tsx` 掛載時初始化 `useAuthStore`，讀取本機加密會話並向 Google Sheets 驗證白名單／序號狀態；未登入時顯示 `LoginGate`（支援 Google OAuth 127.0.0.1 loopback + PKCE，或序號綁定登入），登入通過才渲染主畫面。
2. **工作區切換 (`useAppViewStore`)**：透過 `TopBar` 在兩個主頁切換：
   - `stylize`：`SidebarConfig`（模型與參數）+ `BatchWorkspace`（檔案網格與互動式 `WorkflowGraph`）+ `InspectorPanel`（原圖／結果比對）+ `BottomActionBar`（批次控制），可開啟 `VideoTrimmer` 進行影片裁切抽幀。
   - `text-to-image`：`TextToImagePage`（模型搜尋、畫幅／數量設定、參考圖選擇、輸出歷程瀏覽與下載）。
3. **全域設定 (`SettingsModal`)**：管理 `falApiKey`、`deepseekApiKey`、輸出資料夾、並發數（`1..40`）、自動存檔、命名規則、`mockMode` 等。

### 圖生圖批次執行管線 (`src/main/services/batchQueueEngine.ts`)
1. **Phase 1（平行上傳）**：以 `UPLOAD_CONCURRENCY = 10` 先將待處理圖片上傳至 fal storage（搭配 `falService.ts` 的 `uploadCache` 與 `uploadInflight` 去重，重複圖片或重試不重複上傳）。
2. **Phase 2（Worker Pool 推論，並發 `1..40`）**：
   - 主模型呼叫 `fal.subscribe`，網路或暫時性錯誤最多重試 `maxRetries = 2`（1.2s 指數退避；遇 HTTP `400/401/403/404/422`、JSON 錯誤或主動取消則不重試）。
   - **可選 4 段序列後處理**：① 放大 `fal-ai/clarity-upscaler` → ② 去背 `fal-ai/birefnet` → ③ 縮放 `fal-ai/fal-image-resize` → ④ 人臉修復 `fal-ai/codeformer`（任一後處理失敗僅記錄警告並保留前一步驟輸出 URL，不中斷整體成功結果）。
   - 下載或複製（模擬模式）結果圖至輸出資料夾 → 立即寫入 Google Sheets 使用紀錄 → 非同步向 fal.ai 查詢實際／預估費用並回填試算表。
3. **單向推播進度**：透過 `batch:item-updated` 與 `batch:queue-status` 即時更新 Renderer 的 `useBatchStore`。

---

## 3. 要從哪裡「讀取」和「寫入」檔案？（AI 速查地圖）

### Part A：原始碼導覽 — 修改特定功能時要讀／寫哪些程式檔案

| 任務 / 功能領域 | 優先讀取與編輯的檔案 | 注意事項 |
|---|---|---|
| **新增或修改 IPC 通道** | 1. `src/shared/types.ts`<br>2. `src/shared/ipc-channels.ts`<br>3. `src/main/ipc/*.ipc.ts`（新檔須在 `src/main/index.ts` 註冊）<br>4. `src/preload/index.ts`（同步擴充 `window.electronAPI`；`index.d.ts` 自動引入其型別）<br>5. `src/renderer/src/store/*` 或元件 | `ipc-channels.ts` 目前定義 **36** 個通道。 |
| **圖生圖 (Stylize) 模型清單與 Payload** | - 精選與預設模型：`src/shared/types.ts` (`DEFAULT_FAL_PRESETS`, `DEFAULT_FAL_MODEL_ID`)<br>- 組裝規則：`src/main/services/falPayloadBuilder.ts`<br>- 模型價格估算：`src/shared/falPricing.ts`、`src/renderer/src/utils/cost.ts` | **禁止直接編輯 `src/shared/falModelCatalog.ts`**（由 `npm run sync:fal-models` / `scripts/sync-fal-models.mjs` 自動生成，目前含 280 筆同步模型並自動與 `DEFAULT_FAL_PRESETS` 去重合併為 `FAL_MODEL_CATALOG`）。 |
| **文生圖 (Text-to-Image) 模型與流程** | - IPC：`src/main/ipc/textToImage.ipc.ts`<br>- Payload / 執行：`src/main/services/textToImageService.ts`<br>- 對話模式：`src/main/services/textToImageChat.ts`、`textToImageChatImage.ts`<br>- 手動補充模型：`src/shared/falTextToImageExtraModels.ts` (12 筆)<br>- 星號推薦清單：`src/shared/falTextToImageModels.ts` (`STARRED_MODEL_IDS`)<br>- UI：`src/renderer/src/components/TextToImagePage.tsx` | **禁止直接編輯 `src/shared/falTextToImageCatalog.ts`**（由 `npm run sync:fal-text-to-image` / `scripts/sync-fal-text-to-image.mjs` 自動生成 167 筆；`FAL_TEXT_TO_IMAGE_MODELS` 會自動合併目錄 + Extra 共 179 筆）。 |
| **批次佇列、fal 上傳與後處理** | - 佇列排程與重試：`src/main/services/batchQueueEngine.ts`<br>- API 呼叫 / 上傳快取：`src/main/services/falService.ts`<br>- 下載存檔：`src/main/services/imageDownloader.ts`<br>- IPC：`src/main/ipc/batch.ipc.ts` | 後端並發強制經由 `src/shared/concurrency.ts` (`clampConcurrency`) 限制在 `1..40` 之間，預設 `2`。 |
| **本地檔案選取與輸出目錄邏輯** | - 目錄常數與建立：`src/main/services/outputDirectories.ts`<br>- 檔案掃描與對話框：`src/main/ipc/file.ipc.ts`<br>- 設定儲存：`src/main/services/store.ts`<br>- 自訂協定：`src/main/services/localMediaProtocol.ts`、`localFileResponse.ts` | Renderer 拖放檔案需透過 `preload/index.ts` 的 `getPathForFile` (`webUtils.getPathForFile`) 取得真實路徑。 |
| **費用查詢與帳單餘額** | - fal 計費 API：`src/main/services/falCostService.ts`<br>- Config / Billing IPC：`src/main/ipc/config.ipc.ts`<br>- 前端格式與估算：`src/renderer/src/utils/cost.ts`、`src/shared/falPricing.ts` | `falCostService` 查詢 `billing-events` 若收到 HTTP 403 會鎖定 `billingDenied = true`，改走 `pricing/estimate`。 |
| **DeepSeek 提示詞優化與餘額** | - API 服務：`src/main/services/deepSeekService.ts`<br>- IPC：`src/main/ipc/prompt.ipc.ts`<br>- UI：`src/renderer/src/components/DeepSeekBalancePanel.tsx`、`SidebarConfig.tsx` | `chat/completions` timeout 30s；`/user/balance` timeout 8s。 |
| **影片裁切與抽幀 (FFmpeg)** | - Main 抽幀與縮圖條：`src/main/services/videoService.ts`、`src/main/ipc/video.ipc.ts`<br>- Renderer UI / Hook：`src/renderer/src/components/VideoTrimmer.tsx`、`src/renderer/src/components/video/*` (`useVideoEditor.ts`, `VideoPreview.tsx`, `FilmstripTimeline.tsx`, `timeUtils.ts`) | 支援 `.mp4`, `.mov`, `.webm`, `.mkv`, `.avi`, `.m4v`。 |
| **登入驗證、序號、角色與 Google Sheets** | - 憑證讀取：`src/main/services/googleConfig.ts`、`resources/GOOGLE_SETUP.md`<br>- OAuth & Session：`src/main/services/googleAuthService.ts`、`googleOAuthPkce.ts`、`appWindowFocus.ts`、`src/main/ipc/auth.ipc.ts`<br>- 序號：`src/main/services/serialAuth.ts`、`serialKeyService.ts`、`serialSheet.ts`<br>- 白名單與角色：`src/main/services/allowedAccounts.ts`、`userRoleService.ts`、`src/shared/userRole.ts`<br>- 用量紀錄：`src/main/services/googleSheetsService.ts`、`usageLogger.ts`、`usageLoggerWiring.ts`、`taiwanTime.ts`、`sheetRange.ts`<br>- UI：`LoginGate.tsx`、`LoginBackdrop.tsx`、`useAuthStore.ts` | 憑證匯入工具位於 `scripts/import-service-account.cjs`，檢查工具位於 `scripts/check-google-setup.cjs`。 |
| **前端狀態與流程圖節點** | - Stores：`src/renderer/src/store/useBatchStore.ts`、`useAppViewStore.ts`、`useAuthStore.ts`<br>- 流程圖：`src/renderer/src/components/workflow/WorkflowGraph.tsx`、`workflowTypes.ts`、`nodes/*`<br>- 其他主要 UI：`TopBar.tsx`、`SettingsModal.tsx`、`BatchWorkspace.tsx`、`BatchGridCard.tsx`、`BatchItemContextMenu.tsx`、`ContextMenu.tsx`、`InspectorPanel.tsx`、`BottomActionBar.tsx` | 流程圖節點與勾選設定雙向同步至 `useBatchStore`。 |
| **自動化測試** | `tests/*.test.ts`（目前共 41 支測試檔） | 執行 `npm test` (Vitest Node 環境)。 |

---

### Part B：執行期（Runtime）讀寫位置 — 應用程式真正存取哪些本機磁碟與雲端資源

| 資料類別 | 讀取位置（Read From） | 寫入位置（Write To） | 負責人與行為細節 |
|---|---|---|---|
| **應用程式設定** | `<userData>/wishful-settings.json` | `<userData>/wishful-settings.json` | `src/main/services/store.ts`。`falApiKey` / `deepseekApiKey` 透過 Electron `safeStorage` 加密存取；舊版輸出路徑 `<pictures>/Wishful_AI_Output` 會自動遷移至 `<pictures>/Wishful_Ai_Draw`；`mockMode` 僅存記憶體且每次啟動重設為 `false`。 |
| **登入 Session** | `<userData>/google-auth.json`<br>`<userData>/serial-auth.json` | `<userData>/google-auth.json`<br>`<userData>/serial-auth.json` | `src/main/services/googleAuthService.ts`。Google OAuth 與序號登入兩者互斥，皆經 `safeStorage` 加密；登出或驗證失效時清除。 |
| **Google OAuth / 服務帳號憑證** | `process.env.GOOGLE_CREDENTIALS_FILE` 優先，否則依序搜尋 dev 與打包目錄（`app.asar.unpacked`、`process.resourcesPath`）下的 `resources/google-credentials.json` | 執行期**唯讀**；開發時由 `scripts/import-service-account.cjs` 寫入 `resources/google-credentials.json` | `src/main/services/googleConfig.ts`。讀取後會快取於記憶體（測試可用 `resetGoogleCredentialsCache()` 清除）。範本在 `resources/google-credentials.example.json`（正式檔已列於 `.gitignore`）。 |
| **圖片風格化輸入圖** | 使用者透過對話框選取或拖放的本機路徑（`.png`, `.jpg`, `.jpeg`, `.webp`） | 不會修改原圖 | `src/main/ipc/file.ipc.ts`。`collectImagesFromPath` 掃描資料夾時使用 `readdirSync`，**僅讀取單層直接子檔**（略過 `.` 開頭隱藏檔），不遞迴子資料夾。 |
| **圖片風格化輸出圖** | — | 預設 `<pictures>/Wishful_Ai_Draw`（或使用者於該次 `startBatch` 選取覆寫的 `outputDirectory`） | `src/main/services/outputDirectories.ts`、`imageDownloader.ts`、`useBatchStore.ts`。檔名依 `namingPattern`（預設 `'{original_name}_ai_{timestamp}'`）格式化，撞名自動加 `_1`、`_2`。注意：`useBatchStore.startBatch()` 每次啟動新批次皆會先跳出資料夾對話框並強制設 `autoSaveOutput: true`（失敗重試則直接發送 `batch:start` 不重選）。 |
| **文生圖輸出圖與歷程** | 掃描 `<pictures>/Wishful_Ai_Draw/文生圖`（`text-to-image:list-outputs`） | `<pictures>/Wishful_Ai_Draw/文生圖`（`text2img_{timestamp}_{index}`）；另可複製到 `<downloads>` 或「另存新檔」至使用者指定路徑 | `src/main/services/outputDirectories.ts`、`src/main/ipc/textToImage.ipc.ts`。自動建立目錄，頁面載入與每次生成後重新讀取該資料夾按時間新到舊排序。 |
| **影片輸入與抽幀暫存** | 使用者選擇的影片檔（`.mp4`, `.mov`, `.webm`, `.mkv`, `.avi`, `.m4v`） | 縮圖條：`<os.tmpdir()>/wishful-ai-video-filmstrip/<name>_strip_<ts>/`<br>抽幀 PNG：`<os.tmpdir()>/wishful-ai-video-frames/<name>_<ts>/` | `src/main/services/videoService.ts`。使用 `ffmpeg-static` + `fluent-ffmpeg`；打包環境會自動將 `app.asar` 改寫為 `app.asar.unpacked`。抽出後的 PNG 會直接作為 `BatchItem` 加入批次佇列。 |
| **Renderer 顯示本機媒體** | `local-media://image?path=<encodedPath>`（縮圖附加 `&thumb=1`） | 不寫入檔案（OS 原生縮圖於記憶體轉為 360x360 JPEG q82 回傳） | `src/main/services/localMediaProtocol.ts`、`localFileResponse.ts`。完整讀取支援 HTTP `Range` (`206 Partial Content`)，讓 `<video>` 可順暢拖拉時間軸。 |
| **Google Sheets 雲端讀寫**（預設試算表 ID `1Gy8ICS8Cz4YEJVnwWehvcclvLsuSYzfbceiYUlhRKgw`） | - **工作表 3** (`gid=740235806`)：讀 A 欄允許登入 Email、B 欄角色（`管理員` / `一般使用者`）<br>- **工作表 2** (`gid=1195700831`)：讀 A 欄序號比對 | - **工作表 2** (`gid=1195700831`)：序號登入時寫入／更新該列 B–D 欄（名稱、Email、台灣時間 UTC+8）<br>- **工作表 1** (`Sheet1`)：序列化佇列 `queueChain` 追加 `A:J` 10 欄使用紀錄，稍後非同步回填同一列 `H:I`（USD 費用與 `實際`/`預估`） | `allowedAccounts.ts`、`userRoleService.ts`、`serialSheet.ts`、`googleSheetsService.ts`、`usageLogger.ts`、`taiwanTime.ts`。事件類型：`image_generated`、`image_generated_SIM`、`Prompt word_optimization`。 |
| **外部 AI APIs** | `api.fal.ai/v1`（`billing-events`、`pricing/estimate`、`account/billing?expand=credits`）；`api.deepseek.com/user/balance` | 上傳原圖與呼叫 `fal.subscribe`；呼叫 `api.deepseek.com/chat/completions` (`deepseek-chat`) | `falService.ts`、`falCostService.ts`、`textToImageService.ts`、`deepSeekService.ts`。 |

---

## 4. 關鍵開發規範與常見陷阱（Gotchas）

1. **自動生成目錄不可手改**：`src/shared/falModelCatalog.ts` 與 `src/shared/falTextToImageCatalog.ts` 會被 `npm run sync:fal` 整份覆寫；新增圖生圖精選請改 `DEFAULT_FAL_PRESETS` (`src/shared/types.ts`)，新增文生圖模型請改 `src/shared/falTextToImageExtraModels.ts` 或 `STARRED_MODEL_IDS` (`src/shared/falTextToImageModels.ts`)。
2. **`README.md` 與現行程式碼的細微差異**：以實際程式碼為準——IPC channel 目前實為 **36** 個（`src/shared/ipc-channels.ts`），且 `file.ipc.ts` 掃描資料夾目前為**單層讀取**而非深層遞迴。
3. **內建 Fallback API Key**：`store.ts`（`DEFAULT_FAL_API_KEY`）與 `deepSeekService.ts`（`DEFAULT_DEEPSEEK_API_KEY`）內建後備金鑰供未自訂金鑰時使用；修改或除錯時切勿把金鑰字串輸出到日誌、註解或文件中。
4. **ASAR 解包依賴 (`electron-builder.yml`)**：`resources/**` 與 `node_modules/ffmpeg-static/**` 透過 `asarUnpack` 解包；若異動憑證檔搜尋路徑或 FFmpeg 呼叫，必須同步確保打包後的 `.unpacked` 路徑相容。
5. **macOS / Windows Dev 啟動環境變數**：`package.json` 的 `dev` 與 `start` 腳本會顯式清空 `ELECTRON_RUN_AS_NODE=`，避免某些 IDE／終端機環境繼承該變數導致 Electron 無法啟動 BrowserWindow。

---

## 5. 常用指令（`package.json`）

```bash
npm run dev                 # 啟動 Electron + Vite 開發模式（熱重載）
npm run typecheck           # 檢查 Node (main/preload/shared) 與 Web (renderer/shared) 型別
npm test                    # 執行全部 Vitest 測試 (vitest run)
npm run build               # 先執行 typecheck 再建置 electron-vite 產物至 out/
npm run build:mac           # 建置並打包 macOS (.dmg/.zip 至 dist/)
npm run build:win           # 建置並打包 Windows (.exe 至 dist/)
npm run sync:fal            # 從 fal.ai 重新同步圖生圖與文生圖模型目錄
npm run lint                # ESLint 檢查並嘗試自動修復
npm run format              # Prettier 格式化程式碼
node scripts/check-google-setup.cjs           # 檢查 Google OAuth / 服務帳號憑證設定
node scripts/import-service-account.cjs <json> # 匯入 Google 服務帳號憑證至 resources/
```
