/*
 case1: access token과 refresh token 모두가 만료된 경우 -> 에러 발생
 case2: access token은 만료됐지만, refresh token은 유효한 경우 ->  access token 재발급
 case3: access token은 유효하지만, refresh token은 만료된 경우 ->  refresh token 재발급
 case4: access token과 refresh token 모두가 유효한 경우 -> 바로 다음 미들웨어로 넘긴다.
 */
import { verify } from '../libs/utils/jwt.js';
import UserModel from '../models/user';

export default (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split('Bearer ')[1]; // header에서 access token을 가져옵니다.
    const result = verify(token); // token을 검증합니다.
    const userRecord = UserModel.findOne({
      where: {
        ID: result.id
      }
    });
    if (result.ok && userRecord) {
      // token이 검증되었으면 req에 값을 세팅하고, 다음 콜백함수로 갑니다.
      req.user = { ID: result.id, role: result.role };
      next();
    } else {
      // 검증에 실패하거나 토큰이 만료되었다면 클라이언트에게 메세지를 담아서 응답합니다.
      return res.jsonResult(401, {
        ok: false,
        message: result.message ? result.message : '사용자가 존재하지 않습니다.' // jwt가 만료되었다면 메세지는 'jwt expired'입니다.
      });
    }
  } else {
    return res.jsonResult(404, {
      ok: false,
      message: '토큰이 존재하지 않습니다.'
    });
  }
};
