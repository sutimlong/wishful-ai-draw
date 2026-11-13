# Phase 6: 影片匯入、頭尾剪裁與 8 fps 序列影像擷取

為了擴展應用程式的能力，請在現有的架構中加入「影片匯入與處理」功能。使用者可以匯入影片，透過 UI 設定起訖時間（剪裁），並在本地端透過 FFmpeg 將影片轉換為 8 fps 的序列圖，最後自動加入至現有的 Fal.ai 批次處理佇列中。

## 任務需求：

### 1. 後端影片處理 (Main Process & FFmpeg)
*   **套件引入：** 請使用 `fluent-ffmpeg` 與 `ffmpeg-static`（避免使用者需自行安裝 FFmpeg，方便打包）。
*   **IPC Handler (`video:extractFrames`)：**
    *   接收來自前端的參數：`filePath` (影片路徑), `startTime` (剪裁起點秒數), `endTime` (剪裁終點秒數), `fps` (預設為 8)。
    *   在系統暫存資料夾 (或專案設定的暫存區) 建立一個專屬資料夾來存放擷取出的圖片。
    *   執行 FFmpeg 指令：根據 `startTime` 與 `endTime` 進行精準剪裁，並以 `-r 8` 參數將影片轉為連續圖片 (例如 `frame_%04d.png`)。
    *   實作進度回傳 (Progress Callback)：透過 `webContents.send` 將 FFmpeg 的處理進度百分比即時傳回前端。
    *   完成後，回傳所有生成的圖片絕對路徑陣列。

### 2. IPC 與 Preload 更新
*   在 `preload.ts` 中新增 `window.electronAPI.extractVideoFrames(options)`，並提供完整的 TypeScript 型別定義。
*   新增監聽 FFmpeg 轉檔進度的 IPC 事件 `window.electronAPI.onVideoProgress(callback)`。

### 3. 前端影片剪裁介面 (React UI)
*   **`VideoTrimmer.tsx` 元件：**
    *   設計一個影片播放器 (HTML5 `<video>`) 用來預覽匯入的影片。
    *   設計一個雙滑塊 (Dual Range Slider) 或兩個時間輸入框，讓使用者設定 `Start Time` 與 `End Time`。
    *   顯示預估擷取張數 (計算公式：`(End Time - Start Time) * 8`)。
    *   新增「開始擷取 (Extract & Queue)」按鈕。

### 4. 與現有批次佇列整合 (Queue Integration)
*   當使用者點擊「開始擷取」時，UI 應顯示 FFmpeg 擷取進度條。
*   當 `video:extractFrames` 成功回傳圖片路徑陣列後，請將這些圖片自動封裝成 Task，並使用 Phase 3 實作的 `useBatchState` / `BatchController` 的 `addTasks` 方法，將它們無縫推入 Fal.ai 的待處理佇列中。
*   這些序列圖進入佇列後，應可直接適用於 Phase 5 開發的 Node-based 工作流介面。

## 輸出要求：
1. 請提供 Main Process 中處理 FFmpeg 的完整函式程式碼 (`videoService.ts` 或更新 `main.ts`)。
2. 提供 `VideoTrimmer.tsx` 剪裁介面的 React 程式碼 (搭配 Tailwind CSS)。
3. 提供串接擷取結果到 `BatchController` 的邏輯範例。
