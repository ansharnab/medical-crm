const { loadEnv } = require('./config/load-env');
loadEnv();

const config = require('./config');
const { maskDbUrl } = require('./config/db-url');
const { createApp } = require('./app');
const { sequelize } = require('./models');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

async function start() {
  try {
    const dbUrl = config.db.url || `postgres://${config.db.host}:${config.db.port}/${config.db.name}`;
    logger.info('Starting API', {
      profile: config.dbProfile,
      port: config.port,
      database: config.db.name,
      dbHost: maskDbUrl(dbUrl),
    });

    await sequelize.authenticate();
    logger.info('Database connected');

    try {
      await connectRedis();
      logger.info('Redis connected');
    } catch (redisErr) {
      logger.warn('Redis unavailable — refresh tokens will fail until Redis is up', {
        error: redisErr.message,
      });
    }

    const app = await createApp();
    app.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port} [${config.dbProfile}]`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

start();
