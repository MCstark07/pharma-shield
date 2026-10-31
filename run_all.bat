@echo off
title PharmaShield - Master Tripartite Launcher
color 0b

echo ==============================================================================
echo       PHARMASHIELD - TRIPARTITE MEDICAL LOGISTICS ^& CYBERSECURITY PLATFORM
echo       Hackathon: Securathon 2026 (IIIT Bhagalpur) ^| Track 2: Cybersecurity
echo ==============================================================================
echo.

:: Ensure current working directory is the script folder
cd /d "%~dp0"

echo [1/5] Checking Python Environment...
set "PYTHON_EXE=python"
if exist "backend\venv\Scripts\python.exe" (
    set "PYTHON_EXE=backend\venv\Scripts\python.exe"
    echo [OK] Using virtual environment Python: backend\venv
) else (
    echo [OK] Using system Python
)

echo.
echo [2/5] Initializing Database ^& Seeding Centers...
"%PYTHON_EXE%" backend\scripts\seed.py
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Seed script notice. Proceeding with launch...
)

echo.
echo [3/5] Cleaning any stale processes on Ports 8000, 5173, 5174, 5175...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5175') do taskkill /f /pid %%a >nul 2>&1

echo.
echo [4/5] Launching Central Backend and 3 Portals in Dedicated Windows...

:: Launch Central Backend
start "PharmaShield - Backend (:8000)" /D "%~dp0" cmd /k "%PYTHON_EXE% -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

:: Launch Portal 1: Doctor/Patient (:5173)
start "PharmaShield - Portal 1: Doctor/Patient (:5173)" /D "%~dp0portal-doctor-patient" cmd /k "npm run dev"

:: Launch Portal 2: Pharma Ops (:5174)
start "PharmaShield - Portal 2: Pharma Ops (:5174)" /D "%~dp0portal-pharma-ops" cmd /k "npm run dev"

:: Launch Portal 3: Cyber Lab (:5175)
start "PharmaShield - Portal 3: Cyber Lab (:5175)" /D "%~dp0portal-cyber-lab" cmd /k "npm run dev"

echo.
echo [5/5] Waiting for services to initialize...
echo Starting in 6 seconds...
timeout /t 6 /nobreak >nul

echo [*] Opening Browser Tabs...
start http://localhost:5173
start http://localhost:5174
start http://localhost:5175
start http://localhost:8000/docs

echo.
echo ==============================================================================
echo [SUCCESS] PharmaShield Tripartite Platform is LIVE!
echo.
echo   - Central Backend ^& WebSocket Bus:  http://localhost:8000  (Docs: /docs)
echo   - Portal 1: Clinical (Doctor/Pt):   http://localhost:5173  (Bio-Vial ^& Matter.js)
echo   - Portal 2: Pharma Operations Hub:  http://localhost:5174  (3D Conduits ^& Ed25519)
echo   - Portal 3: Cyber Attack ^& Defense: http://localhost:5175  (Cyber Grid ^& Deflection)
echo.
echo NOTE: Keep the 4 background command windows open.
echo To shut down all services, close the 4 command windows.
echo ==============================================================================
echo.
pause
