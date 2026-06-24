const Redis = require('ioredis');
const config = require('./index');
const logger = require('../utils/logger');

let redis = null;

function getRedis() {
  if (redis) return redis;

  redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    logger.error('Redis connection error', { error: err.message });
  });

  return redis;
}

async function connectRedis() {
  const client = getRedis();
  if (client.status === 'wait' || client.status === 'end') {
    await client.connect();
  }
  return client;
}

async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

module.exports = { getRedis, connectRedis, disconnectRedis };
