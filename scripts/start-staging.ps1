# Doctor CRM — start staging API (port 4002) + frontend
param(
  [switch]$ApiOnly
)

$root = Split-Path $PSScriptRoot -Parent
$pgBin = Join-Path $root ".local\postgres\pgsql\bin"
$pgData = Join-Path $root ".local\postgres\data"
$pgLog = Join-Path $root ".local\postgres\postgres.log"
$redis = Join-Path $root ".local\redis\redis-server.exe"
$redisConf = Join-Path $root ".local\redis\redis.windows.conf"

Write-Host "=== Doctor CRM Staging Stack ===" -ForegroundColor Cyan

$pgStatus = & "$pgBin\pg_ctl.exe" -D $pgData status 2>&1 | Out-String
if ($pgStatus -notmatch "server is running") {
  Write-Host "Starting PostgreSQL..."
  & "$pgBin\pg_ctl.exe" -D $pgData -l $pgLog start | Out-Null
  Start-Sleep -Seconds 2
}

$redisPing = & (Join-Path $root ".local\redis\redis-cli.exe") ping 2>&1
if ($redisPing -notmatch "PONG") {
  Write-Host "Starting Redis..."
  Start-Process -FilePath $redis -ArgumentList $redisConf -WindowStyle Hidden
  Start-Sleep -Seconds 2
}

Push-Location (Join-Path $root "backend")
Write-Host "Ensuring staging DB is migrated..." -ForegroundColor Yellow
npm run db:setup:staging 2>$null
Pop-Location

Write-Host ""
Write-Host "Starting staging API (4002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run dev:staging"

if (-not $ApiOnly) {
  Write-Host "Starting frontend (5173) — point VITE_API_URL to http://localhost:4002 if needed" -ForegroundColor Yellow
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; `$env:VITE_API_URL='http://localhost:4002'; npm run dev"
}

Write-Host ""
Write-Host "Staging API: http://localhost:4002/health" -ForegroundColor Green
Write-Host "Database:    doctor_crm_staging" -ForegroundColor Green
Write-Host "Env file:    backend/.env.staging" -ForegroundColor Green
