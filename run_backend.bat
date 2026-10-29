@echo off
echo ========================================================
echo Starting EmpathAI FastAPI Backend Server...
echo ========================================================
cd backend
if not exist venv\Scripts\python.exe (
    echo Virtual environment not found! Creating venv...
    python -m venv venv
    .\venv\Scripts\python.exe -m pip install -r requirements.txt
)
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
