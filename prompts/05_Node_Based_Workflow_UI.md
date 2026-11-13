# Phase 5: 實作 AI 工作流節點化視覺介面 (Node-based UI)

為了讓使用者能直觀地監控 AI 批次處理的工作環節，請在我們現有的 React + TypeScript 架構中，引入 `@xyflow/react` (React Flow) 來建構一個動態的節點視覺化介面。

## 任務需求：

### 1. 核心套件與環境設定
*   請使用 `@xyflow/react` 作為節點渲染引擎。
*   所有的節點樣式需結合 Tailwind CSS 來設計，使其符合現代化的深色/淺色主題外觀。

### 2. 自定義節點設計 (Custom Nodes)
請實作以下四種對應 AI 工作環節的自定義節點元件，每個節點需具備 `pending` (等待中)、`active` (執行中)、`success` (成功)、`error` (錯誤) 四種視覺狀態（例如邊框顏色改變、出現載入動畫/打勾圖示）：

1.  **`InputNode.tsx` (輸入節點)：** 顯示當前處理圖片的縮圖與檔名。
2.  **`PreProcessNode.tsx` (預處理節點)：** 顯示「讀取與 Base64 編碼/裁切」的狀態。
3.  **`FalApiNode.tsx` (AI 運算節點)：** 顯示與 Fal.ai API 溝通的狀態，處於 `active` 時需有明顯的發光或旋轉 Spinner 動畫。
4.  **`OutputNode.tsx` (輸出節點)：** 顯示生成完畢的結果圖片縮圖，以及儲存至本地的狀態。

### 3. 工作流畫布與連線 (Workflow Canvas & Edges)
*   **`WorkflowGraph.tsx`：** 建立一個畫布元件，將上述四個節點水平或垂直排列（佈局可預設為靜態位置或自動排版）。
*   **動態連線 (Animated Edges)：** 當某個階段正在進行，或是資料正從 A 節點傳遞到 B 節點時，它們之間的連接線 (Edge) 需開啟 `animated: true` 屬性，呈現水流或虛線流動的視覺效果。

### 4. 與 `BatchController` 狀態綁定
*   將 Phase 3 實作的 `useBatchState` 或 `BatchController` 狀態接入此畫布。
*   當 UI 左側列表選中某一張「正在處理」的圖片時，右側的主工作區需切換顯示該圖片專屬的 Node 工作流畫布。
*   隨著處理進度推進，畫布中的節點狀態需即時連動更新（例如：圖片上傳完成後，連線動畫從 Input 轉向 FalApi 節點，並啟動 FalApi 節點）。

## 輸出要求：
1. 請先提供上述自定義節點 (Custom Nodes) 的 TypeScript 程式碼與 Tailwind 樣式設定。
2. 接著提供 `WorkflowGraph.tsx` 的實作，展示如何註冊自定義節點並定義 initialNodes 與 initialEdges。
3. 說明如何將此元件整合至先前的 `App.tsx` 或主佈局中。