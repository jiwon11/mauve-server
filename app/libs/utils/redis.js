import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export default redis.createClient({
  host: process.env.REDIS_PROD_HOST,
  port: process.env.REDIS_PROD_PORT,
  db: process.env.REDIS_PROD_DB,
  password: process.env.REDIS_PROD_PW,
  options: {
    connect_timeout: 600
  }
});
