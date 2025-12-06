# Chạy Ổn Định với PM2

## ✅ Tính năng ổn định được thêm

### 1. **Error Handling**
- ✅ Catch uncaught exceptions
- ✅ Handle unhandled promise rejections
- ✅ Log errors to file (logs/error-uncaught.log, logs/error-promise.log)
- ✅ Handle client errors gracefully

### 2. **Graceful Shutdown**
- ✅ Stop accepting new connections
- ✅ Close existing connections gracefully
- ✅ 10s timeout before force close
- ✅ Handle SIGTERM & SIGINT signals

### 3. **Health Monitoring**
- ✅ `/health` endpoint - Check app status & memory usage
- ✅ `/ready` endpoint - Signal PM2 readiness
- ✅ Request logging - Log all requests with response time
- ✅ Memory usage tracking

### 4. **PM2 Stability Config**
- ✅ Auto-restart on crash (max 10 restarts)
- ✅ Min uptime check (10s before considering healthy)
- ✅ Memory limit: 500MB (auto-restart if exceeded)
- ✅ Daily restart at 3 AM (cron restart)
- ✅ Exponential backoff on restart failures
- ✅ 5s kill timeout for graceful shutdown

## 🔧 Giám sát & Điều khiển

### Dùng Menu Script
```bash
monitor.bat
```

Các tùy chọn:
- 1. Check app status
- 2. View logs (last 20 lines)
- 3. Restart app
- 4. Stop app
- 5. Start app
- 6. Check memory usage (realtime)
- 7. Open health check
- 8. Exit

### PM2 Commands

| Command | Purpose |
|---------|---------|
| `pm2 status` | Check status |
| `pm2 logs daily-report` | View live logs |
| `pm2 monit` | Real-time monitoring |
| `pm2 restart daily-report` | Restart app |
| `pm2 info daily-report` | Show detailed info |
| `pm2 describe daily-report` | Show full config |
| `pm2 save` | Save process list |

## 🌐 Health Check Endpoints

### `/health` - Full status
```bash
curl http://10.247.199.210:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-06T09:42:17.000Z",
  "uptime": "3600s",
  "memory": {
    "heapUsed": "85MB",
    "heapTotal": "256MB",
    "rss": "120MB"
  },
  "node_version": "v22.20.0",
  "env": "production"
}
```

### `/ready` - Readiness check
```bash
curl http://10.247.199.210:3000/ready
```

Response:
```json
{
  "status": "ready"
}
```

## 📊 Logs

### Error Logs
- `logs/error.log` - PM2 error log (automatic)
- `logs/error-uncaught.log` - Uncaught exceptions
- `logs/error-promise.log` - Unhandled rejections
- `logs/out.log` - Standard output

### View Logs
```bash
# Last 20 lines
pm2 logs daily-report --lines 20

# Real-time
pm2 logs daily-report

# From file
type logs\error.log
```

## 🔄 Auto-Restart Features

### Daily Restart at 3 AM
```
Ngạn:
- Automatic cleanup memory leaks
- Fresh database connections
- Regular maintenance window
```

### Memory Limit: 500MB
```
Trigger:
- If heap > 500MB → Auto-restart
- Prevent OOM (Out of Memory) crashes
```

### Crash Recovery
```
Policy:
- Max 10 restarts in 1 minute
- Min 10s uptime before considering healthy
- Exponential backoff (delays increase)
```

## ⚠️ Monitoring Best Practices

### Daily Check
```bash
pm2 status              # Quick status
pm2 info daily-report   # Detailed info
```

### Weekly Check
```bash
pm2 logs daily-report --lines 100  # Check for errors
du -sh logs/            # Check log size
```

### Monthly Maintenance
```bash
pm2 save                # Save process state
pm2 flush               # Clear logs
pm2 restart daily-report # Fresh restart
```

## 🛠️ Troubleshooting

### App won't start
```bash
pm2 logs daily-report       # Check errors
pm2 delete daily-report     # Remove
pm2 start ecosystem.config.js # Restart
```

### High memory usage
```bash
pm2 info daily-report       # Check uptime
pm2 restart daily-report    # Restart
```

### Check if port is in use
```bash
netstat -ano | findstr :3000
```

### Kill process on port 3000
```bash
taskkill /PID <PID> /F
```

## ✅ Verification

Test app stability:
```bash
# Terminal 1: Monitor
pm2 monit

# Terminal 2: Load test
# Open browser and refresh multiple times
# http://10.247.199.210:3000

# Check health
curl http://10.247.199.210:3000/health
```

Expected:
- Memory stable
- Response time < 500ms
- No errors in logs

---
**Last Updated:** 2025-12-06
**Version:** 2.0 (Stability Release)
