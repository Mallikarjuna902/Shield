@echo off
echo Starting Shield Threat Detection Backend (Simple Version)...
echo.

cd /d "%~dp0backend"

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing minimal dependencies...
pip install Flask Flask-CORS pandas numpy

echo.
echo Starting backend server...
python simple_app.py

pause
