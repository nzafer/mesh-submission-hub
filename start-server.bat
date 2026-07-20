@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
    python -m http.server 8000
    goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
    py -m http.server 8000
    goto :eof
)

echo Python was not found. Install Python or open index.html directly in Edge or Chrome.
exit /b 1
