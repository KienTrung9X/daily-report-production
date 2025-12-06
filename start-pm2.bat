@echo off
REM Daily Report Production - PM2 Startup Script

echo Starting Daily Report Production App with PM2...
echo.

REM Stop any existing instances
pm2 delete daily-report 2>nul

REM Start app with ecosystem config
pm2 start ecosystem.config.js

echo.
echo ✓ App started successfully!
echo ✓ Access at: http://10.247.199.210:3000
echo.
echo PM2 Commands:
echo   pm2 status              - Check app status
echo   pm2 logs daily-report   - View app logs
echo   pm2 restart daily-report - Restart app
echo   pm2 stop daily-report   - Stop app
echo   pm2 delete daily-report - Remove app
echo.
pause
