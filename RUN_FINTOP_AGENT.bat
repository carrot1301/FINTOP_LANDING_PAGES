@echo off
setlocal enabledelayedexpansion
title FinTop AI Ops Agent Logs
color 0B
cls

echo =======================================================================
echo               FINTOP AI OPS AGENT DEVELOPER LAUNCHER
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

echo [2/3] Checking Python availability...
python --version >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Python is not installed or not in system PATH.
    echo Please install Python 3.10+ and add it to system PATH.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version') do set PY_VER=%%v
echo [OK] Python is available: !PY_VER!
echo.

echo Checking if port 8000 is already in use...
set PORT_BUSY=0
for /f "tokens=*" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr /C:":8000 " 2^>nul') do (
    set PORT_BUSY=1
)
if !PORT_BUSY! equ 1 (
    echo.
    echo [WARNING] Port 8000 is ALREADY occupied by another process!
    echo An existing ADK Agent service is already running.
    echo.
    echo If this is your active agent, no need to start another.
    echo To force stop, run: STOP_FINTOP_DEV.bat
    echo.
    pause
    exit /b 0
)
echo [OK] Port 8000 is free. Proceeding to launch...
echo.

echo [3/3] Starting Python ADK Agent Service...
cd /d "%~dp0services\adk-agent"
if !errorlevel! neq 0 (
    echo [ERROR] Failed to navigate to services\adk-agent folder.
    pause
    exit /b 1
)
echo Working directory: %cd%
echo.
echo =======================================================================
echo        STARTING AGENT (python -m uvicorn main:app)...
echo        Forcing UTF-8 output encoding for terminal compatibility.
echo        Press Ctrl+C to stop the agent server.
echo =======================================================================
echo.

set PYTHONIOENCODING=utf-8
call python -m uvicorn main:app --host 127.0.0.1 --port 8000
echo.
echo =======================================================================
echo     AI Ops Agent service has stopped.
echo =======================================================================
echo.
pause
