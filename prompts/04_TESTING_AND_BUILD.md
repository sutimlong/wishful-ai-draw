# Phase 4：自動化測試、效能優化與桌面打包 (`04_TESTING_AND_BUILD.md`)

> **使用方式**：在完成前三個階段後，將本檔案完整內容提供給 AI，為應用程式加上完整的自動化測試套件（無需消耗真實 API 額度即可測試全流程）、大量圖片記憶體優化，以及跨平台桌面打包設定。

---

## 提示詞內容 (Prompt)

```markdown
# Role
你是一位專精於 Electron 效能調校、自動化測試（Vitest + Playwright）與跨平台打包發佈（electron-builder）的資深品保與系統架構師。

# Context
Wishful AI Draw 已完成基底架構 (Phase 1)、使用者介面 (Phase 2) 與 `fal.ai` 批量處理引擎 (Phase 3)。
本階段（Phase 4）的目標是：**建立完整的自動化測試體系（包含內建 Mock 測試模式）、針對百張以上高解析度圖片進行記憶體與縮圖優化，並配置生產環境打包腳本。**

# Technical Requirements

## 1. 內建「模擬測試模式 (Mock / Dry-Run Mode)」
為了讓開發者與使用者在不消耗 `fal.ai` API 點數的情況下驗證批量工作流：
- 在設定視窗或模型選擇器中提供一個 **「Mock 測試模式 (Dry-Run Mode)」** 開關。
- 開啟時，`falService` 會模擬真實的圖片上傳延遲 (300~600ms)、排隊狀態與生成進度 (1~2秒)，並將原始輸入圖片加上簡單的色彩濾鏡或水印（或直接複製原圖）輸出至目標資料夾，完整走通整個批量佇列與存檔流程。

## 2. 單元測試與整合測試 (`tests/`)
請配置 **Vitest** 並撰寫以下核心測試案例：
- **`tests/batchQueueEngine.test.ts`**：
  - 測試併發限制（例如設定 `concurrency = 2` 時，10 個任務在任何時刻最多只有 2 個處於 active 狀態）。
  - 測試 `pause()` 與 `resume()` 是否精確控制佇列派發。
  - 測試指數退避自動重試機制（模擬前兩次失敗、第三次成功，以及 `401` 錯誤不重試直接失敗）。
  - 測試 `cancelTask()` 與 `cancelAll()` 的狀態清理。
- **`tests/falPayloadBuilder.test.ts`**：
  - 測試不同模型預設（`image_url` 單字串 vs `image_urls` 陣列）、全域 Prompt 與單張 Custom Prompt 合併，以及自訂 JSON 參數覆寫的正確性。
- **`tests/imageDownloader.test.ts`**：
  - 測試檔名樣板解析（`{original_name}_ai_{timestamp}`）與同名檔案防覆蓋自動編號邏輯。

## 3. 大量圖片效能與記憶體優化
當使用者一次匯入 100+ 張高解析度圖片（如每張 10MB PNG）時，防止 Renderer 記憶體暴增：
- 使用 Electron 的 `nativeImage.createThumbnailFromPath(path, { width: 320, height: 320 })` 或輕量圖片處理機制，在卡片網格視圖中僅載入小尺寸縮圖，只有當使用者在右側 Inspector 點開對比預覽時才載入原始高解析度圖片。
- 卡片列表支援流暢捲動與分頁/懶載入 (`loading="lazy"`)。

## 4. 桌面應用程式打包設定 (`electron-builder.yml`)
- 配置完整的 `electron-builder.yml`（或 `package.json` 中的 `build` 區塊）：
  - App ID: `com.wishful.aidraw`
  - Product Name: `Wishful AI Draw`
  - 支援 macOS (`dmg`, `zip`，含 `arm64` 與 `x64`) 與 Windows (`nsis`, `portable`)。
  - 確保 `asarUnpack` 正確處理任何需要的原生模組。
- 在 `package.json` 新增清楚的腳本：
  - `"test"`: 執行所有 Vitest 單元與整合測試
  - `"typecheck"`: 執行 Main 與 Renderer 的 TypeScript 型別檢查
  - `"build:mac"`: 建置並打包 macOS 應用程式
  - `"build:win"`: 建置並打包 Windows 應用程式

## 5. 撰寫專案說明文件 (`README.md`)
撰寫一份清晰的繁體中文 `README.md`，包含：
- 功能特色介紹
- 開發環境啟動步驟 (`npm install`, `npm run dev`)
- `fal.ai` API Key 申請與設定教學
- 如何新增自訂的 `fal.ai` 模型 Endpoint
- 測試與打包指令說明

# Deliverables & Verification
請實作上述所有測試、優化與打包設定，並實際執行 `npm test`、`npm run typecheck` 與 `npm run build`，確保所有測試案例 100% 通過且生產版本建置成功。
```

---

## 階段四驗收標準 (Acceptance Criteria)

- [ ] 執行 `npm test` 所有單元測試與佇列併發測試皆 100% 通過 (Green)。
- [ ] 開啟「Mock 測試模式」後，即使不消耗 `fal.ai` 額度，也能匯入 20 張圖片完整測試批量佇列、暫停/恢復與本地檔案輸出。
- [ ] 一次匯入大量高解析度圖片時，UI 滾動依然保持流暢不卡頓。
- [ ] 執行 `npm run build` 可無錯誤產出可打包的生產環境檔案。

