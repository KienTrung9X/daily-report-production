# Daily Report Production - PM2 Deployment

## ✅ Status
App đang chạy với PM2 trên port **3000**

## 🌐 Access URL
```
http://10.247.199.210:3000
```

## 🚀 Startup

### Option 1: Batch Script (Windows)
```bash
start-pm2.bat
```

### Option 2: PowerShell Script
```powershell
.\start-pm2.ps1
```

### Option 3: Manual PM2 Command
```bash
pm2 start ecosystem.config.js
```

## 📊 PM2 Commands

| Command | Purpose |
|---------|---------|
| `pm2 status` | Check all apps status |
| `pm2 logs daily-report` | View real-time logs |
| `pm2 logs daily-report --lines 50` | View last 50 lines |
| `pm2 restart daily-report` | Restart app |
| `pm2 stop daily-report` | Stop app |
| `pm2 delete daily-report` | Remove app |
| `pm2 monit` | Monitor CPU/Memory usage |

## 📁 Files

- `ecosystem.config.js` - PM2 configuration
- `start-pm2.bat` - Windows batch startup script
- `start-pm2.ps1` - PowerShell startup script
- `logs/` - Application logs directory

## ⚙️ Configuration

**Port:** 3000 (set in `ecosystem.config.js`)
**Environment:** production
**Max Memory:** 500MB (auto-restart if exceeded)
**Logs:** `logs/out.log` and `logs/error.log`

## 🔄 Features

- ✅ Lazy loading of production_data.json on first request (~100ms startup)
- ✅ Automatic cache loading from file
- ✅ Manual refresh endpoint: `POST /api/refresh-cache`
- ✅ Auto-restart on crash
- ✅ Graceful shutdown (5s timeout)
- ✅ Process monitoring with PM2

## 🛑 Stop & Cleanup

```bash
# Stop the app
pm2 stop daily-report

# Delete from PM2
pm2 delete daily-report

# Show all apps
pm2 list
```

## 🔧 Troubleshooting

### App won't start
```bash
pm2 logs daily-report
pm2 flush  # Clear all logs
```

### Port already in use
Edit `ecosystem.config.js` and change PORT value

### Clear PM2 cache
```bash
pm2 flush
pm2 kill
pm2 start ecosystem.config.js
```

---
**Last Updated:** 2025-12-06
**Version:** 1.0.0
