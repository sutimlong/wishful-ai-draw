# Phase 2：使用者介面與工作區設計 (`02_UI_DESIGN_SYSTEM.md`)

> **使用方式**：在完成 `01_APP_FOUNDATION.md` 後，將本檔案完整內容提供給 AI，建立完整的批量圖片工作區 UI 與 Zustand 狀態管理系統。

---

## 提示詞內容 (Prompt)

```markdown
# Role
你是一位專精於桌面創作工具（如 Lightroom、ComfyUI Desktop、Figma）介面設計的資深前端工程師，精通 React 18、Tailwind CSS、Zustand 與 Lucide Icons。

# Context
我們已完成 Phase 1 的 Electron 基底（包含 `src/shared/types.ts` 與 `window.electronAPI`）。
本階段（Phase 2）的目標是：**打造專業、高效率的深色模式（Dark Mode）批量 AI 繪圖桌面介面，並使用 Zustand 管理批量佇列與介面狀態。**

# UI Layout & Functional Specifications

請採用全螢幕應用程式佈局（`h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col`），分為以下四個主要區域：

## 1. 頂部工具列 (`src/renderer/src/components/TopBar.tsx`)
- **左側**：應用程式名稱與圖示 (`Wishful AI Draw`) + 目前任務統計徽章（總數 / 已完成 / 處理中 / 失敗）。
- **右側**：
  - API Key 狀態指示燈（綠燈：已設定 API Key；紅燈：未設定，點擊開啟設定彈窗）。
  - 輸出資料夾快速按鈕（顯示目前儲存路徑，點擊可更換或直接在 Finder/檔案總管打開）。
  - 「設定 (Settings)」按鈕（開啟設定 Modal）。

## 2. 左側面板：AI 模型與參數控制欄 (`src/renderer/src/components/SidebarConfig.tsx`)
固定寬度（例如 `w-80 border-r border-zinc-800 flex flex-col`），包含：
- **模型選擇器 (Model Selector)**：
  - 內建常用 `fal.ai` 圖片生成/編輯模型預設清單（如 `fal-ai/flux/dev/image-to-image`、`fal-ai/flux-pro/kontext`、`fal-ai/recraft-v3/image-to-image`、`fal-ai/clarity-upscaler`）。
  - 支援「自訂 Endpoint ID (Custom Endpoint)」輸入框，讓進階使用者可填入任意 fal.ai 模型路徑（並可指定圖片參數欄位名，預設 `image_url`）。
- **全域提示詞設定 (Global Prompt & Negative Prompt)**：
  - 多行文字框輸入全域 `Prompt`（套用至整批圖片）。
  - 支援變數語法提示，或允許單張圖片附加額外描述。
- **核心生成參數 (Generation Parameters)**：
  - `Strength / Denoising` 滑桿 (0.01 ~ 1.00，預設 0.75)
  - `Inference Steps` 滑桿 (1 ~ 50，預設 28)
  - `Guidance Scale (CFG)` 滑桿 (1.0 ~ 20.0，預設 3.5)
  - `Output Format` 選擇 (`png` / `jpeg` / `webp`)
  - `Seed` 輸入框（留空為隨機，或可鎖定固定種子）
  - **進階 JSON 參數覆寫區 (Collapsible Advanced JSON)**：允許使用者輸入額外的 JSON key-value，直接合併傳遞給 `fal.ai` API。

## 3. 中央主工作區：批量圖片匯入與佇列畫廊 (`src/renderer/src/components/BatchWorkspace.tsx`)
- **操作工具列**：
  - 「+ 新增圖片」、「+ 匯入整個資料夾」按鈕。
  - 支援直接從桌面 **拖曳 (Drag & Drop)** 多張圖片或整個資料夾進入視窗匯入。
  - 篩選器 Tabs：`全部 (All)`、`等待中 (Idle)`、`處理中 (Active)`、`已完成 (Completed)`、`失敗 (Failed)`。
  - 「清除已完成」、「清空全部」、「失敗項目重試」按鈕。
- **虛擬化/網格卡片視圖 (`BatchGridCard.tsx`)**：
  - 每張卡片顯示輸入圖片縮圖（若已生成完成，右上角顯示完成標記或直接切換預覽生成結果）。
  - 狀態視覺回饋：
    - `uploading` / `queued` / `processing`：顯示動態進度條與狀態標籤。
    - `completed`：翡翠綠邊框與「已完成」徽章，提供「檢視對比」與「開啟檔案位置」按鈕。
    - `failed`：紅色警示邊框、錯誤訊息 Tooltip 與單獨「重試」按鈕。
  - 點擊任一卡片可在右側開啟詳細檢視與單張獨立 Prompt 微調。

## 4. 右側抽屜 / 預覽與前後對比面板 (`src/renderer/src/components/InspectorPanel.tsx`)
當選中某張卡片時展開：
- **Before / After 互動式滑桿對比器 (Image Comparison Slider)**：可左右拖動滑桿直觀對比「原始輸入圖」與「AI 生成結果圖」，也支援「並排顯示 (Side-by-Side)」切換。
- **單張專屬設定**：可為該圖片單獨設定覆蓋或附加的 `Custom Prompt`，以及檢視該任務耗時、輸入輸出解析度與詳細錯誤日誌。

## 5. 底部批量執行控制列 (`src/renderer/src/components/BottomActionBar.tsx`)
- **併發數控制 (Concurrency Slider)**：即時調整同時處理的圖片數量 (1 ~ 10)。
- **總進度條 (Overall Progress Bar)**：顯示 `已完成 X / 總計 Y 張 (百分比%)` 及預估剩餘時間。
- **主控制按鈕**：
  - `開始批量生成 (Start Batch)`
  - `暫停佇列 (Pause)` / `繼續 (Resume)`
  - `全部取消 (Cancel All)`

## 6. Zustand 狀態管理 (`src/renderer/src/store/useBatchStore.ts`)
- 集中管理 `items: BatchItem[]`、`selectedItemId`、`modelConfig`、`appSettings`、`isRunning`、`isPaused`。
- 綁定 `window.electronAPI` 的 IPC 事件監聽（如 `onTaskProgress`、`onTaskCompleted`、`onTaskFailed`），確保主程序回報進度時 UI 即時無延遲更新。

# Deliverables & Verification
請實作所有 UI 元件與 Zustand Store，並提供模擬預覽模式（即使尚未填入真實 API Key，也能匯入本地圖片、調整參數、檢視佇列卡片與開啟設定視窗）。完成後執行 `npm run typecheck` 與 `npm run build` 驗證無誤。
```

---

## 階段二驗收標準 (Acceptance Criteria)

- [ ] 介面呈現專業深色風格，頂部列、左側模型設定欄、中央批次畫廊、右側對比檢視面板與底部控制列佈局完整且響應流暢。
- [ ] 支援按鈕選取與拖曳 (Drag & Drop) 批量匯入多張本地圖片，卡片立即顯示本地縮圖。
- [ ] 點擊任一圖片卡片可在右側面板查看資訊、修改單張專屬 Prompt，並在有輸出結果時使用 Before/After 滑桿對比。
- [ ] 設定視窗可輸入儲存 `fal.ai` API Key、調整併發數與預設輸出資料夾。

