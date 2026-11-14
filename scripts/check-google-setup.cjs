/**
 * Google 設定自我檢查腳本（開發輔助，不會修改試算表資料）
 *
 * 使用方式：
 *   node scripts/check-google-setup.cjs
 *
 * 亦可指定其他憑證檔：
 *   GOOGLE_CREDENTIALS_FILE=/絕對路徑/google-credentials.json node scripts/check-google-setup.cjs
 *
 * 檢查項目：憑證檔格式、OAuth Client ID 有效性、Service Account 金鑰、
 * 試算表讀寫權限與標題列、序號清單、授權 Gmail 清單。輸出會遮蔽敏感資訊。
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const repo = path.resolve(__dirname, '..')
const file =
  process.env.GOOGLE_CREDENTIALS_FILE || path.join(repo, 'resources', 'google-credentials.json')

const EXPECTED_HEADERS = [
  '時間', '使用者 Email', '使用者名稱', '事件', '圖片檔名',
  '模型', '產生張數', '花費額度 (USD)', '費用類型', '狀態'
]

const ok = (m) => console.log('  ✅ ' + m)
const warn = (m) => console.log('  ⚠️  ' + m)
const bad = (m) => console.log('  ❌ ' + m)
const info = (m) => console.log('     ' + m)

const mask = (v) => {
  if (v === undefined || v === null || v === '') return '(空)'
  const s = String(v)
  if (s.length <= 12) return `${'*'.repeat(s.length)} (長度 ${s.length})`
  return `${s.slice(0, 6)}…${s.slice(-6)} (長度 ${s.length})`
}

function describeError(err) {
  const status = err?.response?.status ?? err?.code
  const msg = err?.response?.data?.error?.message || err?.message || String(err)
  return `[${status || 'n/a'}] ${msg}`
}

function quoteSheet(title) {
  return `'${String(title).replace(/'/g, "''")}'`
}

async function main() {
  console.log('=== 1. 憑證檔 ===')
  if (!fs.existsSync(file)) {
    bad(`找不到憑證檔：${file}`)
    return
  }
  const stat = fs.statSync(file)
  ok(`檔案存在：${file}`)
  info(`大小 ${stat.size} bytes，最後修改 ${stat.mtime.toISOString()}`)
  try {
    fs.accessSync(file, fs.constants.R_OK)
    ok('檔案可讀取')
  } catch {
    bad('檔案無法讀取（權限問題）')
  }

  console.log('\n=== 2. JSON 結構 ===')
  let cfg
  try {
    cfg = JSON.parse(fs.readFileSync(file, 'utf-8'))
    ok('JSON 格式正確')
  } catch (err) {
    bad(`JSON 解析失敗：${err.message}`)
    return
  }
  info(`頂層欄位：${Object.keys(cfg).join(', ')}`)

  console.log('\n=== 3. OAuth 設定 ===')
  if (typeof cfg.oauthClientId === 'string' && cfg.oauthClientId.trim()) {
    ok(`oauthClientId：${mask(cfg.oauthClientId)}`)
    if (/\.apps\.googleusercontent\.com$/.test(cfg.oauthClientId)) ok('格式正確（…apps.googleusercontent.com）')
    else bad('格式異常，應以 .apps.googleusercontent.com 結尾')
    if (/\s/.test(cfg.oauthClientId)) bad('含有空白字元，請重新複製')
  } else {
    bad('缺少 oauthClientId（登入功能會失敗）')
  }
  info(`oauthClientSecret：${cfg.oauthClientSecret ? mask(cfg.oauthClientSecret) : '(未填，Desktop app + PKCE 可留空)'}`)

  console.log('\n=== 4. Service Account ===')
  const sa = cfg.serviceAccount
  if (!sa || typeof sa !== 'object') {
    bad('缺少 serviceAccount')
  } else {
    if (sa.type === 'service_account') ok(`type = ${sa.type}`)
    else bad(`type = ${sa.type ?? '(未設定)'}，應為 service_account`)
    info(`project_id：${sa.project_id || '(空)'}`)
    if (sa.client_email) {
      ok(`client_email：${sa.client_email}`)
      if (/@.+\.iam\.gserviceaccount\.com$/.test(sa.client_email)) ok('client_email 格式正確')
      else bad('client_email 格式異常')
    } else bad('缺少 client_email')
    if (typeof sa.private_key === 'string' && sa.private_key.includes('BEGIN PRIVATE KEY')) {
      ok('private_key 存在（PEM 格式）')
      if (sa.private_key.includes('\\n')) bad('private_key 內含字面 \\n（未轉成真正換行），會導致簽章失敗')
      if (!sa.private_key.includes('\n')) bad('private_key 缺少真正換行字元')
      try {
        const key = crypto.createPrivateKey(sa.private_key.replace(/\\n/g, '\n'))
        ok(`private_key 可解析（${key.asymmetricKeyType}）`)
      } catch (err) {
        bad(`private_key 無法解析：${err.message}`)
      }
    } else bad('缺少 private_key')
  }

  console.log('\n=== 5. 試算表設定 ===')
  if (cfg.spreadsheetId) {
    ok(`spreadsheetId：${cfg.spreadsheetId}`)
    if (!/^[A-Za-z0-9_-]{20,}$/.test(cfg.spreadsheetId)) warn('spreadsheetId 看起來不像標準格式（仍可嘗試）')
  } else {
    warn('未填 spreadsheetId（若改填 driveFolderId 則由 App 自動建立）')
  }
  info(`driveFolderId：${cfg.driveFolderId || '(未填)'}`)
  info(`spreadsheetName：${cfg.spreadsheetName || '(未填，預設 Wishful AI Draw 使用記錄)'}`)
  if (!cfg.spreadsheetId && !cfg.driveFolderId) bad('spreadsheetId 與 driveFolderId 至少要填一個')

  await checkOauthClient(cfg)
  await checkServiceAccount(cfg, sa)
  await checkSerialSheet(cfg)
  await checkAllowedAccounts(cfg)
  console.log('\n=== 檢查完成 ===')
}

async function probeClientType(clientId) {
  const challenge = crypto.createHash('sha256').update('x'.repeat(64)).digest('base64url')
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', 'http://127.0.0.1:45678')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('state', 'probe')
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('access_type', 'offline')

  const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) })
  if (res.status >= 300 && res.status < 400) {
    return { type: 'desktop', detail: `HTTP ${res.status}（導向 Google 登入頁）` }
  }
  const text = await res.text().catch(() => '')
  if (/redirect_uri_mismatch/.test(text)) {
    return { type: 'web', detail: 'redirect_uri_mismatch（loopback 未註冊）' }
  }
  if (/invalid_client|unauthorized_client/i.test(text)) {
    return { type: 'invalid', detail: `HTTP ${res.status}（Client ID 無效）` }
  }
  return { type: 'unknown', detail: `HTTP ${res.status}` }
}

async function checkOauthClient(cfg) {
  console.log('\n=== 6. OAuth Client ID 是否有效（Google 端驗證） ===')
  if (!cfg.oauthClientId) return

  // (a) 用戶端類型：Desktop app 會接受任意 127.0.0.1 埠的 loopback redirect
  try {
    const type = await probeClientType(cfg.oauthClientId)
    if (type.type === 'desktop') ok(`用戶端類型正確：電腦版應用程式（Desktop app）— ${type.detail}`)
    else if (type.type === 'web') bad(`用戶端類型錯誤：Web 應用程式（${type.detail}），請改用 Desktop app 類型`)
    else if (type.type === 'invalid') bad(`Client ID 無效（${type.detail}）`)
    else warn(`無法判定用戶端類型（${type.detail}）`)
  } catch (err) {
    warn(`無法判定用戶端類型（網路問題）：${describeError(err)}`)
  }

  // (b) token 端點是否要求 client_secret
  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: 'invalid-test-code',
      client_id: cfg.oauthClientId,
      redirect_uri: 'http://127.0.0.1:45678',
      code_verifier: 'a'.repeat(64)
    })
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(15000)
    })
    const payload = await res.json().catch(() => ({}))
    const code = payload.error || ''
    if (code === 'invalid_grant') {
      ok('token 交換未要求 client_secret（回傳 invalid_grant，屬預期結果）')
    } else if (code === 'invalid_client') {
      bad('Client ID 或 Client Secret 不正確（invalid_client）')
    } else if (/client[_ ]?secret/i.test(JSON.stringify(payload))) {
      if (cfg.oauthClientSecret) {
        ok('client_secret 已填寫（Google 要求此用戶端提供 client_secret）')
      } else {
        bad('此用戶端要求 client_secret，但 oauthClientSecret 為空 → 登入會在交換 token 時失敗')
        info('請到 GCP「憑證」點擊該 OAuth 用戶端 ID，複製「用戶端密碼」填入 oauthClientSecret')
      }
      info(JSON.stringify(payload))
    } else {
      warn(`未預期的回應：HTTP ${res.status} ${JSON.stringify(payload)}`)
    }
  } catch (err) {
    warn(`無法驗證 Client ID（網路問題）：${describeError(err)}`)
  }
}

async function checkServiceAccount(cfg, sa) {
  console.log('\n=== 7. Service Account 實際連線驗證 ===')
  if (!sa?.client_email || !sa?.private_key) {
    bad('缺少 Service Account 資訊，略過')
    return
  }

  const { google } = require(path.join(repo, 'node_modules/googleapis'))
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: sa.client_email,
      private_key: sa.private_key.replace(/\\n/g, '\n')
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ]
  })

  try {
    const client = await auth.getClient()
    const token = await client.getAccessToken()
    if (token?.token) ok('Service Account 成功取得 access token（金鑰可用）')
    else bad('無法取得 access token')
  } catch (err) {
    bad(`取得 access token 失敗：${describeError(err)}`)
    return
  }

  const sheets = google.sheets({ version: 'v4', auth })
  const drive = google.drive({ version: 'v3', auth })

  if (!cfg.spreadsheetId) {
    await checkFolder(cfg, drive, sa)
    return
  }

  let firstSheetTitle = 'Sheet1'
  try {
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: cfg.spreadsheetId,
      fields: 'properties(title),sheets(properties(title,index,gridProperties(rowCount,columnCount)))'
    })
    const title = meta.data.properties?.title || '(無標題)'
    const props = (meta.data.sheets || []).map((s) => s.properties)
    firstSheetTitle = props[0]?.title || 'Sheet1'
    ok(`Sheets API 可讀取試算表：「${title}」`)
    info(
      `工作表（共 ${props.length} 個）：` +
        props.map((p) => `#${p.index} ${p.title} (${p.gridProperties?.rowCount}x${p.gridProperties?.columnCount})`).join(' | ')
    )
    if (props.length > 1) warn(`App 固定寫入「第一個」工作表（#0 ${firstSheetTitle}），請確認那是記錄頁`)
  } catch (err) {
    const msg = describeError(err)
    bad(`無法讀取試算表：${msg}`)
    if (/has not been used in project|disabled|SERVICE_DISABLED/i.test(msg)) {
      info('→ 請在 GCP 專案啟用 Google Sheets API')
    } else if (/not found|404/i.test(msg)) {
      info('→ 請確認 spreadsheetId 是否正確')
    } else if (/permission|403|forbidden/i.test(msg)) {
      info(`→ 請將試算表共用給 ${sa.client_email}（編輯者）`)
    }
    return
  }

  try {
    const caps = await drive.files.get({
      fileId: cfg.spreadsheetId,
      fields: 'name,capabilities(canEdit),owners(emailAddress)',
      supportsAllDrives: true
    })
    const canEdit = caps.data.capabilities?.canEdit
    if (canEdit) ok('Service Account 具備編輯權限（canEdit = true）')
    else bad('Service Account 沒有編輯權限 → 請將試算表共用給它並設為「編輯者」')
    info(`檔案名稱：${caps.data.name}，擁有者：${caps.data.owners?.[0]?.emailAddress || '(未取得)'}`)
  } catch (err) {
    const msg = describeError(err)
    warn(`無法透過 Drive API 檢查權限：${msg}`)
    if (/has not been used in project|disabled|SERVICE_DISABLED/i.test(msg)) {
      info('→ 請在 GCP 專案啟用 Google Drive API')
    }
  }

  let headers = []
  try {
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId: cfg.spreadsheetId,
      range: `${quoteSheet(firstSheetTitle)}!A1:J1`
    })
    headers = values.data.values?.[0] || []
  } catch (err) {
    warn(`無法讀取標題列：${describeError(err)}`)
  }

  const sameHeaders = headers.length > 0 && EXPECTED_HEADERS.every((h, i) => (headers[i] || '') === h)
  if (headers.length === 0) {
    warn('第一個工作表 A1:J1 為空（App 首次寫入時會自動補上標題列）')
  } else {
    info(`現有標題：${headers.join(' | ')}`)
    if (sameHeaders) ok('標題列與 App 預期完全一致（A~J）')
    else {
      warn('標題列與 App 預期不同（App 不會覆寫既有標題，僅從下一列追加資料）')
      info(`App 預期：${EXPECTED_HEADERS.join(' | ')}`)
    }
  }

  if (headers.length === 0 || sameHeaders) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: cfg.spreadsheetId,
        range: `${quoteSheet(firstSheetTitle)}!A1:J1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers.length === 0 ? EXPECTED_HEADERS : headers.slice(0, 10)] }
      })
      ok('Sheets API 寫入測試成功（標題列內容無變更）')
    } catch (err) {
      bad(`Sheets API 寫入失敗：${describeError(err)}`)
      info(`→ 請確認試算表已共用給 ${sa.client_email} 且權限為「編輯者」`)
    }
  } else {
    warn('略過寫入測試（避免覆寫你自訂的標題列）；寫入權限已由 canEdit 驗證')
  }

  info(`試算表連結：https://docs.google.com/spreadsheets/d/${cfg.spreadsheetId}/edit`)
}

async function checkFolder(cfg, drive, sa) {
  if (!cfg.driveFolderId) return
  try {
    const folder = await drive.files.get({
      fileId: cfg.driveFolderId,
      fields: 'name,mimeType,capabilities(canEdit),owners(emailAddress)',
      supportsAllDrives: true
    })
    ok(`Drive API 可讀取資料夾：「${folder.data.name}」（${folder.data.mimeType}）`)
    info(`擁有者：${folder.data.owners?.[0]?.emailAddress || '(未取得)'}`)
    if (folder.data.capabilities?.canEdit) ok('Service Account 對資料夾具備編輯權限')
    else bad('Service Account 對資料夾沒有編輯權限 → 請設為「編輯者」')
  } catch (err) {
    const msg = describeError(err)
    bad(`無法讀取資料夾：${msg}`)
    if (/has not been used in project|disabled|SERVICE_DISABLED/i.test(msg)) {
      info('→ 請在 GCP 專案啟用 Google Drive API')
    } else if (/permission|403|forbidden|not found/i.test(msg)) {
      info(`→ 請將資料夾共用給 ${sa.client_email}（編輯者），並確認 ID 正確`)
    }
  }
}

/** 檢查序號登入用的試算表（工作表二 A 欄）是否可讀取 */
async function checkSerialSheet(cfg) {
  console.log('\n=== 8. 序號登入試算表（選用） ===')
  const serial = cfg.serialSheet || {}
  const spreadsheetId = serial.spreadsheetId || cfg.spreadsheetId
  const sa = cfg.serviceAccount

  if (!spreadsheetId) {
    warn('未設定序號試算表（serialSheet.spreadsheetId 或 spreadsheetId），序號登入將無法使用')
    return
  }
  if (!sa?.client_email || !sa?.private_key) {
    bad('缺少 Service Account 資訊，無法檢查序號試算表')
    return
  }

  const sheetId = serial.sheetId === undefined ? undefined : Number(serial.sheetId)
  const sheetTitle = String(serial.sheetTitle || '').trim()
  const column = String(serial.column || 'A').replace(/[^A-Za-z]/g, '').toUpperCase() || 'A'
  const hasHeader = serial.hasHeader === true

  info(`序號試算表：${spreadsheetId}`)
  info(
    `目標工作表：${sheetTitle || (sheetId !== undefined ? `gid=${sheetId}` : '第一個工作表')}；` +
      `欄位 ${column}${hasHeader ? '（第 1 列為標題列）' : '（從第 1 列開始）'}`
  )

  const { google } = require(path.join(repo, 'node_modules/googleapis'))
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: sa.client_email,
      private_key: sa.private_key.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
  const sheets = google.sheets({ version: 'v4', auth })

  let title = sheetTitle
  try {
    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets(properties(title,sheetId))'
    })
    const list = meta.data.sheets || []
    if (!title) {
      const matched =
        sheetId !== undefined ? list.find((s) => s.properties?.sheetId === sheetId) : list[0]
      title = matched?.properties?.title || ''
      if (!title) {
        bad(`找不到 gid=${sheetId} 的工作表`)
        info(
          `→ 現有工作表：${list
            .map((s) => `${s.properties?.title} (gid=${s.properties?.sheetId})`)
            .join(' | ')}`
        )
        return
      }
    }
    ok(`試算表可讀取，工作表：「${title}」`)
  } catch (err) {
    const msg = describeError(err)
    bad(`無法讀取序號試算表：${msg}`)
    if (/permission|403|forbidden/i.test(msg)) {
      info(`→ 請將序號試算表共用給 ${sa.client_email}（至少「檢視者」）`)
    } else if (/has not been used in project|disabled|SERVICE_DISABLED/i.test(msg)) {
      info('→ 請在 GCP 專案啟用 Google Sheets API')
    } else if (/not found|404/i.test(msg)) {
      info('→ 請確認 serialSheet.spreadsheetId 是否正確')
    }
    return
  }

  try {
    const range = `${quoteSheet(title)}!${column}:${column}`
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range })
    const rows = res.data.values || []
    const dataRows = hasHeader ? rows.slice(1) : rows
    const keys = dataRows
      .map((row) => String((row && row[0]) || '').replace(/\s+/g, '').toUpperCase())
      .filter(Boolean)
    if (keys.length === 0) {
      bad(`「${title}」${column} 欄沒有任何序號（序號登入會顯示「序號清單目前為空」）`)
      info(`→ 請把序號貼在 ${range}`)
    } else {
      ok(`可讀取 ${keys.length} 筆序號（去重後 ${new Set(keys).size} 筆）`)
      info(`讀取範圍：${range}`)
    }
  } catch (err) {
    bad(`無法讀取序號欄位：${describeError(err)}`)
  }

  // 以「原值回寫」驗證寫入權限（不變更任何內容）
  try {
    const profileRange = `${quoteSheet(title)}!B1:D1`
    const existing = await sheets.spreadsheets.values.get({ spreadsheetId, range: profileRange })
    const headerRow = existing.data.values?.[0] || []
    if (headerRow.length === 0) {
      warn(`略過寫入測試：「${title}」B1:D1 沒有內容可原值回寫`)
    } else {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: profileRange,
        valueInputOption: 'RAW',
        requestBody: { values: [headerRow] }
      })
      ok('序號試算表寫入測試成功（原值回寫 B1:D1，內容無變更）')
      info('→ 序號登入後 App 會把名稱／Email／登入時間寫到該序號列的 B～D 欄')
    }
  } catch (err) {
    const msg = describeError(err)
    bad(`序號試算表寫入失敗：${msg}`)
    if (/permission|403|forbidden/i.test(msg)) {
      info(`→ 回填登入資料需要「編輯者」權限，請將試算表共用給 ${sa.client_email}`)
    }
  }
}

/** 遮蔽 Email 中間字元，避免在終端輸出完整帳號 */
function maskEmail(email) {
  const [name, domain] = String(email).split('@')
  if (!name || !domain) return mask(email)
  const head = name.slice(0, Math.min(3, name.length))
  return `${head}${'*'.repeat(Math.max(name.length - head.length, 1))}@${domain}`
}

/** 檢查 Google 登入授權 Gmail 清單（預設工作表3 A 欄）是否可讀取 */
async function checkAllowedAccounts(cfg) {
  console.log('\n=== 9. 授權 Gmail 帳號（Google 登入防護網，選用） ===')
  const allowed = cfg.allowedAccounts || {}
  const spreadsheetId = allowed.spreadsheetId || cfg.spreadsheetId
  const sa = cfg.serviceAccount

  if (!spreadsheetId) {
    warn('未設定授權帳號試算表，Google 登入防護網將無法運作')
    return
  }
  if (!sa?.client_email || !sa?.private_key) {
    bad('缺少 Service Account 資訊，無法檢查授權 Gmail 清單')
    return
  }

  const sheetId = allowed.sheetId === undefined ? 740235806 : Number(allowed.sheetId)
  const sheetTitle = String(allowed.sheetTitle || '').trim()
  const column = String(allowed.column || 'A').replace(/[^A-Za-z]/g, '').toUpperCase() || 'A'
  const hasHeader = allowed.hasHeader !== false

  info(`授權帳號試算表：${spreadsheetId}`)
  info(
    `目標工作表：${sheetTitle || `gid=${sheetId}`}；欄位 ${column}` +
      (hasHeader ? '（第 1 列為標題列）' : '（從第 1 列開始）')
  )

  const { google } = require(path.join(repo, 'node_modules/googleapis'))
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: sa.client_email,
      private_key: sa.private_key.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
  const sheets = google.sheets({ version: 'v4', auth })

  let title = sheetTitle
  try {
    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets(properties(title,sheetId))'
    })
    const list = meta.data.sheets || []
    if (!title) {
      const matched = list.find((s) => s.properties?.sheetId === sheetId)
      title = matched?.properties?.title || ''
      if (!title) {
        bad(`找不到 gid=${sheetId} 的工作表`)
        info(
          `→ 現有工作表：${list
            .map((s) => `${s.properties?.title} (gid=${s.properties?.sheetId})`)
            .join(' | ')}`
        )
        return
      }
    }
    ok(`試算表可讀取，工作表：「${title}」`)
  } catch (err) {
    const msg = describeError(err)
    bad(`無法讀取授權帳號試算表：${msg}`)
    if (/permission|403|forbidden/i.test(msg)) {
      info(`→ 請將授權帳號試算表共用給 ${sa.client_email}（至少「檢視者」）`)
    } else if (/has not been used in project|disabled|SERVICE_DISABLED/i.test(msg)) {
      info('→ 請在 GCP 專案啟用 Google Sheets API')
    } else if (/not found|404/i.test(msg)) {
      info('→ 請確認 allowedAccounts.spreadsheetId 是否正確')
    }
    return
  }

  try {
    const range = `${quoteSheet(title)}!${column}:${column}`
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range })
    const rows = res.data.values || []
    const dataRows = hasHeader ? rows.slice(1) : rows
    const emails = [
      ...new Set(
        dataRows.map((row) => String((row && row[0]) || '').trim().toLowerCase()).filter(Boolean)
      )
    ]
    if (emails.length === 0) {
      bad(`「${title}」${column} 欄沒有任何授權 Gmail（所有 Google 登入都會被阻擋）`)
      info(`→ 請把允許登入的 Gmail 貼在 ${range}（一行一個）`)
    } else {
      ok(`可讀取 ${emails.length} 個授權 Gmail（去重後 ${emails.length} 個）`)
      const masked = emails.slice(0, 3).map(maskEmail)
      info(`範例：${masked.join(' | ')}${emails.length > 3 ? ' …' : ''}`)
      info(`讀取範圍：${range}`)
    }
  } catch (err) {
    bad(`無法讀取授權 Gmail 欄位：${describeError(err)}`)
  }
}

main().catch((err) => {
  console.error('檢查腳本發生未預期錯誤：', err)
  process.exitCode = 1
})
