#!/usr/bin/env node
/**
 * 將 GCP 下載的 Service Account 金鑰 JSON 併入 resources/google-credentials.json。
 *
 * 只覆寫 `serviceAccount` 欄位，其餘設定（oauthClientId、spreadsheetId、serialSheet…）原樣保留，
 * 避免使用者手動複製 private_key 時把換行貼壞。
 *
 * 用法：
 *   node scripts/import-service-account.cjs ~/Downloads/your-project-xxxx.json
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const repo = path.resolve(__dirname, '..')
const target = path.join(repo, 'resources/google-credentials.json')
const source = process.argv[2]

function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

function info(message) {
  console.log(`  ${message}`)
}

if (!source || source === '-h' || source === '--help') {
  console.log(`
用法：node scripts/import-service-account.cjs <service-account-key.json>

把 GCP 下載的 Service Account 金鑰併入 ${path.relative(repo, target)}。
只會更新 serviceAccount 欄位，其他設定維持不變。
`)
  process.exit(source ? 0 : 1)
}

const sourcePath = path.resolve(process.cwd(), source)
if (!fs.existsSync(sourcePath)) fail(`找不到金鑰檔：${sourcePath}`)

let key
try {
  key = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'))
} catch (err) {
  fail(`金鑰檔不是合法 JSON：${err.message}`)
}

if (key.type !== 'service_account') {
  fail(`金鑰檔 type 應為 "service_account"，目前是 ${JSON.stringify(key.type)}`)
}
if (!key.client_email || !/^[^\s@]+@[^\s@]+$/.test(key.client_email)) {
  fail('金鑰檔缺少有效的 client_email')
}
if (!key.private_key) fail('金鑰檔缺少 private_key')

try {
  crypto.createPrivateKey(key.private_key)
} catch {
  fail('private_key 無法解析，請確認是完整的金鑰 JSON（勿手動修改換行）')
}

let config = {}
if (fs.existsSync(target)) {
  try {
    config = JSON.parse(fs.readFileSync(target, 'utf-8'))
  } catch (err) {
    fail(`既有 ${path.relative(repo, target)} 不是合法 JSON：${err.message}`)
  }
}

config.serviceAccount = key
fs.writeFileSync(target, `${JSON.stringify(config, null, 2)}\n`, 'utf-8')

console.log('\n✔ 已匯入 Service Account 金鑰')
info(`檔案：${path.relative(repo, target)}`)
info(`專案：${key.project_id || '(未提供)'}`)
info(`帳號：${key.client_email}`)
console.log(`
下一步（若尚未完成）：
  1. 將序號試算表共用給 ${key.client_email}（至少「檢視者」）
  2. 在 GCP 專案啟用 Google Sheets API
  3. 執行 node scripts/check-google-setup.cjs 驗證
`)
