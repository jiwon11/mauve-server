import coachService from '../services/coach.service';
import { sign, refresh } from '../libs/utils/jwt';
import redisClient from '../libs/utils/redis';

export const signAccount = async (req, res) => {
  try {
    const coachDTO = req.body;
    const profileImgDTO = req.file;
    if (profileImgDTO) {
      ['encoding', 'acl', 'contentDisposition', 'storageClass', 'serverSideEncryption', 'metadata', 'etag', 'versionId'].forEach(key => delete profileImgDTO[key]);
    }
    console.log('coachData', coachDTO);
    console.log('userProfileImgData', profileImgDTO);
    const { success, body } = await coachService.sign(coachDTO, profileImgDTO);
    if (success) {
      const { coachRecord, created } = body;
      const accessToken = sign(coachRecord);
      const refreshToken = refresh();

      redisClient.set(coachRecord._id.toString(), refreshToken, (err, result) => {
        console.log(err);
      });
      const statusCode = created ? 201 : 200;
      const coachToken = {
        created: created,
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      return res.jsonResult(statusCode, coachToken);
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
    const targetCoachId = req.params.id;
    const userID = req.user.ID;
    const { success, body } = await coachService.findById(targetCoachId);
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
