# Commit all changes with timestamp and push to main (triggers Netlify deploy)
$ErrorActionPreference = "Stop"
$msg = "deploy: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
git add -A
git status -s
if (-not $?) { exit 1 }
git commit -m $msg
if ($LASTEXITCODE -eq 0) { git push origin main } else { Write-Host "Nothing to commit or commit failed." }
