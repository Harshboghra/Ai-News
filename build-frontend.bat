@echo off
cd frontend
npm install
if %errorlevel% neq 0 (
    echo npm install failed
    exit /b %errorlevel%
)
npm run build
if %errorlevel% neq 0 (
    echo npm run build failed
    exit /b %errorlevel%
)
echo Build completed successfully!
