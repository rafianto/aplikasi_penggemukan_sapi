@echo off

title Manajemen Kendaraan Django Server
color 0A

:: Switch to project drive
I:
if errorlevel 1 (
    echo [ERROR] Drive I: not found.
    pause
    exit /b 1
)

:: Navigate to project root
cd /d "I:\Projects\appmsapi"
if errorlevel 1 (
    echo [ERROR] Directory not found.
    pause
    exit /b 1
)

call cls
call npm start

:: If server crashes, keep window open
echo.
echo [SERVER STOPPED]
pause
