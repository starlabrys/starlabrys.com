@echo off
setlocal EnableExtensions
cd /d "%~dp0"

where npm >nul 2>&1
if %ERRORLEVEL%==0 goto :have_npm

where node >nul 2>&1
if %ERRORLEVEL%==0 (
  echo Detected node but npm is missing. Please reinstall Node.js from https://nodejs.org/
  exit /b 1
)

echo npm not found. Trying to install Node.js...

where winget >nul 2>&1
if %ERRORLEVEL%==0 (
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  goto :refresh_path
)

where choco >nul 2>&1
if %ERRORLEVEL%==0 (
  choco install nodejs-lts -y
  goto :refresh_path
)

echo Could not auto-install. Please install Node.js from https://nodejs.org/ then run this script again.
exit /b 1

:refresh_path
rem Refresh PATH from Machine + User for the current session
for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "MACHINE_PATH=%%B"
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USER_PATH=%%B"
set "PATH=%MACHINE_PATH%;%USER_PATH%"

where npm >nul 2>&1
if not %ERRORLEVEL%==0 (
  echo npm still not found after install. Close this window, open a new terminal, and run start.bat again.
  exit /b 1
)

:have_npm
for /f "delims=" %%V in ('node -v 2^>nul') do set "NODE_VER=%%V"
for /f "delims=" %%V in ('npm -v 2^>nul') do set "NPM_VER=%%V"
echo Node: %NODE_VER%  npm: %NPM_VER%

echo Installing dependencies...
call npm install
if not %ERRORLEVEL%==0 (
  echo npm install failed.
  exit /b 1
)

echo Starting dev server...
call npm run dev
exit /b %ERRORLEVEL%
