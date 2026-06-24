# Doctor CRM — start local dev stack (portable Postgres + Redis + API + UI)
$root = Split-Path $PSScriptRoot -Parent
$pgBin = Join-Path $root ".local\postgres\pgsql\bin"
$pgData = Join-Path $root ".local\postgres\data"
$pgLog = Join-Path $root ".local\postgres\postgres.log"
$redis = Join-Path $root ".local\redis\redis-server.exe"
$redisConf = Join-Path $root ".local\redis\redis.windows.conf"

Write-Host "=== Doctor CRM Dev Stack ===" -ForegroundColor Cyan

# PostgreSQL
$pgStatus = & "$pgBin\pg_ctl.exe" -D $pgData status 2>&1 | Out-String
if ($pgStatus -notmatch "server is running") {
  Write-Host "Starting PostgreSQL..."
  & "$pgBin\pg_ctl.exe" -D $pgData -l $pgLog start | Out-Null
  Start-Sleep -Seconds 2
} else {
  Write-Host "PostgreSQL already running"
}

# Redis
$redisPing = & (Join-Path $root ".local\redis\redis-cli.exe") ping 2>&1
if ($redisPing -notmatch "PONG") {
  Write-Host "Starting Redis..."
  Start-Process -FilePath $redis -ArgumentList $redisConf -WindowStyle Hidden
  Start-Sleep -Seconds 2
} else {
  Write-Host "Redis already running"
}

Write-Host ""
Write-Host "Starting backend (4001) and frontend (5173) in new windows..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"
Start-Sleep -Seconds 4

Write-Host ""
Write-Host "App:     http://localhost:5173" -ForegroundColor Green
Write-Host "API:     http://localhost:4001/health" -ForegroundColor Green
Write-Host "HTML demo: $root\docs\design\wireframe-demo.html" -ForegroundColor Green
Write-Host ""
Write-Host "Login: reception@democlinic.com / Demo@123456"
