# Wishful AI Draw — 專案總覽與 AI 分批開發指南

本資料夾包含 **Wishful AI Draw（基於 Electron + fal.ai 的批量圖片 AI 生成桌面應用程式）** 的完整規模化開發提示詞（Prompts）。每個 `.md` 檔案對應一個獨立且前後銜接的開發階段，方便您依序交給 AI 代理（Coding Agent）分批執行與驗證。

---

## 1. 建議技術棧 (Tech Stack)

為了確保 AI 生成程式碼的高穩定性、型別安全與擴充性，全系列提示詞統一採用以下現代技術棧：

- **桌面端框架**：Electron (搭配 `electron-vite` 建置工具，支援 Main / Preload / Renderer 熱重載)
- **前端框架**：React 18 + TypeScript
- **樣式與 UI**：Tailwind CSS + Lucide Icons (深色專業創作工具風格)
- **狀態管理**：Zustand (管理批次佇列、任務進度、模型設定)
- **AI 核心 SDK**：`@fal-ai/client` (官方支援檔案上傳 `fal.storage.upload` 與非同步佇列 `fal.subscribe`)
- **本地儲存與安全**：`electron-store` 或原生 `safeStorage` (加密儲存 API Key 與使用者偏好設定)
- **測試與打包**：Vitest (單元測試) + Playwright (Electron E2E 測試) + `electron-builder` (macOS / Windows 打包)

---

## 2. 分批執行順序與檔案清單

請按照編號順序，將對應檔案的內容提供給 AI 執行（例如輸入：`請讀取並執行 prompts/01_APP_FOUNDATION.md 的內容`）：

| 階段 | 檔案名稱 | 核心目標 | 預期產出 |
| :--- | :--- | :--- | :--- |
| **Phase 1** | `01_APP_FOUNDATION.md` | **應用程式基底與架構** | 初始化 `electron-vite` + React + TS 專案、定義 IPC 安全通道 (`contextBridge`)、API Key 安全讀寫、檔案系統對話框 (選擇資料夾/讀取本地圖片)。 |
| **Phase 2** | `02_UI_DESIGN_SYSTEM.md` | **使用者介面與互動系統** | 打造三欄式專業暗色介面：左側模型與參數設定欄、中間批次圖片拖曳匯入與進度佇列網格、右側高清對比預覽 (Before/After) 與批次匯出控制列。 |
| **Phase 3** | `03_FAL_API_AND_BATCH_ENGINE.md` | **fal.ai 串接與批量處理引擎** | 實作 `@fal-ai/client` 整合、本地圖片自動上傳至 fal Storage、可調式併發佇列 (Concurrency Queue)、失敗重試、即時狀態回報與結果自動下載存檔。 |
| **Phase 4** | `04_TESTING_AND_BUILD.md` | **自動化測試、優化與打包** | 撰寫佇列引擎單元測試、Mock fal.ai API 整合測試、大圖記憶體優化 (縮圖快取)，以及配置 `electron-builder` 產出桌面安裝包 (`.dmg` / `.exe`)。 |
| **Phase 5** | `05_Node_Based_Workflow_UI.md` | **AI 節點化視覺工作流介面** | 引入 `@xyflow/react` 建立四階段自定義節點 (`InputNode`, `PreProcessNode`, `FalApiNode`, `OutputNode`) 與動態流線動畫，並與批次佇列狀態即時連動。 |
| **Phase 6** | `06_Video_Input_and_Frame_Extraction.md` | **影片匯入、頭尾剪裁與 8 fps 序列圖擷取** | 引入 `fluent-ffmpeg` + `ffmpeg-static` 與 `VideoTrimmer.tsx` 剪裁介面，將影片指定秒數區間以 8 fps 轉換為 PNG 序列圖並自動推入批次佇列。 |

---

## 3. 使用方式建議

1. **分批餵給 AI**：每次只讓 AI 專注完成一個階段的 `.md` 提示詞。
2. **階段驗收**：每個 `.md` 檔案底部皆附有「**驗收標準 (Acceptance Criteria)**」，確認程式可正常編譯與運行後，再進入下一階段。
3. **上下文銜接**：每個階段的提示詞開頭都已內建「前情提要與架構約束」，確保不同批次之間不會出現型別衝突或架構斷層。

