# Serves wireframe-demo.html and opens Figma export view
$designDir = Join-Path $PSScriptRoot "..\docs\design"
$port = 8765
$url = "http://localhost:$port/wireframe-demo.html?figma=export"

Write-Host ""
Write-Host "=== Doctor CRM → Figma Import ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: Browser khul raha hai (saari screens render hongi)..."
Write-Host "Step 2: Figma Community se FREE plugin install karo (pick one):" -ForegroundColor Yellow
Write-Host "  - tomake.design HTML to Figma (100% free, unlimited)"
Write-Host "  - Yolbridge HTML to Figma (100% free, no signup)"
Write-Host ""
Write-Host "IMPORT (free):" -ForegroundColor Yellow
Write-Host "  A) Plugin mein localhost URL paste: $url"
Write-Host "  B) Page par 'Download .html' → plugin File tab mein upload"
Write-Host "  C) Yolbridge extension → Capture → Figma plugin mein code paste"
Write-Host ""
Write-Host "(html.to.design bhi free hai — 10 imports/month — baaki paid)"
Write-Host ""

$job = Start-Job -ScriptBlock {
  param($dir, $p)
  Set-Location $dir
  python -m http.server $p 2>$null
  if ($LASTEXITCODE -ne 0) { python3 -m http.server $p 2>$null }
} -ArgumentList $designDir, $port

Start-Sleep -Seconds 2
Start-Process $url

Write-Host "Server: $url" -ForegroundColor Green
Write-Host "Band karne ke liye: Stop-Job $($job.Id); Remove-Job $($job.Id)" -ForegroundColor DarkGray
Write-Host ""
