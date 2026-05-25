module.exports = {
  apps: [
    {
      name: 'agroconecta-web',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/u[REEMPLAZAR]/domains/agroconecta.com.py/public_html/web',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      restart_delay: 3000,
      watch: false,
    },
  ],
}
