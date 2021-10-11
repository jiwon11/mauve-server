import jwt from 'jsonwebtoken';
import redisClient from '../utils/redis';
import { promisify } from 'util';

import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.SECRET;

export const sign = user => {
  const payload = {
    // access token에 들어갈 payload
    id: user.ID,
    role: user.role
  };

  return jwt.sign(payload, secret, {
    // secret으로 sign하여 발급하고 return
    algorithm: 'HS256', // 암호화 알고리즘
    expiresIn: '1y' //expiresIn: '1h' // 유효기간
  });
};

export const verify = token => {
  let decoded = null;
  try {
    decoded = jwt.verify(token, secret);
    return {
      ok: true,
      id: decoded.id,
      role: decoded.role
    };
  } catch (err) {
    return {
      ok: false,
      message: err.message
    };
  }
};

export const refresh = () => {
  // refresh token 발급
  return jwt.sign({}, secret, {
    // refresh token은 payload 없이 발급
    algorithm: 'HS256',
    expiresIn: '1y' //expiresIn: '14d'
  });
};

export const refreshVerify = async (token, userId) => {
  // refresh token 검증
  const getAsync = promisify(redisClient.get).bind(redisClient);
  try {
    const data = await getAsync(userId); // refresh token 가져오기
    if (token === data) {
      try {
        jwt.verify(token, secret);
        return true;
      } catch (err) {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};
