# Oru ERP — Dev Launcher
# Usage: .\dev.ps1            (starts both backend + frontend)
#        .\dev.ps1 -Stop      (kills all dev processes)
#        .\dev.ps1 -Backend   (backend only)
#        .\dev.ps1 -Frontend  (frontend only)

param(
    [switch]$Stop,
    [switch]$Backend,
    [switch]$Frontend
)

$BackendPort  = 5001
$FrontendPort = 5173

function Kill-Port {
    param([int]$Port)
    $pids = netstat -ano 2>$null |
        Select-String ":$Port\s" |
        ForEach-Object { ($_ -split '\s+')[-1] } |
        Sort-Object -Unique |
        Where-Object { $_ -match '^\d+$' -and $_ -ne '0' }

    foreach ($p in $pids) {
        try {
            Stop-Process -Id $p -Force -ErrorAction Stop
            Write-Host "  Killed PID $p (port $Port)" -ForegroundColor Yellow
        } catch {}
    }
}

function Kill-NodeProcesses {
    Get-Process -Name "node","tsx" -ErrorAction SilentlyContinue | ForEach-Object {
        $_ | Stop-Process -Force
        Write-Host "  Killed $($_.Name) PID $($_.Id)" -ForegroundColor Yellow
    }
}

# ── STOP ──────────────────────────────────────────────────────────────────────
if ($Stop) {
    Write-Host "`n🛑 Stopping all dev processes..." -ForegroundColor Cyan
    Kill-Port $BackendPort
    Kill-Port $FrontendPort
    Kill-NodeProcesses
    Write-Host "✅ All stopped.`n" -ForegroundColor Green
    exit 0
}

# ── KILL existing occupants ───────────────────────────────────────────────────
Write-Host "`n🧹 Clearing ports..." -ForegroundColor Cyan
if (-not $Frontend) { Kill-Port $BackendPort }
if (-not $Backend)  { Kill-Port $FrontendPort }
Start-Sleep -Milliseconds 500

# ── START ─────────────────────────────────────────────────────────────────────
if (-not $Frontend) {
    Write-Host "🚀 Starting Backend  (port $BackendPort)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal
}

if (-not $Backend) {
    Write-Host "🚀 Starting Frontend (port $FrontendPort)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal
}

Write-Host @"

✅ Dev servers launching in new windows.
   Backend  → http://localhost:$BackendPort
   Frontend → http://localhost:$FrontendPort

   To stop: .\dev.ps1 -Stop
"@ -ForegroundColor Green
