module.exports = {
  apps: [
    {
      name: 'daily-report',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Health check
      listen_timeout: 10000,
      kill_timeout: 5000,
      wait_ready: true,
      
      // Restart policies
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      
      // Watch & ignore
      watch: false,
      ignore_watch: ['node_modules', 'public/production_data.json', 'logs'],
      
      // Logging
      output: './logs/out.log',
      error: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Merge logs from cluster
      merge_logs: true,
      
      // Advanced PM2 features
      cron_restart: '0 3 * * *',  // Restart at 3 AM daily
      exp_backoff_restart_delay: 100  // Exponential backoff on restart
    }
  ]
};
