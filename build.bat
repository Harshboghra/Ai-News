@echo off
echo Building AI-News Application...
echo.
echo Building Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    cd ..
    exit /b %errorlevel%
)
cd ..
echo.
echo Building Backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo Backend build failed!
    cd ..
    exit /b %errorlevel%
)
cd ..
echo.
echo ✅ Build completed successfully!
echo.
echo You can now run: npm run start
pause
