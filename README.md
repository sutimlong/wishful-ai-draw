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
   - 內建 **fal.ai 全站圖生圖模型目錄**（自動同步約 280 個 `image-to-image` 模型，依實驗室分組並可即時搜尋），預設模型為 **GPT Image 2.6 Sunburst (OpenAI)**。
   - 每個模型都附帶由 fal.ai OpenAPI schema 解析出的圖片輸入欄位（`image_url` / `image_urls`）與支援參數，不支援的參數（如 GPT Image 系列的 `strength`、`seed`）會在送出前自動剔除，避免 `422` 驗證錯誤。
   - 下拉選單每個模型後面都會標示 **生成一張圖片的預估金額**（例如 `$0.04 / 張`、`~$0.03 / 張`），選取後會顯示換算依據；`~` 代表依 fal.ai 計價基準換算的估算值。
   - 仍支援切換 **自訂 Endpoint ID**（可自由指定圖片欄位名如 `image_url` 或陣列 `image_urls`）。
   - 支援 **全域提示詞 (Global Prompt)** 與 **單張專屬覆蓋提示詞 (Per-Image Custom Prompt)**。
   - 全域提示詞欄位提供 **AI 優化（DeepSeek）** 按鈕：一鍵將中文提示詞改寫、補齊影像生成所需的構圖／光線／風格細節，並翻譯成英文後回填欄位。
  - 頂部工具列的 **DeepSeek** 徽章會顯示目前剩餘額度，點擊可直接填寫 DeepSeek API Key。
   - 提供可折疊的 **進階 JSON 參數覆寫區**，方便傳遞特定模型專屬參數（會覆寫自動剔除的結果）。
4. **Before / After 互動式滑桿對比預覽 (`InspectorPanel`)**：
   - 點擊任意卡片即可在右側抽屜使用 **互動式滑桿 (Slider)** 或 **並排模式 (Side-by-Side)** 直觀比較原圖與 AI 生成結果，並檢視即時 `fal.ai` 推論日誌。
5. **智慧命名與自動下載存檔**：
   - 生成完成後自動下載至指定輸出資料夾，支援 `{original_name}`、`{timestamp}`、`{index}` 命名樣板與防覆蓋自動編號 (`_1`, `_2`)。
6. **內建模擬測試模式 (Dry-Run Mock Mode)**：
   - 無需消耗真實 `fal.ai` API 點數，即可在本地完整模擬「上傳 -> 排隊 -> 生成 -> 自動存檔」全流程。
   - **預設關閉**，且不會記住上次的開啟狀態；每次啟動 App 都需重新手動開啟。

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

## 🤖 DeepSeek 提示詞優化（AI 優化按鈕）

左側「全域提示詞 (Global Prompt)」標題旁的 **AI 優化** 按鈕會：

1. 把目前的全域提示詞送往 **DeepSeek Chat Completions API**（`https://api.deepseek.com/chat/completions`，模型 `deepseek-chat`）。
2. 依「主體 → 構圖 → 場景 → 光線 → 材質 → 鏡頭 → 風格」重寫成適合 FLUX / GPT Image 等模型的英文提示詞，並保留原始創作意圖。
3. 成功後直接覆寫全域提示詞欄位；失敗時在欄位下方顯示錯誤訊息。
4. 每次優化成功都會在 Google 使用記錄試算表追加一列，事件欄為 `Prompt word_optimization`（E 欄為原始提示詞、F 欄為 `deepseek-chat`、花費與張數欄留空），方便統計 AI 優化用量。

> **🔐 金鑰位置**：內建的 DeepSeek 金鑰定義在 `src/main/services/deepSeekService.ts` 的 `DEFAULT_DEEPSEEK_API_KEY`，僅會在 **main process** 使用，不會暴露給 renderer。此金鑰會被打包進應用程式產物中，僅適合個人／內部使用；若需對外散布，建議改為由使用者在設定中填入自己的 Key。

### TopBar 的 DeepSeek 金鑰與剩餘額度

頂部工具列的 **DeepSeek** 徽章會顯示目前帳戶餘額（`GET https://api.deepseek.com/user/balance`）：

- 有餘額時直接顯示金額（USD → `$`、CNY → `¥`），滑鼠移上去可看完整數字。
- 點擊徽章會展開面板，可**直接填寫／更新 DeepSeek API Key**、重新整理餘額，並查看「儲值 / 贈送」額度與 `is_available` 狀態。
- 儲存金鑰後會自動重新查詢餘額；批量生成結束時也會一併更新；401 / 403 會顯示「DeepSeek Key 無效」。
- 輸入框留空即回退到內建的 `DEFAULT_DEEPSEEK_API_KEY`；金鑰以 macOS Keychain / `safeStorage` 加密保存在本機設定檔。
- 同一個金鑰欄位也可以在「設定」視窗（齒輪圖示）中修改。

---

## 🧪 自動化測試與型別檢查

本專案使用 **Vitest** 進行佇列併發限制、指數退避重試、Payload 組裝與防覆蓋存檔測試：

```bash
# 執行單元與整合測試
npm test

# 執行 Main / Preload / Renderer TypeScript 型別檢查
npm run typecheck
```

### 同步 fal.ai 模型目錄

「AI 模型選擇」的完整清單由 `src/shared/falModelCatalog.ts` 提供（自動產生，請勿手動編輯）。
當 fal.ai 上架新模型或調整參數時，執行：

```bash
npm run sync:fal-models
```

腳本會抓取 fal.ai `image-to-image` 目錄、各模型的 OpenAPI schema 與模型頁面的計價資訊，自動產生：
- 圖片輸入欄位（`image_url` / `image_urls`）與是否為陣列
- 是否支援擴散參數（`strength` / `num_inference_steps` / `guidance_scale` / `negative_prompt`）
- 該模型不支援的參數清單（`unsupportedFields`），送出前自動剔除
- 計價資訊（`pricing`）：fal.ai 公布的計價單位（每張 / 每百萬像素 / 每運算秒 / token）與單價，並換算成「生成一張圖片」的預估金額

計價換算規則（`perImageUsd`，`~` 表示估算）：

| fal 計價基準 | 換算方式 |
| --- | --- |
| 每張 / 每次（`images`、`generations`） | 直接採用 fal 公布單價 |
| 每百萬像素（`megapixels`） | 單價 × 約 1 MP（以 1024×1024 輸出估算） |
| 輸入＋輸出皆計價（`processed megapixels`） | 單價 × 約 2 MP |
| 說明文字中的「$X per image」 | 直接採用該金額 |
| token 計價 | 取 fal 官方價格表中 1024×1024、`high` 品質的金額 |
| 每運算秒（`compute seconds`） | 無法換算單張，只顯示每秒費率 |

`types.ts` 中的 `DEFAULT_FAL_PRESETS` 為人工驗證過的精選模型，會固定排在清單最前面並優先採用；其計價資訊會沿用同一個模型（含 `fal-ai/`、`openai/` 別名）同步到的價格。

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

