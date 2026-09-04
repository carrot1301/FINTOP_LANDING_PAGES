@echo off
setlocal enabledelayedexpansion
title FinTop Backend Logs
color 0A
cls

echo =======================================================================
echo               FINTOP BACKEND DEVELOPER LAUNCHER
echo =======================================================================
echo.
echo [1/4] Navigating to Project Root...
cd /d "%~dp0"
if !errorlevel! neq 0 (
    echo [ERROR] Failed to navigate to project root folder.
    pause
    exit /b 1
)
echo [OK] Located project root: %cd%
echo.

echo [2/4] Checking Node.js availability...
node -v >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Node.js is not installed or not in system PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [OK] Node.js is available: !NODE_VER!
echo.

echo [3/4] Checking Docker / Container services...
docker -v >nul 2>&1
if !errorlevel! neq 0 (
    echo [INFO] Docker CLI is not installed or not in system PATH.
) else (
    echo [OK] Docker CLI is available.
    echo Checking Docker Daemon status...
    docker info >nul 2>&1
    if !errorlevel! neq 0 (
        echo [WARNING] Docker Desktop / Daemon is NOT running!
        echo Standard containers PostgreSQL and Redis could not be auto-started by Docker.
    ) else (
        echo Launching PostgreSQL and Redis via docker-compose...
        docker-compose -f fintop-backend\docker-compose.yml up -d >nul 2>&1
        if !errorlevel! neq 0 (
            docker compose -f fintop-backend\docker-compose.yml up -d >nul 2>&1
        )
        echo [OK] Docker containers launched.
    )
)

echo.
echo Checking Redis service (Port 6379)...
set REDIS_RUNNING=0
for /f "tokens=*" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr /C:":6379 " 2^>nul') do (
    set REDIS_RUNNING=1
)
if !REDIS_RUNNING! equ 0 (
    echo [INFO] Redis is not active on port 6379. Attempting to start local Redis...
    if exist "C:\Program Files\Redis\redis-server.exe" (
        start "" /b "C:\Program Files\Redis\redis-server.exe" "C:\Program Files\Redis\redis.windows.conf" >nul 2>&1
        echo [OK] Launched local Redis server executable.
    ) else (
        echo [INFO] Local Redis executable not found. Backend will start in fallback mode.
    )
) else (
    echo [OK] Redis is active on port 6379.
)

if exist "C:\Program Files\Redis\redis-cli.exe" (
    "C:\Program Files\Redis\redis-cli.exe" config set stop-writes-on-bgsave-error no >nul 2>&1
)

:check_port
echo.
echo Checking if port 3000 is already in use...
set PORT_BUSY=0
for /f "tokens=*" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr /C:":3000 " 2^>nul') do (
    set PORT_BUSY=1
)
if !PORT_BUSY! equ 1 (
    echo.
    echo [WARNING] Port 3000 is ALREADY occupied by another process!
    echo An existing backend or other service is already running.
    echo.
    echo If this is your active backend, no need to start another.
    echo To force stop, run: STOP_FINTOP_DEV.bat
    echo.
    pause
    exit /b 0
)
echo [OK] Port 3000 is free. Proceeding to launch...
echo.

echo [4/4] Starting NestJS Backend Server...
cd /d "%~dp0fintop-backend"
if !errorlevel! neq 0 (
    echo [ERROR] Failed to navigate to fintop-backend folder.
    echo Expected folder: %~dp0fintop-backend
    pause
    exit /b 1
)
echo Working directory: %cd%
echo.
echo =======================================================================
echo               STARTING BACKEND (npm run start)...
echo     Press Ctrl+C to stop the server.
echo =======================================================================
echo.
call npm run start
echo.
echo =======================================================================
echo     Backend server has stopped.
echo =======================================================================
echo.
pause
