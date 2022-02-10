import AdminModel from '../models/admin';
import { sign, refresh } from '../libs/utils/jwt';
import redisClient from '../libs/utils/redis';
import moment from 'moment-timezone';

export const today = moment().tz('Asia/Seoul').startOf('day');
export default class AdminService {
  static async sign(adminDTO) {
    try {
      const newAdmin = new AdminModel(adminDTO);
      const saveAdmin = await newAdmin.save();
      const created = true;
      return { success: true, body: { pass_code: saveAdmin.pass_code, created } };
    } catch (err) {
      console.log(err);
      if (err.name === 'ValidationError') {
        let errors = {};

        Object.keys(err.errors).forEach(key => {
          errors[key] = err.errors[key].message;
        });

        return { success: false, body: { statusCode: 400, err: errors } };
      }
      return { success: false, body: { statusCode: 500, err: err.message } };
    }
  }

  static async loginByPassCode(passCode) {
    try {
      const adminRecord = await AdminModel.aggregate([{ $match: { pass_code: passCode } }, { $project: { _id: 1, role: 1 } }]);
      if (adminRecord.length > 0) {
        const admin = adminRecord[0];
        const accessToken = sign(admin);
        const refreshToken = refresh();

        redisClient.set(admin._id.toString(), refreshToken, (err, result) => {
          console.log(err);
        });
        const adminToken = {
          accessToken: accessToken,
          refreshToken: refreshToken
        };
        return { success: true, body: { ...{ id: admin._id.toString() }, ...adminToken } };
      } else {
        return { success: false, body: { statusCode: 404, err: `Admin not founded by passCode : ${passCode}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }
}
