# Phase 3：fal.ai API 串接與高併發批量處理引擎 (`03_FAL_API_AND_BATCH_ENGINE.md`)

> **使用方式**：在完成 Phase 1 與 Phase 2 後，將本檔案完整內容提供給 AI，實作核心的 `fal.ai` SDK 串接、圖片自動上傳、併發佇列調度與結果自動下載存檔機制。

---

## 提示詞內容 (Prompt)

```markdown
# Role
你是一位精通 Node.js 非同步併發控制、任務佇列架構與 AI 雲端 API (`@fal-ai/client`) 整合的資深後端/桌面端工程師。

# Context
我們已完成 Wishful AI Draw 的 Electron 架構 (Phase 1) 與 React + Zustand 批量操作介面 (Phase 2)。
本階段（Phase 3）的目標是：**在 Electron Main Process 實作高穩定性的 `fal.ai` 服務整合與批量任務調度引擎 (Batch Queue Engine)，支援本地圖片自動上傳、併發數量限制、即時日誌與進度回報、錯誤重試、中途取消，以及生成圖片自動下載儲存至本地磁碟。**

# Technical Requirements

## 1. fal.ai 服務封裝 (`src/main/services/falService.ts`)
請使用官方 `@fal-ai/client` 套件（在 Electron Node.js 主程序執行，避免 CORS 問題並保護 API Key）：
- **動態憑證設定**：每次執行任務前，從安全儲存讀取使用者的 `falApiKey` 並呼叫 `fal.config({ credentials: apiKey })`。
- **本地圖片上傳 (`uploadLocalImage`)**：
  - 讀取本地圖片路徑 (`fs.readFile`)，封裝為 `Blob` 或 `File` 物件並設定正確的 MIME Type (`image/png`, `image/jpeg`, `image/webp`)。
  - 呼叫 `await fal.storage.upload(file)` 取得公開暫存 URL (`remoteInputUrl`)。
  - **快取機制**：若同一張本地圖片已經上傳過且 `remoteInputUrl` 已存在（例如失敗重試或更換參數重新生成），則直接複用該 URL，免除重複上傳耗時。
- **呼叫 AI 模型 (`runImageModel`)**：
  - 使用 `await fal.subscribe(endpointId, { input, logs: true, onQueueUpdate })`。
  - 在 `onQueueUpdate(update)` 回呼中：
    - 當 `update.status === 'IN_QUEUE'` 時，回報排隊狀態與位置 (`queuePosition`)。
    - 當 `update.status === 'IN_PROGRESS'` 時，解析 `update.logs` 並即時透過 IPC 傳送進度與日誌給前端。
  - **彈性的輸入/輸出解析器**：
    - 輸入：將 `remoteInputUrl` 填入模型配置指定的 `imageInputField`（預設為 `image_url`，若是需要陣列的模型如 `image_urls` 則自動包裝為 `[remoteInputUrl]`），並合併 `prompt`、滑桿參數與使用者自訂 JSON 參數。
    - 輸出：相容 `fal.ai` 常見的回傳結構，例如 `result.data.images[0].url`、`result.data.image.url` 或 `result.images[0].url`，精準提取出最終生成的圖片 URL。

## 2. 高併發批量佇列引擎 (`src/main/services/batchQueueEngine.ts`)
請設計一個支援動態併發控制的 `BatchQueueEngine` 類別：
- **併發控制 (Concurrency Control)**：
  - 根據 `AppSettings.concurrency`（例如同時跑 3 張）控制執行中的 Worker 數量。
  - 支援在佇列運行期間 **動態調整併發上限**（使用者拉動底部滑桿時立即生效）。
- **任務生命週期管理**：
  - `startBatch(items, modelConfig)`：將待處理項目加入佇列並啟動調度。
  - `pauseBatch()` / `resumeBatch()`：暫停派發新任務（已在處理中的任務完成後停止派發），以及恢復派發。
  - `cancelTask(itemId)` / `cancelAll()`：使用 `AbortController` 中斷進行中的上傳或下載，並將狀態標記為 `'cancelled'`。
  - `retryFailedTasks()`：將所有 `'failed'` 或 `'cancelled'` 的項目重置並重新排入佇列。
- **自動重試與容錯 (Auto-Retry & Rate Limit Backoff)**：
  - 遇到網路瞬斷或 `429 Too Many Requests` / `5xx` 錯誤時，支援指數退避重試（預設最多自動重試 2 次），若為 `401 Unauthorized`（API Key 無效）或 `422 Validation Error`（參數錯誤）則立即標記失敗並提示明確原因，不浪費重試次數。

## 3. 自動下載與本地檔案命名 (`src/main/services/imageDownloader.ts`)
- 當 `fal.ai` 回傳 `outputImageUrl` 後，主程序自動下載該圖片串流並寫入使用者設定的 `outputDirectory`。
- **智慧命名規則**：
  - 根據設定的 `namingPattern`（例如 `{original_name}_ai_{index}.{ext}`）產生檔名。
  - 防止覆蓋同名檔案：若目標路徑已存在同名檔案，自動加上遞增序號（如 `_1`, `_2`）。
- 儲存完成後，將本地絕對路徑寫入 `BatchItem.savedFilePath`，並透過 `local-media://` 協定讓前端直接讀取本地檔案（即使離線也能檢視生成結果）。

## 4. IPC 雙向即時通訊整合 (`src/main/ipc/batch.ipc.ts`)
- Renderer -> Main (`ipcMain.handle`):
  - `batch:start`
  - `batch:pause`
  - `batch:resume`
  - `batch:cancel-item`
  - `batch:cancel-all`
  - `batch:set-concurrency`
- Main -> Renderer (`webContents.send`):
  - `batch:item-updated` (傳送單一 `BatchItem` 的最新狀態、進度百分比、日誌、輸出路徑或錯誤訊息)
  - `batch:queue-status` (傳送整體佇列執行狀態)

# Deliverables & Verification
請實作上述服務並與 Phase 2 的前端 Zustand Store 完整串接。完成後執行 `npm run typecheck` 與 `npm run build` 確認編譯完全通過。
```

---

## 階段三驗收標準 (Acceptance Criteria)

- [ ] 輸入有效的 `fal.ai` API Key 後，匯入 5 張以上圖片並點擊「開始批量生成」，可觀察到任務依照設定的併發數（如每次 2 張）依序進入 `上傳中 -> 排隊中 -> 生成中 -> 已完成`。
- [ ] 生成完成的圖片會自動下載並儲存在指定的本地輸出資料夾，檔名符合命名規則且不互相覆蓋。
- [ ] 在批量執行期間測試「暫停」、「繼續」、「單張取消」與「失敗重試」，狀態皆能正確切換且不會造成記憶體洩漏或卡死。
- [ ] 當未填寫 API Key 或填寫錯誤 API Key 時，UI 會顯示清楚易懂的錯誤提示。

