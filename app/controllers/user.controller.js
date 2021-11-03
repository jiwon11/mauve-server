import userService from '../services/user.service';
import roomService from '../services/room.service';
import { sign, refresh } from '../libs/utils/jwt';
import redisClient from '../libs/utils/redis';
import IMPORT from '../libs/utils/import';

export const signAccount = async (req, res) => {
  try {
    const userDTO = req.body;
    const profileImgDTO = req.file;
    if (profileImgDTO) {
      ['encoding', 'acl', 'contentDisposition', 'storageClass', 'serverSideEncryption', 'metadata', 'etag', 'versionId'].forEach(key => delete profileImgDTO[key]);
    }
    console.log('userData', userDTO);
    console.log('userProfileImgData', profileImgDTO);
    const { success, body } = await userService.sign(userDTO, profileImgDTO);
    if (success) {
      const { userRecord, created } = body;
      if (created) {
        // 추후 결제 후 로직으로 이동
        await roomService.create(req, { title: `${userRecord.name} CHAT ROOM`, member: [userRecord] });
      }
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
      return res.jsonResult(body.statusCode, body.err);
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
    const { success, body } = await userService.findById(targetUserId);
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

export const addCustomerUid = async (req, res) => {
  try {
    const { customer_uid } = req.body; // req의 body에서 customer_uid 추출
    const userId = req.user.ID;
    const billingKeyResult = await IMPORT.getBillingKeyInfo(customer_uid);
    if (billingKeyResult.success) {
      const userCuidResult = await userService.addCustomerUid(userId, customer_uid);
      if (userCuidResult) {
        return res.jsonResult(201, { body: userCuidResult.body });
      } else {
        return res.jsonResult(404, { body: userCuidResult.body });
      }
    } else {
      return res.jsonResult(500, { message: billingKeyResult.message });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Import Controller Error', err });
  }
};
