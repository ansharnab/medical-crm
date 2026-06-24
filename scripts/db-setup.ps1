# Create databases (dev + test + staging), run migrations, optional seed
param(
  [switch]$Seed,
  [switch]$TestOnly,
  [switch]$StagingOnly,
  [switch]$All
)

$root = Split-Path $PSScriptRoot -Parent
$backend = Join-Path $root "backend"

Write-Host "=== Doctor CRM Database Setup ===" -ForegroundColor Cyan

Push-Location $backend

$args = @()
if ($Seed) { $args += "--seed" }
if ($TestOnly) { $args += "--test-only" }
if ($StagingOnly) { $args += "--staging-only" }
if ($All) { $args += "--all" }

npm run db:setup -- @args

Pop-Location

Write-Host "`nDatabases:" -ForegroundColor Green
Write-Host "  doctor_crm            (dev)        → DATABASE_URL"
Write-Host "  doctor_crm_test       (tests)      → TEST_DATABASE_URL"
Write-Host "  doctor_crm_staging    (staging)    → STAGING_DATABASE_URL"
Write-Host "  doctor_crm_production (production) → PRODUCTION_DATABASE_URL"
