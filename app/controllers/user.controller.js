import userService from '../services/user.service';
import { sign, refresh } from '../libs/utils/jwt';
import redisClient from '../libs/utils/redis';

export const signAccount = async (req, res) => {
  try {
    const userDTO = req.body;
    console.log('userData', userDTO);
    const { success, body } = await userService.sign(userDTO);
    if (success) {
      const { userRecord, created } = body;
      const accessToken = sign(userRecord);
      const refreshToken = refresh();

      redisClient.set(userRecord._id.toString(), refreshToken, (err, result) => {
        console.log(err);
      });
      const statusCode = created ? 201 : 200;
      const userToken = {
        created: created,
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      return res.jsonResult(statusCode, userToken);
    } else {
      return res.jsonResult(500, { message: 'User Service Error', body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};
