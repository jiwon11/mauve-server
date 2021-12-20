import userService from '../services/user.service';
import roomService from '../services/room.service';
import CardService from '../services/card.service';
import { sign, refresh } from '../libs/utils/jwt';
import redisClient from '../libs/utils/redis';
import IAMPORT from '../libs/utils/iamport';
import moment from 'moment-timezone';
import dotenv from 'dotenv';

dotenv.config();

export const signAccount = async (req, res) => {
  try {
    const userDTO = req.body;
    const profileImgDTO = req.file;
    if (profileImgDTO) {
      ['encoding', 'acl', 'contentDisposition', 'storageClass', 'serverSideEncryption', 'metadata', 'etag', 'versionId'].forEach(key => delete profileImgDTO[key]);
      profileImgDTO.thumbnail = `${process.env.CLOUD_FRONT_URL}/${profileImgDTO.key}?w=150&h=150&f=png&q=100`;
    }
    userDTO.birthdate = moment(userDTO.birthdate).tz('Asia/seoul').format('YYYY-MM-DD');
    //userDTO.weight_info = JSON.parse(userDTO.weight_info);
    console.log('userData', userDTO);
    console.log('userProfileImgData', profileImgDTO);
    const { success, body } = await userService.sign(userDTO, profileImgDTO);
    if (success) {
      const { userRecord, created } = body;
      if (created) {
        // 추후 결제 후 로직으로 이동
        await roomService.create(req, { title: `${userRecord.name} CHAT ROOM`, user: userRecord._id, coach: null });
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
    return res.jsonResult(500, { error: 'User Controller Error', message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const userID = req.user.ID;
    redisClient.del(userID, function (err, response) {
      if (response == 1) {
        console.log('Deleted Successfully!');
      } else {
        console.error(err);
        console.log('Cannot delete');
      }
    });
    return res.jsonResult(200, '로그아웃 되었습니다.');
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { error: 'User Controller Error', message: err.message });
  }
};

export const withdraw = async (req, res) => {
  try {
    const userID = req.user.ID;
    const { success, body } = await userService.withdraw(userID);
    if (success) {
      return res.jsonResult(204, body);
    } else {
      return res.jsonResult(body.statusCode, { message: 'User Service Error', body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { error: 'User Controller Error', message: err.message });
  }
};

export const getUserData = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const userID = req.user.ID;
    const userDataResult = await userService.findById(targetUserId);
    if (userDataResult.success) {
      return res.jsonResult(200, userDataResult.body);
    } else {
      return res.jsonResult(userDataResult.body.statusCode, { message: userDataResult.body.message });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { error: 'User Controller Error', message: err.message });
  }
};

export const addCustomerUid = async (req, res) => {
  try {
    const { customer_uid } = req.body; // req의 body에서 customer_uid 추출
    const userId = req.user.ID;
    const billingKeyResult = await IAMPORT.getBillingKeyInfo(customer_uid);
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
    return res.jsonResult(500, { error: 'User Controller Error', message: err.message });
  }
};

export const addCard = async (req, res) => {
  try {
    const billingKeyData = req.body;
    const userId = req.user.ID;
    const addCardResult = await CardService.createBillingKey(userId, billingKeyData);
    if (addCardResult.success) {
      return res.jsonResult(201, { body: addCardResult.body });
    } else {
      return res.jsonResult(500, { message: addCardResult.message });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { error: 'User Controller Error', message: err.message });
  }
};

export const getAllCard = async (req, res) => {
  try {
    const userId = req.user.ID;
    console.log(userId);
    const getAllCardResult = await CardService.getAll(userId);
    if (getAllCardResult.success) {
      return res.jsonResult(200, { body: getAllCardResult.body });
    } else {
      return res.jsonResult(500, { message: getAllCardResult.message });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { error: 'User Controller Error', message: err.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const customer_uid = req.body.customer_uid;
    const deleteCardResult = await CardService.deleteBillingKey(customer_uid);
    if (deleteCardResult.success) {
      return res.jsonResult(200, deleteCardResult.body);
    } else {
      return res.jsonResult(500, { message: deleteCardResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { error: 'User Controller Error', message: err.message });
  }
};
