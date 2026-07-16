@echo off
echo ===================================================
echo   جاري تشغيل منصة سمسار العقارية (Semsar Platform)  
echo ===================================================
echo.

echo [1/2] جاري تشغيل خادم الخلفية (Backend Server)...
start "Semsar Backend" cmd /k "cd backend && npm install && npm run dev"

echo.
echo [2/2] جاري تشغيل الواجهة الأمامية (Frontend App)...
start "Semsar Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ===================================================
echo   تم تشغيل كلاً من السيرفر والواجهة بنجاح!          
echo ===================================================
pause
