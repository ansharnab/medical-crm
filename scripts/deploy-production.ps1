# Production deploy via Docker Compose
param(
  [switch]$Build,
  [switch]$MigrateOnly
)

$root = Split-Path $PSScriptRoot -Parent
$docker = Join-Path $root "docker"

Write-Host "=== Doctor CRM Production Deploy ===" -ForegroundColor Cyan
Write-Host "MaatriDev · info@maatridev.com · 9211611187" -ForegroundColor DarkGray

if (-not (Test-Path (Join-Path $root "backend\.env.production"))) {
  Write-Host "Copy backend\.env.production.example to backend\.env.production and set secrets first." -ForegroundColor Yellow
  exit 1
}

Push-Location $docker

$compose = "docker compose -f docker-compose.yml -f docker-compose.prod.yml"

if ($MigrateOnly) {
  Invoke-Expression "$compose run --rm backend npm run migrate:production"
  Pop-Location
  exit 0
}

if ($Build) {
  Invoke-Expression "$compose build"
}

Invoke-Expression "$compose up -d postgres redis"
Write-Host "Waiting for Postgres..." -ForegroundColor Yellow
Start-Sleep -Seconds 8
Invoke-Expression "$compose up -d backend frontend"

Pop-Location

Write-Host ""
Write-Host "Production stack starting:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173"
Write-Host "  API:      http://localhost:4000/health"
Write-Host "  DB:       doctor_crm_production"
Write-Host ""
Write-Host "Configure MSG91_AUTH_KEY + SMTP in backend/.env.production for live SMS/email."
