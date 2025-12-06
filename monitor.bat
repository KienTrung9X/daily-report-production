@echo off
REM Daily Report Production - Monitoring & Stability Script

:menu
cls
echo ========================================
echo   Daily Report - Monitoring & Control
echo ========================================
echo.
echo 1. Check app status
echo 2. View logs (last 20 lines)
echo 3. Restart app
echo 4. Stop app
echo 5. Start app
echo 6. Check memory usage
echo 7. Open health check
echo 8. Exit
echo.
set /p choice="Choose an option (1-8): "

if "%choice%"=="1" goto status
if "%choice%"=="2" goto logs
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto stop
if "%choice%"=="5" goto start
if "%choice%"=="6" goto memory
if "%choice%"=="7" goto health
if "%choice%"=="8" goto end

goto menu

:status
echo.
pm2 status
pause
goto menu

:logs
echo.
echo === LATEST LOGS ===
pm2 logs daily-report --lines 20 --nostream
pause
goto menu

:restart
echo.
pm2 restart daily-report
echo App restarted!
pause
goto menu

:stop
echo.
pm2 stop daily-report
echo App stopped!
pause
goto menu

:start
echo.
pm2 start ecosystem.config.js
echo App started!
pause
goto menu

:memory
echo.
pm2 monit
goto menu

:health
echo.
start http://10.247.199.210:3000/health
goto menu

:end
echo Goodbye!
exit /b 0
