const redis = require('redis');

import dotenv from 'dotenv';

dotenv.config();

export default redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_DB,
  password: process.env.REDIS_PW
});
