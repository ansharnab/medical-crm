# Seed staging DB with demo data (one-time)
$root = Split-Path $PSScriptRoot -Parent
Push-Location (Join-Path $root "backend")
Write-Host "Seeding staging database (doctor_crm_staging)..." -ForegroundColor Cyan
npm run seed:staging
Pop-Location
Write-Host "Done. Staging API: npm run dev:staging (port 4002)" -ForegroundColor Green
