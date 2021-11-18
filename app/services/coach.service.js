import CoachModel from '../models/coach';
import { sign, refresh } from '../libs/utils/jwt';
import redisClient from '../libs/utils/redis';
export default class CoachService {
  static async sign(coachDTO, profileImgDTO) {
    try {
      let coachRecord, created;
      const newCoach = new CoachModel({ ...coachDTO, ...{ profile_img: profileImgDTO } });
      const saveCoach = await newCoach.save();
      coachRecord = saveCoach;
      created = true;
      return { success: true, body: { pass_code: coachRecord.pass_code, created } };
    } catch (err) {
      console.log(err);
      if (err.name === 'ValidationError') {
        let errors = {};

        Object.keys(err.errors).forEach(key => {
          errors[key] = err.errors[key].message;
        });

        return { success: false, body: { statusCode: 400, err: errors } };
      }
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async loginByPassCode(passCode) {
    try {
      const coachRecord = await CoachModel.findOne({ pass_code: passCode }).select({ _id: 1, role: 1 }).lean();
      if (coachRecord) {
        const accessToken = sign(coachRecord);
        const refreshToken = refresh();

        redisClient.set(coachRecord._id.toString(), refreshToken, (err, result) => {
          console.log(err);
        });
        const coachToken = {
          accessToken: accessToken,
          refreshToken: refreshToken
        };
        return { success: true, body: coachToken };
      } else {
        return { success: false, body: { message: `Coach not founded by passCode : ${passCode}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async findById(ID) {
    try {
      const coachRecord = await CoachModel.findOne({ _id: ID }).select({ name: 1, role: 1, profile_img: 1 }).lean();
      if (coachRecord) {
        return { success: true, body: { coachRecord } };
      } else {
        return { success: false, body: { message: `Coach not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
