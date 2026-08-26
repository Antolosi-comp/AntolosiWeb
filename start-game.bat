@echo off
chcp 65001 >nul
title GTA VI - Antolosi
cd /d "%~dp0"

echo.
echo  ==========================================
echo   GTA VI  -  VICE CITY / LEONIDA
echo  ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  [!] Node.js не знайдено.
  echo      Встановіть його з https://nodejs.org (LTS) і запустіть цей файл знову.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo  [1/2] Встановлення залежностей... Це займе 1-3 хвилини.
  echo.
  call npm.cmd install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo  [!] Помилка встановлення залежностей.
    pause
    exit /b 1
  )
) else (
  echo  [1/2] Залежності вже встановлено.
)

echo.
echo  [2/2] Запуск сервера...
echo.
echo  Гра відкриється у браузері: http://localhost:3000/gta6
echo  Щоб зупинити сервер - закрийте це вікно або натисніть Ctrl+C.
echo.

start "" "http://localhost:3000/gta6"
call npm.cmd run dev

pause
