const redis = require('redis');
const {promisify } = require('util');

// if (!process.env.REDIS_TLS_URL)
//   throw new Error('Invalid REDIS_URL');

const config = {
  url: process.env.REDIS_TLS_URL,
  tls: {
    rejectUnauthorized: false
  }
}

class RedisService {
  constructor() {
    this.client = redis.createClient();
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
