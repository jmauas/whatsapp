module.exports = {
  apps: [{
    name: 'Whatsapp2',
    script: './src/index.js',
    args: '',
    watch: false,
    ignore_watch: ['*', 'node_modules', 'locales', '*_sessions', 'uploads'],
    exec_mode: "fork",
    instances: 1,
    autorestart: true,
    log_file: './locales/logs/logsApp.txt',
    out_file: 'NULL',
    error_file: 'NULL',
    append: true,
  }
  ]
};