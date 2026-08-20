@echo off
setlocal
cd /d "%~dp0.."

if "%~1"=="" (
  set "ENV_FILE=.env.bootstrap"
) else (
  set "ENV_FILE=%~1"
)

echo Aplicando bootstrap con %ENV_FILE%
call npm run db:bootstrap -- --env-file=%ENV_FILE%
exit /b %ERRORLEVEL%
