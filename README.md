# Wishful AI Draw — fal.ai 批量圖片生成桌面應用程式

**Wishful AI Draw** 是一款基於 **Electron + React 18 + TypeScript + Tailwind CSS + `@fal-ai/client`** 打造的專業深色桌面應用程式，專為需要將大量本地圖片（數十至數百張）批量傳送給 **fal.ai** 視覺模型（如 FLUX.1 Image-to-Image、FLUX Kontext、Recraft V3、Clarity Upscaler 或任意自訂 Endpoint）進行風格轉換、細節重繪與超解析度放大的創作者與工程團隊而設計。

---

## ✨ 核心功能特色

1. **批量圖片拖曳與資料夾匯入**：
   - 支援原生多選圖片對話框、整個資料夾掃描匯入，或直接從桌面將圖片與資料夾拖曳 (Drag & Drop) 進工作區。
   - 內建 `local-media://` 自訂安全協定與 `nativeImage` 縮圖生成機制，一次載入百張高解析度大圖依然流暢不卡頓。
2. **高併發佇列引擎 (`BatchQueueEngine`)**：
   - 可在底部控制列即時動態調整同時併發數量 (`1 ~ 10`)。
   - 支援佇列 **暫停 (Pause)**、**繼續 (Resume)**、**單張取消 / 全部取消 (`AbortController`)** 與 **失敗項目一鍵重試**。
   - 內建 **指數退避自動重試 (Exponential Backoff)**，自動處理網路瞬斷或 `429 / 5xx` 錯誤。
3. **彈性模型與提示詞管理**：
   - 內建常用 `fal.ai` 圖生圖與放大模型預設清單，並支援切換 **自訂 Endpoint ID**（可自由指定圖片欄位名如 `image_url` 或陣列 `image_urls`）。
   - 支援 **全域提示詞 (Global Prompt)** 與 **單張專屬覆蓋提示詞 (Per-Image Custom Prompt)**。
   - 提供可折疊的 **進階 JSON 參數覆寫區**，方便傳遞特定模型專屬參數。
4. **Before / After 互動式滑桿對比預覽 (`InspectorPanel`)**：
   - 點擊任意卡片即可在右側抽屜使用 **互動式滑桿 (Slider)** 或 **並排模式 (Side-by-Side)** 直觀比較原圖與 AI 生成結果，並檢視即時 `fal.ai` 推論日誌。
5. **智慧命名與自動下載存檔**：
   - 生成完成後自動下載至指定輸出資料夾，支援 `{original_name}`、`{timestamp}`、`{index}` 命名樣板與防覆蓋自動編號 (`_1`, `_2`)。
6. **內建模擬測試模式 (Dry-Run Mock Mode)**：
   - 無需消耗真實 `fal.ai` API 點數，即可在本地完整模擬「上傳 -> 排隊 -> 生成 -> 自動存檔」全流程。

---

## 🚀 快速開始 (開發環境)

### 1. 安裝依賴套件

```bash
npm install
```

### 2. 啟動開發模式 (含熱重載 HMR)

```bash
npm run dev
```

---

## 🔑 設定 fal.ai API Key

1. 前往 [fal.ai Dashboard Keys](https://fal.ai/dashboard/keys) 建立並複製您的 API Key（格式通常為 `key_id:key_secret`）。
2. 在應用程式右上角點擊 **「未設定 API Key」** 或 **「設定 (齒輪圖示)」**。
3. 貼上 API Key 並點擊「儲存設定」。應用程式會透過系統原生的 `safeStorage` (macOS Keychain / Windows DPAPI) 進行本地加密儲存。

> **💡 提示**：若您想先測試介面與佇列存檔功能，可直接點擊頂部工具列的 **「模擬模式 (ON)」**，無須填寫 API Key 即可執行批量測試。

---

## 🧪 自動化測試與型別檢查

本專案使用 **Vitest** 進行佇列併發限制、指數退避重試、Payload 組裝與防覆蓋存檔測試：

```bash
# 執行單元與整合測試
npm test

# 執行 Main / Preload / Renderer TypeScript 型別檢查
npm run typecheck
```

---

## 📦 生產環境建置與桌面打包

```bash
# 僅編譯並建置生產環境 bundle (輸出至 out/)
npm run build

# 打包 macOS 應用程式 (.dmg / .zip)
npm run build:mac

# 打包 Windows 應用程式 (.exe NSIS / Portable)
npm run build:win
```

---

## 📂 分批開發提示詞文件 (`prompts/`)

若您需要擴充或讓 AI 重新分階段實作，請參閱 [`prompts/`](./prompts) 目錄下的規模化提示詞指南：
- [`00_MASTER_OVERVIEW.md`](./prompts/00_MASTER_OVERVIEW.md) — 專案總覽與分批執行指南
- [`01_APP_FOUNDATION.md`](./prompts/01_APP_FOUNDATION.md) — Phase 1：Electron 基底與安全 IPC 架構
- [`02_UI_DESIGN_SYSTEM.md`](./prompts/02_UI_DESIGN_SYSTEM.md) — Phase 2：深色創作工作區介面與 Zustand 狀態管理
- [`03_FAL_API_AND_BATCH_ENGINE.md`](./prompts/03_FAL_API_AND_BATCH_ENGINE.md) — Phase 3：fal.ai SDK 串接與高併發佇列引擎
- [`04_TESTING_AND_BUILD.md`](./prompts/04_TESTING_AND_BUILD.md) — Phase 4：單元測試、縮圖記憶體優化與桌面打包
- [`05_Node_Based_Workflow_UI.md`](./prompts/05_Node_Based_Workflow_UI.md) — Phase 5：`@xyflow/react` AI 工作流節點化視覺介面
- [`06_Video_Input_and_Frame_Extraction.md`](./prompts/06_Video_Input_and_Frame_Extraction.md) — Phase 6：影片匯入、頭尾剪裁與 FFmpeg 8 fps 序列影像擷取

