@echo off
setlocal enabledelayedexpansion
title Stop FinTop DATA
color 0C
cls

echo =======================================================================
echo               STOPPING FINTOP DATA DEV SERVERS
echo =======================================================================
echo.

echo [1/4] Stopping processes on port 3000 (Backend)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
echo [OK] Port 3000 cleared.
echo.

echo [2/4] Stopping processes on port 8080 (Frontend)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
echo [OK] Port 8080 cleared.
echo.

echo [3/4] Stopping processes on port 8081 (Frontend Fallback)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
echo [OK] Port 8081 cleared.
echo.

echo [4/4] Stopping processes on port 8000 (ADK Agent Service)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
echo [OK] Port 8000 cleared.
echo.

set /p STOP_DOCKER="Do you also want to stop PostgreSQL/Redis Docker containers? (Y/N): "
if /i "!STOP_DOCKER!" == "Y" (
    echo.
    echo Stopping Docker containers...
    cd /d "%~dp0"
    docker-compose -f fintop-backend\docker-compose.yml down >nul 2>&1
    if !errorlevel! neq 0 (
        docker compose -f fintop-backend\docker-compose.yml down >nul 2>&1
    )
    echo [OK] Docker containers stopped.
) else (
    echo.
    echo Keeping Docker containers running.
)

echo.
echo =======================================================================
echo               ALL FINTOP DEV SERVERS STOPPED SUCCESSFULLY!
echo =======================================================================
echo.
pause
