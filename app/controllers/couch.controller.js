import couchService from '../services/couch.service';
import { sign, refresh } from '../libs/utils/jwt';
import redisClient from '../libs/utils/redis';

export const signAccount = async (req, res) => {
  try {
    const couchDTO = req.body;
    const profileImgDTO = req.file;
    if (profileImgDTO) {
      ['encoding', 'acl', 'contentDisposition', 'storageClass', 'serverSideEncryption', 'metadata', 'etag', 'versionId'].forEach(key => delete profileImgDTO[key]);
    }
    console.log('couchData', couchDTO);
    console.log('userProfileImgData', profileImgDTO);
    const { success, body } = await couchService.sign(couchDTO, profileImgDTO);
    if (success) {
      const { couchRecord, created } = body;
      const accessToken = sign(couchRecord);
      const refreshToken = refresh();

      redisClient.set(couchRecord._id.toString(), refreshToken, (err, result) => {
        console.log(err);
      });
      const statusCode = created ? 201 : 200;
      const couchToken = {
        created: created,
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      return res.jsonResult(statusCode, couchToken);
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
    const targetCouchId = req.params.id;
    const userID = req.user.ID;
    const { success, body } = await couchService.findById(targetCouchId);
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
