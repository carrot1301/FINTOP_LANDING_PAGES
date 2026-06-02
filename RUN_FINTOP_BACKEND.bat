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
    echo [INFO] Docker is not installed or not in system PATH.
    echo If PostgreSQL and Redis are running natively, this is fine.
    echo Proceeding without Docker...
    goto :check_port
)
echo [OK] Docker CLI is available.
echo Checking Docker Daemon status...
docker info >nul 2>&1
if !errorlevel! neq 0 (
    echo [WARNING] Docker Daemon is NOT running.
    echo Please start Docker Desktop if you rely on Docker containers.
    echo Proceeding anyway...
    goto :check_port
)
echo Launching PostgreSQL and Redis via docker-compose...
docker-compose -f fintop-backend\docker-compose.yml up -d >nul 2>&1
if !errorlevel! neq 0 (
    docker compose -f fintop-backend\docker-compose.yml up -d >nul 2>&1
)
echo [OK] Docker containers checked/started.

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
