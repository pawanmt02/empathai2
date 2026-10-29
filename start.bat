@echo off
echo ========================================================
echo Launching EmpathAI (Backend + Frontend)...
echo ========================================================
start "EmpathAI Backend (FastAPI)" cmd /k "run_backend.bat"
start "EmpathAI Frontend (Vite React)" cmd /k "run_frontend.bat"
echo Both servers are launching!
echo Frontend will be accessible at: http://localhost:5173
echo Backend API and docs will be at: http://127.0.0.1:8000/docs
