import CoachModel from '../models/coach';
import UserModel from '../models/user';
import ChatModel from '../models/chat';
import ChatRoomModel from '../models/chat_room';
import mongoose from 'mongoose';
import { sign, refresh } from '../libs/utils/jwt';
import { groupBy, groupByOnce } from '../libs/utils/conjugation';
import redisClient from '../libs/utils/redis';
import PeriodService from './period.service';

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

  static async findById(ID) {
    try {
      const coachRecord = await CoachModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(ID)
          }
        },
        {
          $project: {
            name: 1,
            phone_NO: 1,
            role: 1,
            profile_img: '$profile_img.location'
          }
        }
      ]);
      if (coachRecord.length > 0) {
        return { success: true, body: coachRecord[0] };
      } else {
        return { success: false, body: { statusCode: 404, message: `Coach not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, message: err.message } };
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
        return { success: false, body: { statusCode: 500, err: `Coach not founded by passCode : ${passCode}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async getUserInfo(targetUserId) {
    try {
      const userInfoRecord = await UserModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(targetUserId)
          }
        },
        {
          $project: {
            name: 1,
            phone_NO: 1,
            age: { $sum: [{ $toInt: { $divide: [{ $subtract: [new Date(), '$birthdate'] }, 365 * 24 * 60 * 60 * 1000] } }, 1] },
            weight: '$weight_info.now',
            height: 1,
            next_payment_d_day: { $toInt: { $divide: [{ $subtract: [new Date(), '$next_payment'] }, 24 * 60 * 60 * 1000] } },
            next_payment: 1
          }
        }
      ]);
      if (userInfoRecord) {
        const periodResult = await PeriodService.getAll(targetUserId);
        if (!periodResult) {
          return { success: false, body: { err: `Period not founded by User ID : ${targetUserId}` } };
        }
        return { success: true, body: { userInfo: userInfoRecord[0], periodRecord: periodResult.body } };
      } else {
        return { success: false, body: { err: `User not founded by User ID : ${targetUserId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async getUserNote(targetUserId) {
    try {
      const noteRecord = await ChatRoomModel.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(targetUserId)
          }
        },
        {
          $project: {
            note: 1
          }
        }
      ]);
      if (noteRecord.length > 0) {
        return { success: true, body: { note: noteRecord[0].note } };
      } else {
        return { success: false, body: { err: `ChatRoom not founded by User ID : ${targetUserId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async updateUserNote(targetUserId, noteDTO) {
    try {
      const noteRecord = await ChatRoomModel.findOneAndUpdate(
        {
          user: targetUserId
        },
        {
          note: noteDTO
        },
        {
          new: true
        }
      );
      if (noteRecord) {
        return { success: true, body: { note: noteRecord.note } };
      } else {
        return { success: false, body: { err: `ChatRoom not founded by User ID : ${targetUserId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async getUserLog(targetUserId) {
    try {
      const userLogRecord = await ChatModel.aggregate([
        {
          $match: {
            sender_user: mongoose.Types.ObjectId(targetUserId),
            tag: { $nin: ['chat', 'picture'] }
          }
        },
        {
          $project: {
            tag: 1,
            body: {
              text: 1,
              time: 1,
              kilograms: 1,
              location: 1,
              contentType: 1,
              key: 1
            },
            created_at_date: { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } }, ' '] }, 0] }
          }
        },
        {
          $sort: {
            created_at: -1
          }
        }
      ]);
      if (userLogRecord) {
        const groupByUserLogRecord = groupBy(userLogRecord, 'created_at_date');
        const groupByTag = Object.keys(groupByUserLogRecord).map(date => {
          const result = {};
          result[date] = groupByOnce(groupByUserLogRecord[date], 'tag');
          return result;
        });
        return { success: true, body: { userLogRecord: groupByTag } };
      } else {
        return { success: false, body: { err: `Coach not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }
}
