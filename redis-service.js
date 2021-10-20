'use strict';

require('dotenv').config();
const redis = require('redis');
const { promisify } = require('util');

const { REDIS_PASSWORD = '', REDIS_URL, REDIS_CA = '' } = process.env;

const options = {
  url: REDIS_URL,
  enable_offline_queue: true,
  no_ready_check: true,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  },
};

if (REDIS_PASSWORD !== '') {
  options.password = REDIS_PASSWORD;
}

if (REDIS_CA !== '') {
  options.tls = {
    cert: REDIS_CA,
    ca: [REDIS_CA],
  };
}

class RedisService {
  constructor() {
    this.client = redis.createClient(REDIS_URL, options);
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
  }

  async get(key) {
    return await this.getAsync(key);
  }

  async set(key, value) {
    return await this.setAsync(key, value);
  }
}

module.exports = RedisService;

// // Promisifying Get and set methods
// const redisGetAsync = promisify(client.get).bind(client);
// const redisSetAsync = promisify(client.set).bind(client);

// module.exports = {
//   client,
//   redisGetAsync,
//   redisSetAsync
// }
