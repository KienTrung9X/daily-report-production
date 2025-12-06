# Daily Report Production - PM2 Startup Script

Write-Host "Starting Daily Report Production App with PM2..." -ForegroundColor Green
Write-Host ""

# Stop any existing instances
pm2 delete daily-report 2>$null

# Start app with ecosystem config
pm2 start ecosystem.config.js

Write-Host ""
Write-Host "✓ App started successfully!" -ForegroundColor Green
Write-Host "✓ Access at: http://10.247.199.210:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "PM2 Commands:" -ForegroundColor Yellow
Write-Host "  pm2 status              - Check app status"
Write-Host "  pm2 logs daily-report   - View app logs"
Write-Host "  pm2 restart daily-report - Restart app"
Write-Host "  pm2 stop daily-report   - Stop app"
Write-Host "  pm2 delete daily-report - Remove app"
Write-Host ""
