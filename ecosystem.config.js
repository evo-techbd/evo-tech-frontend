// PM2 Configuration for Hostinger deployment
const path = require('path');
const fs = require('fs');

module.exports = {
  apps: [
    {
      name: 'evo-tech-frontend',
      // We are deploying standalone build to root, so server.js is directly in root/server.js
      // But wait, the standalone output structure is usually .next/standalone/server.js
      // However, in our deploy script we copied .next/standalone/* to root.
      // So server.js should be in the root.
      script: 'server.js',
      args: '',
      cwd: './',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Auto-restart on crash
      autorestart: true,
      // Wait before restarting after crash
      restart_delay: 4000,
      // Max number of restarts within min_uptime
      max_restarts: 10,
      // Min uptime to not be considered errored restart
      min_uptime: '10s',
    },
  ],
};
