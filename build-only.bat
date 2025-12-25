@echo off
cd frontend
npm run build
if %errorlevel% neq 0 (
    echo npm run build failed
    exit /b %errorlevel%
)
echo Build completed successfully!
