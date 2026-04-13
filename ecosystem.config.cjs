module.exports = {
  apps: [
    {
      name: 'life-30000-days',
      script: 'tsx',
      args: 'api/server.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_PATH: './data/database.sqlite',
        JWT_SECRET: 'your-production-secret-key-change-this'
      }
    }
  ]
};
