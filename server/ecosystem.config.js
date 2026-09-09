const path = require('path');

module.exports = {
  apps: [
    {
      name: 'sandukhar-api',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      // Serves the static frontend (index.html, catalog.html, css/, js/…)
      // on the port the backend's CORS_ORIGIN/.env.example already expects
      // — see scripts/dev-server.py. Without this, the site itself has no
      // server behind it even though the API is up.
      name: 'sandukhar-frontend',
      script: 'scripts/dev-server.py',
      args: '5500',
      interpreter: 'python3',
      cwd: path.join(__dirname, '..'),
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
};
