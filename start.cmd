@echo off
REM One-click launcher for the MOT 3D site. Serves over http and opens the browser
REM so the 3D globe + live data load correctly (they cannot load over file://).
cd /d "%~dp0"

set PORT=8123
echo Starting local server at http://localhost:%PORT%  (press Ctrl+C to stop)

REM Prefer Python; fall back to Node's npx serve.
where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:%PORT%"
  python -m http.server %PORT%
  goto :eof
)

where npx >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:3000"
  npx serve .
  goto :eof
)

echo.
echo Neither Python nor Node was found on PATH.
echo Install Python from https://python.org then double-click this file again.
pause
