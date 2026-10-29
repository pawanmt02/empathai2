@echo off
echo ========================================================
echo Starting EmpathAI React + Vite Frontend...
echo ========================================================
cd frontend
if not exist node_modules (
    echo Installing node dependencies...
    npm install
)
npm run dev
pause
