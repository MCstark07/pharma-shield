# PharmaShield - PowerShell Tripartite Platform Launcher
# Hackathon: Securathon 2026 (IIIT Bhagalpur) | Track 2: Cybersecurity

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "      PHARMASHIELD - TRIPARTITE MEDICAL LOGISTICS & CYBERSECURITY PLATFORM" -ForegroundColor Cyan
Write-Host "      Hackathon: Securathon 2026 (IIIT Bhagalpur) | Track 2: Cybersecurity" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# 1. Determine Python Executable
Write-Host "[1/5] Checking Python Environment..." -ForegroundColor Yellow
$VenvPython = Join-Path $ScriptDir "backend\venv\Scripts\python.exe"
if (Test-Path $VenvPython) {
    $PythonExe = $VenvPython
    Write-Host "[OK] Using virtual environment Python: $PythonExe" -ForegroundColor Green
} else {
    $PythonExe = "python"
    Write-Host "[OK] Using system Python" -ForegroundColor Green
}

# 2. Seed Database
Write-Host "`n[2/5] Initializing Database & Seed Data..." -ForegroundColor Yellow
try {
    & $PythonExe "backend\scripts\seed.py"
    Write-Host "[OK] Seed complete." -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Seed notice: $_" -ForegroundColor DarkYellow
}

# 3. Clean any stale processes on the 4 ports
Write-Host "`n[3/5] Cleaning ports 8000, 5173, 5174, 5175..." -ForegroundColor Yellow
@(8000, 5173, 5174, 5175) | ForEach-Object {
    $port = $_
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $connections | ForEach-Object {
            try {
                Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
            } catch {}
        }
    }
}

# 4. Launch Services in Separate Windows
Write-Host "`n[4/5] Launching Central Backend and 3 Portals..." -ForegroundColor Yellow

$BackendCmd = "cd /d `"$ScriptDir`" && $PythonExe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"
Start-Process "cmd.exe" -ArgumentList @('/k', $BackendCmd) -WindowStyle Normal

$Portal1Dir = Join-Path $ScriptDir "portal-doctor-patient"
$Portal1Cmd = "cd /d `"$Portal1Dir`" && npm run dev"
Start-Process "cmd.exe" -ArgumentList @('/k', $Portal1Cmd) -WindowStyle Normal

$Portal2Dir = Join-Path $ScriptDir "portal-pharma-ops"
$Portal2Cmd = "cd /d `"$Portal2Dir`" && npm run dev"
Start-Process "cmd.exe" -ArgumentList @('/k', $Portal2Cmd) -WindowStyle Normal

$Portal3Dir = Join-Path $ScriptDir "portal-cyber-lab"
$Portal3Cmd = "cd /d `"$Portal3Dir`" && npm run dev"
Start-Process "cmd.exe" -ArgumentList @('/k', $Portal3Cmd) -WindowStyle Normal

# 5. Wait & Open Browser Tabs
Write-Host "`n[5/5] Waiting 6 seconds for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 6

Write-Host "[*] Opening browser tabs..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"
Start-Process "http://localhost:5174"
Start-Process "http://localhost:5175"
Start-Process "http://localhost:8000/docs"

Write-Host "`n==============================================================================" -ForegroundColor Green
Write-Host "[SUCCESS] PharmaShield Tripartite Platform is LIVE!" -ForegroundColor Green
Write-Host '  - Central Backend & WebSocket Bus:  http://localhost:8000  (Docs: /docs)' -ForegroundColor White
Write-Host '  - Portal 1: Clinical (Doctor/Pt):   http://localhost:5173  (Bio-Vial & Matter.js)' -ForegroundColor White
Write-Host '  - Portal 2: Pharma Operations Hub:  http://localhost:5174  (3D Conduits & Ed25519)' -ForegroundColor White
Write-Host '  - Portal 3: Cyber Attack & Defense: http://localhost:5175  (Cyber Grid & Deflection)' -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Green
