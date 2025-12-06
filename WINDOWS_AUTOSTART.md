# Auto-Startup with Windows

## ✅ Cấu hình hoàn tất

App sẽ tự khởi động khi Windows boot.

## 📋 Cách hoạt động

1. **resurrect.bat** - File batch chạy `pm2 resurrect`
   - Khôi phục lại tất cả process đã save
   - Chạy tự động khi Windows boot

2. **Daily-Report-Resurrect.lnk** - Shortcut trong Startup folder
   - Tự động chạy `resurrect.bat` khi Windows khởi động
   - Không cần Task Scheduler hay Service

## 🔧 Các file liên quan

```
resurrect.bat                          - Main batch file
C:\Users\kienvt\AppData\Roaming\
  Microsoft\Windows\Start Menu\
  Programs\Startup\
  Daily-Report-Resurrect.lnk          - Windows shortcut
```

## ✅ Xác nhận cấu hình

### 1. Kiểm tra PM2 process
```bash
pm2 status
```

### 2. Test resurrect
```bash
pm2 stop daily-report      # Stop app
pm2 resurrect              # Restore from save
pm2 status                 # Should show daily-report running
```

### 3. Kiểm tra Startup folder
```
C:\Users\kienvt\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\
```
Bạn sẽ thấy `Daily-Report-Resurrect.lnk`

## 📝 Quy trình khởi động

```
Windows Boot
    ↓
Startup Folder được load
    ↓
Daily-Report-Resurrect.lnk được execute
    ↓
resurrect.bat chạy
    ↓
pm2 resurrect (khôi phục process)
    ↓
daily-report app khởi động
    ↓
Accessible on http://10.247.199.210:3000
```

## 🔄 Cần cập nhật?

Nếu cần thay đổi process list, sau khi start/stop app:

```bash
pm2 save
```

## 🛑 Tắt Auto-startup

Xóa shortcut:
```
C:\Users\kienvt\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\Daily-Report-Resurrect.lnk
```

---
**Last Updated:** 2025-12-06
