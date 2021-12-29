import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export default redis.createClient({
  host: process.env.REDIS_TEST_HOST,
  port: process.env.REDIS_TEST_PORT,
  db: process.env.REDIS_TEST_DB,
  password: process.env.REDIS_TEST_PW
});
