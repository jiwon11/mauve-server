import { sign, verify, refreshVerify } from './jwt';
import UserModel from '../../models/user';
import jwt from 'jsonwebtoken';

export default async (req, res) => {
  try {
    // access token과 refresh token의 존재 유무를 체크합니다.
    if (req.headers.authorization && req.headers.refresh) {
      const authToken = req.headers.authorization.split('Bearer ')[1];
      const refreshToken = req.headers.refresh;

      // access token 검증 -> expired여야 함.
      const authResult = verify(authToken);

      // access token 디코딩하여 user의 정보를 가져옵니다.
      const decoded = jwt.decode(authToken);

      // 디코딩 결과가 없으면 권한이 없음을 응답.
      if (decoded === null) {
        return res.jsonResult(404, 'JWT 토큰에 사용자 정보가 없습니다.');
      }

      /* access token의 decoding 된 값에서
      유저의 id를 가져와 refresh token을 검증합니다. */
      const refreshResult = refreshVerify(refreshToken, decoded.id);

      // 재발급을 위해서는 access token이 만료되어 있어야합니다.
      if (authResult.ok === false && authResult.message === 'jwt expired') {
        // 1. access token이 만료되고, refresh token도 만료 된 경우 => 새로 로그인해야합니다.
        if (refreshResult.ok === false) {
          return res.jsonResult(401, 'No authorized!');
        } else {
          // 2. access token이 만료되고, refresh token은 만료되지 않은 경우 => 새로운 access token을 발급
          const user = await UserModel.findOne({
            where: {
              ID: decoded.id
            }
          });
          if (!user) {
            return res.jsonResult(404, '사용자가 존재하지 않습니다.');
          }
          console.log(`user : ${user}`);
          const newAccessToken = sign(user);
          return res.jsonResult(201, {
            accessToken: newAccessToken,
            refreshToken
          });
        }
      } else {
        // 3. access token이 만료되지 않은경우 => refresh 할 필요가 없습니다.
        return res.jsonResult(401, 'access token이 만료되지 않아 refresh 할 필요가 없습니다.');
      }
    } else {
      // access token 또는 refresh token이 헤더에 없는 경우
      /*
    res
      .status(400)
      .send(
        new ResponseJsonClass(
          400,
          'Access token and refresh token are need for refresh!',
          undefined
        )
      );
      */
      return res.jsonResult(404, 'access token 또는 refresh token이 Header에 존재하지 않습니다.');
    }
  } catch (err) {
    return res.jsonResult(statusCode, result.errors);
  }
};
