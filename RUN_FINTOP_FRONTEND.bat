@echo off
setlocal enabledelayedexpansion
title FinTop Frontend Logs
color 0E
cls

echo =======================================================================
echo               FINTOP FRONTEND DEVELOPER LAUNCHER
echo =======================================================================
echo.
echo [1/3] Navigating to Project Root...
cd /d "%~dp0"
if !errorlevel! neq 0 (
    echo [ERROR] Failed to navigate to project root folder.
    pause
    exit /b 1
)
echo [OK] Located project root: %cd%
echo.

echo [2/3] Checking Node.js availability...
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

echo [3/3] Launching Static Server and Opening Browser...
echo.
echo [NOTE] The server will start first, then the browser will open.
echo [NOTE] If port 8080 is blocked, it will fallback to port 8081.
echo.
echo =======================================================================
echo               STARTING FRONTEND (static_server.js)...
echo     Press Ctrl+C to stop the server.
echo =======================================================================
echo.

REM Start the server in background, wait 2 seconds, then open the browser
start /b "" powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:8080/index.html'"


REM Run the static server in the foreground (keeps window open)
call node static_server.js
echo.
echo =======================================================================
echo     Frontend server has stopped.
echo =======================================================================
echo.
pause
