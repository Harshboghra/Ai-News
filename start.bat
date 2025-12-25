@echo off
echo Building AI-News Application for Production...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)
echo.
echo Starting AI-News Application in Production Mode...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3032
echo.
npm run start
pause
