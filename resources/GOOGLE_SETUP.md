# Google 登入與雲端使用記錄設定

本 App 會要求使用者先登入才能使用，登入方式有兩種：

- **Google 帳號登入**（OAuth，預設）
- **序號登入**（使用者輸入管理員提供的序號，並自行填寫 Email 與名稱）

無論使用哪種方式，App 都會將「每張成功生成的圖片」寫入開發者雲端硬碟中的
**單一集中式 Google 試算表**（透過 Service Account 寫入）。以下為一次性設定步驟。

> ⚠️ `resources/google-credentials.json` 內含 Service Account 私鑰，已加入 `.gitignore`。
> 請勿提交、勿公開散布。此設計適用於個人／內部使用；若要公開散布 App，應改由自架後端代為寫入。

---

## 1. 建立 GCP 專案並啟用 API

1. 前往 <https://console.cloud.google.com/> 建立（或選擇）一個專案。
2. 「API 和服務 → 程式庫」啟用：
   - **Google Sheets API**
   - **Google Drive API**

## 2. 建立 Service Account（寫入試算表用）

1. 「API 和服務 → 憑證 → 建立憑證 → 服務帳戶」。
2. 建立完成後，進入該服務帳戶 →「金鑰 → 新增金鑰 → 建立新的金鑰 → JSON」，下載金鑰檔。
3. 記下服務帳戶的 `client_email`（形如 `xxx@your-project.iam.gserviceaccount.com`）。

## 3. 準備使用記錄試算表（二選一）

### 方式 A（建議）：手動建立試算表

1. 在你的 Google 雲端硬碟建立一個 Google 試算表，命名為 `Wishful AI Draw 使用記錄`。
2. 將該試算表**共用**給上面的 `client_email`，權限設為 **編輯者**。
3. 從試算表網址取得 ID：
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit` → 複製 `<SPREADSHEET_ID>`，
   填入設定檔的 `spreadsheetId`。

> 這個方式由你本人持有試算表，最穩定，也不受 Service Account 無儲存空間配額的限制。

### 方式 B：讓 App 自動建立

1. 在雲端硬碟建立一個資料夾（例如 `Wishful AI Draw Logs`）。
2. 將資料夾**共用**給 `client_email`，權限設為 **編輯者**。
3. 從資料夾網址取得 ID 並填入 `driveFolderId`。

App 首次寫入時會在此資料夾內自動建立（或尋找）`spreadsheetName` 指定的試算表，
並補上標題列。

## 4. 建立 OAuth 用戶端（使用者登入用）

1. 「API 和服務 → OAuth 同意畫面」：
   - User Type 選 **External**，填入 App 名稱與支援信箱。
   - Scopes 加入 `openid`、`email`、`profile`。
   - 發布狀態維持 **Testing** 時，請在「Test users」加入允許登入的 Google 帳號。
2. 「憑證 → 建立憑證 → OAuth 用戶端 ID」：
   - 應用程式類型選 **電腦版應用程式（Desktop app）**。
   - 複製 **Client ID**（形如 `xxxx.apps.googleusercontent.com`）。
   - **同時複製「用戶端密碼（Client secret）」**（形如 `GOCSPX-xxxx`）。
     Google 的 token 端點會要求此值，未填會出現 `client_secret is missing`。
   - Desktop app 類型可自動使用 `http://127.0.0.1:<隨機埠>` 作為 loopback redirect URI，無需額外註冊。
   - 若建立成「Web 應用程式」類型，隨機埠無法預先註冊，登入會失敗（`redirect_uri_mismatch`）。

> 登入流程在**系統瀏覽器**完成：按下「使用 Google 帳戶登入」後，完成授權、瀏覽器顯示「登入成功」時，
> App 視窗會**自動切換回前景**並進入主畫面（瀏覽器分頁可直接關閉，不需要手動切回 App）。

## 5. 建立 `resources/google-credentials.json`

複製範本後填入實際內容：

```bash
cp resources/google-credentials.example.json resources/google-credentials.json
```

| 欄位 | 說明 |
| --- | --- |
| `oauthClientId` | 步驟 4 的 Desktop app Client ID（必填） |
| `oauthClientSecret` | 步驟 4 的「用戶端密碼」（形如 `GOCSPX-xxxx`）。**Desktop app 也必須填寫**，Google token 端點會要求此值 |
| `spreadsheetId` | 步驟 3 方式 A 的試算表 ID（與 `driveFolderId` 至少填一個，建議填此項） |
| `driveFolderId` | 步驟 3 方式 B 的資料夾 ID（僅在未填 `spreadsheetId` 時使用） |
| `spreadsheetName` | 自動建立試算表時的名稱，預設 `Wishful AI Draw 使用記錄` |
| `serialSheet` | 序號登入驗證用的試算表設定（見第 8 節）；未填時使用內建預設值 |
| `allowedAccounts` | Google 登入授權 Gmail 清單設定（見第 9 節）；未填時使用內建預設（工作表3） |
| `serviceAccount` | 步驟 2 下載的 Service Account JSON **完整內容** |

也可用環境變數 `GOOGLE_CREDENTIALS_FILE=/絕對路徑/google-credentials.json` 指定其他位置。

已有從 GCP 下載的 Service Account 金鑰 JSON 時，可用內建腳本直接匯入
（只更新 `serviceAccount` 欄位，不會覆蓋 `oauthClientId`、`spreadsheetId`、`serialSheet` 等設定）：

```bash
node scripts/import-service-account.cjs ~/Downloads/your-project-xxxx.json
```


## 6. 試算表欄位

| 欄 | 欄位 | 說明 |
| --- | --- | --- |
| A | 時間 | 圖片完成時間（**台灣時間 UTC+8**，格式 `YYYY-MM-DD HH:mm:ss`） |
| B | 使用者 Email | Google 帳號；序號登入者為其自行填寫的 Email |
| C | 使用者名稱 | Google 顯示名稱；序號登入者為「名稱（序號）」，例：`王小明（WAD-2026-0001）` |
| D | 事件 | `image_generated`（正式生成）／`image_generated_SIM`（模擬模式）／`Prompt word_optimization`（AI 優化提示詞） |
| E | 圖片檔名 | 來源檔名；`Prompt word_optimization` 事件為使用者送出的**原始提示詞**（換行會壓成單行） |
| F | 模型 | fal.ai endpoint ID；`Prompt word_optimization` 事件為 `deepseek-chat` |
| G | 產生張數 | 每列 1 張；`Prompt word_optimization` 事件留空 |
| H | 花費額度 (USD) | 由 fal.ai 平台 API 查得後回填 |
| I | 費用類型 | `預估` / `實際` |
| J | 狀態 | `completed`；`Prompt word_optimization` 事件為 `success` |

> 花費額度採非同步查詢：列會先寫入，查得費用後回填同一列的 H、I 欄。
> 時間欄（A）固定以**台灣時間（UTC+8）**寫入，不受執行 App 的電腦時區影響；
> 即使試算表本身的時區設定是 UTC，儲存格看到的仍是台灣時間。
> 若想讓欄位名稱更清楚，可自行把 A1 改成 `時間（台灣時間）`，App 不會覆寫既有標題列。
> 若查詢失敗（網路／權限），H、I 欄會留空，不影響圖片生成結果。
> 「模擬測試模式（Mock Mode）」**也會寫入一列記錄**，事件欄（D）標記為 `image_generated_SIM`，
> 且 H、I 欄留空（模擬不產生 fal.ai 費用），可據此區分測試資料與正式資料。
> 每次按下「AI 優化」（DeepSeek 提示詞優化）**成功**時也會寫入一列，事件欄（D）為 `Prompt word_optimization`：
> E 欄記下使用者送出的原始提示詞、F 欄為 `deepseek-chat`、G～I 欄留空、J 欄為 `success`。
> App 固定寫入試算表的**第一個工作表**（預設「工作表1」）；若試算表有多個分頁，請把記錄頁放在最前面。

## 7. 設定完成後自我檢查（選用）

可執行內建的檢查腳本，一次驗證憑證檔、OAuth Client ID、Service Account 金鑰、使用記錄試算表讀寫權限、
序號試算表讀取／回填權限與授權 Gmail 清單讀取權限（不會修改試算表內容，輸出會遮蔽敏感資訊）：

```bash
node scripts/check-google-setup.cjs
```

全部項目顯示 ✅ 即代表設定完成，可直接 `npm run dev` 測試登入與寫入。

## 8. 序號登入（選用，雲端驗證）

除 Google 登入外，App 也支援「序號登入」：使用者輸入管理員提供的序號，並自行填寫 Email 與名稱即可登入。
序號清單存放於 Google 試算表的指定工作表（預設「工作表2」A 欄），登入時由 Service Account **線上讀取比對**；
僅做「是否在清單內」的比對，**可重複使用，不會記錄已用次數**。

登入成功後，App 會把該次登入者的**名稱、Email、登入時間**寫回同一列的 **B、C、D 欄**（每次登入都覆寫），
方便管理員在試算表上直接看到「這組序號目前是誰在用、最後登入時間」。

### 前置設定

1. 準備一份序號試算表（可與使用記錄試算表同一份，也可分開）。
2. 在試算表新增一個工作表（預設「工作表2」），第 1 列放標題，序號**從第 2 列開始**貼在 **A 欄**。
3. 將該試算表**共用**給 Service Account 的 `client_email`，權限設為**「編輯者」**
   （只讀序號只需「檢視者」，但回填登入資料需要寫入權限）。
4. 在 `resources/google-credentials.json` 填入 `serialSheet`：

```jsonc
"serialSheet": {
  "spreadsheetId": "1Gy8ICS8Cz4YEJVnwWehvcclvLsuSYzfbceiYUlhRKgw", // 序號試算表 ID
  "sheetId": 1195700831,                                          // 工作表2（網址 gid=...）
  "column": "A",                                                  // 序號所在欄
  "hasHeader": true                                               // 第 1 列是標題列，比對時跳過
}
```

| 欄位 | 說明 |
| --- | --- |
| `spreadsheetId` | 序號試算表 ID；未填時退回使用 `spreadsheetId`，再退回內建預設試算表 |
| `sheetId` | 工作表 gid（Google Sheet 網址中的 `gid=` 數字），預設工作表二 `1195700831` |
| `sheetTitle` | 可直接指定工作表名稱（例如 `"工作表二"`），填寫後優先使用、不再以 gid 對照 |
| `column` | 序號所在欄，預設 `A` |
| `hasHeader` | 第 1 列是否為標題列；`true` 表示第 1 列是標題、序號從第 2 列開始（預設 `false`，代表第一列就是序號） |

> 若第 1 列是 `WAD ID / 使用者名稱 / 電子郵件 / 創建時間` 這類標題，**必須**設為 `hasHeader: true`，
> 否則標題列會被當成一組序號，回填時列號也會整體錯開一列。

### 工作表欄位

| 欄 | 內容 | 由誰寫入 |
| --- | --- | --- |
| A | 序號（`WAD-...`） | 管理員提供 |
| B | 使用者名稱 | App 於序號登入成功後自動回填 |
| C | 使用者 Email | App 於序號登入成功後自動回填 |
| D | 登入時間（台灣時間 `YYYY-MM-DD HH:mm:ss`） | App 於序號登入成功後自動回填 |

- 比對時會忽略空白並轉為大寫（`wad-2026-0001` 等同 `WAD-2026-0001`）。
- 重複的序號只算一筆。
- 管理員修改試算表後，使用者下次按下「使用序號登入」即會重新讀取（成功結果最多快取 60 秒）。
- 讀取失敗（未分享給服務帳戶、網路不通）會顯示對應錯誤，**不會**誤判為序號無效。

### 回填登入者資料

序號登入成功後，App 會以**背景方式**（不阻塞登入流程）把資料寫回該序號所在列：

- **B 欄**：使用者填寫的名稱
- **C 欄**：使用者填寫的 Email
- **D 欄**：登入時間（台灣時間 `YYYY-MM-DD HH:mm:ss`）

> 每次登入都會**覆寫** B、C、D 三欄，因此 D 欄代表「最近一次登入時間」，而不是首次登入時間；
> 若希望語意更清楚，可自行把 D1 標題改成 `最近登入時間`，App 不會覆寫標題列。
>
> 回填失敗（例如服務帳戶只有「檢視者」權限、網路中斷）只會在 console 印出警告，
> **不影響登入結果**；序號不在清單中時也不會寫入任何資料。

### 記錄方式

序號登入者的使用記錄會以「名稱（序號）」寫入 **使用記錄試算表的 C 欄（使用者名稱）**，
B 欄（使用者 Email）則寫入使用者自行填寫的 Email，方便對照是哪一組序號產生的記錄。

## 9. 授權 Gmail 帳號（選用，Google 登入防護網）

App 可限制「只有特定 Gmail 帳號能以 Google 登入」。未列在清單內的帳號登入時會顯示：

> 此 Google 帳號尚未開通。請聯絡小融，幫你開通帳號 sutimlong@gmail.com 0979-891-727

### 前置設定

1. 在試算表新增一個工作表（預設「工作表3」），第 1 列放標題（例如 `授權的Gmail帳號`），
   把允許登入的 Gmail **從第 2 列開始貼在 A 欄**（一行一個）。
2. 將該試算表**共用**給 Service Account 的 `client_email`，權限至少**「檢視者」**
   （此清單只需讀取，不需要編輯權限）。
3. 確認 `resources/google-credentials.json` 的 `allowedAccounts` 設定正確：

```jsonc
"allowedAccounts": {
  "spreadsheetId": "1Gy8ICS8Cz4YEJVnwWehvcclvLsuSYzfbceiYUlhRKgw", // 未填時沿用 spreadsheetId
  "sheetId": 740235806,                                             // 工作表3（網址 gid=...）
  "column": "A",                                                    // 授權 Gmail 所在欄
  "hasHeader": true                                                 // 第 1 列是標題列，比對時跳過
}
```

| 欄位 | 說明 |
| --- | --- |
| `spreadsheetId` | 授權清單試算表 ID；未填時退回使用 `spreadsheetId`，再退回內建預設試算表 |
| `sheetId` | 工作表 gid（Google Sheet 網址中的 `gid=` 數字），預設工作表三 `740235806` |
| `sheetTitle` | 可直接指定工作表名稱（例如 `"工作表3"`），填寫後優先使用、不再以 gid 對照 |
| `column` | 授權 Gmail 所在欄，預設 `A` |
| `hasHeader` | 第 1 列是否為標題列；預設 `true`（第 1 列是標題、帳號從第 2 列開始） |

### 運作方式

- Email 比對會忽略前後空白與大小寫（`SutimLong@Gmail.com` 等同 `sutimlong@gmail.com`）。
- **登入當下**一定會重新讀取清單，因此管理員修改後，使用者重新登入即生效。
- **每次開啟 App 還原登入狀態時**也會重新檢查：被移出清單者會自動登出並顯示上面的訊息。
- 還原登入時若只是網路暫時不通，會**保留登入狀態**（不會因為斷線被強制登出）；
  但登入當下讀不到清單會阻擋登入並顯示技術錯誤，避免誤放行。
- 序號登入**不受**此清單影響（序號本身就是一道關卡）。
- 清單為空時，所有 Google 登入都會被阻擋。

## 10. 常見問題

- **登入後瀏覽器顯示「登入成功」但 App 仍停在登入畫面**：正常情況下 App 會自動切回前景並進入主畫面；
  若沒有切回，請確認 `oauthClientId` 是否正確，並查看主程序 console 的錯誤訊息。
- **`client_secret is missing` / `OAuth Client ID 或 Client Secret 不正確`**：回到 GCP「憑證」點擊該 OAuth 2.0 用戶端 ID，複製「用戶端密碼」填入 `oauthClientSecret`。
- **`redirect_uri_mismatch`**：OAuth 用戶端類型建立錯誤（多為「Web 應用程式」），請重新建立為「電腦版應用程式（Desktop app）」。
- **403 / insufficient permissions**：確認試算表已分享給 Service Account 且權限為編輯者，並已啟用 Sheets/Drive API。
- **一直要求重新登入**：Google 未回傳 refresh token 時會如此。請至 <https://myaccount.google.com/permissions> 移除本 App 的存取權後重新登入。
- **序號登入顯示「Service Account 憑證仍是範例值」**：`resources/google-credentials.json` 還是範例內容，
  執行 `node scripts/import-service-account.cjs <GCP 下載的金鑰.json>` 匯入真實金鑰即可（不需重啟 App）。
- **序號登入顯示「序號無效」**：確認序號在序號試算表的指定工作表（預設「工作表二」）A 欄；比對會忽略空白與大小寫。
- **序號登入顯示「服務帳戶沒有試算表權限」**：將序號試算表共用給 Service Account 的 `client_email`（至少「檢視者」；要自動回填 B～D 欄則需「編輯者」）。
- **序號登入成功，但 B／C／D 欄沒有資料**：確認服務帳戶對該試算表是「編輯者」，且 `serialSheet.hasHeader` 與實際表格一致（第 1 列是標題就設 `true`）；詳細原因請看主程序 console 的「回填登入資料失敗」警告。
- **序號登入顯示「無法連線至序號驗證服務」**：確認網路。若只是暫時斷線，已登入者會保留登入狀態，不會被強制登出。
- **序號登入顯示「序號清單目前為空」**：序號試算表的工作表 A 欄目前沒有任何資料，請填入序號。
- **Google 登入顯示「請聯絡小融，幫你開通帳號…」**：你的 Google 帳號不在授權清單內，
  請確認「工作表3」A 欄（從第 2 列開始）已加入你的 Gmail，或請管理員協助開通。
- **Google 登入顯示「無法驗證帳號授權…」**：確認「工作表3」存在、`allowedAccounts.sheetId` 正確，
  且試算表已分享給服務帳戶（至少「檢視者」）；若為網路問題，請確認連線後重試。
- **Google 登入與序號登入可以並存嗎？** 兩者為互斥的工作階段：登入其中一種時，App 會清除另一種的本機登入狀態。
