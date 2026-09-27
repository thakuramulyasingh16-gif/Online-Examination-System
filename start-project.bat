@echo off
echo Starting Backend...
cd backend
start cmd /k npm start

echo Starting Frontend...
cd ..
cd frontend
start cmd /k npm run dev

echo Project Started!
pause