#!/usr/bin/env bash
# GTA VI — запуск на macOS / Linux
set -e
cd "$(dirname "$0")"

echo
echo " =========================================="
echo "  GTA VI  -  VICE CITY / LEONIDA"
echo " =========================================="
echo

if ! command -v node >/dev/null 2>&1; then
  echo " [!] Node.js не знайдено. Встановіть LTS з https://nodejs.org"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo " [1/2] Встановлення залежностей..."
  npm install --no-audit --no-fund
else
  echo " [1/2] Залежності вже встановлено."
fi

echo
echo " [2/2] Запуск сервера — http://localhost:3000/gta6"
echo

( sleep 4; (command -v open >/dev/null && open http://localhost:3000/gta6) || (command -v xdg-open >/dev/null && xdg-open http://localhost:3000/gta6) ) >/dev/null 2>&1 &

npm run dev
