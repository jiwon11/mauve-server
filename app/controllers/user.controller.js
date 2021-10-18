import userService from '../services/user.service';
import { sign, refresh } from '../libs/utils/jwt';
import redisClient from '../libs/utils/redis';
import UserService from '../services/user.service';

export const signAccount = async (req, res) => {
  try {
    const userDTO = req.body;
    const profileImgDTO = req.file;
    ['encoding', 'acl', 'contentDisposition', 'storageClass', 'serverSideEncryption', 'metadata', 'etag', 'versionId'].forEach(key => delete profileImgDTO[key]);
    console.log('userData', userDTO);
    console.log('userProfileImgData', profileImgDTO);
    const { success, body } = await userService.sign(userDTO, profileImgDTO);
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

export const getUserData = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const userID = req.user.ID;
    const { success, body } = await UserService.findById(targetUserId);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'User Service Error', body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};
