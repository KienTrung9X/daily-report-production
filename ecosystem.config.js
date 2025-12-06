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
      // Restart on file changes
      watch: false,
      // Ignore certain files
      ignore_watch: ['node_modules', 'public/production_data.json', 'logs'],
      // Log files
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Auto restart
      autorestart: true,
      // Max memory
      max_memory_restart: '500M',
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000
    }
  ]
};
