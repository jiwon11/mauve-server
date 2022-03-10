import CoachModel from '../models/coach';
import UserModel from '../models/user';
import ChatModel from '../models/chat';
import ChatRoomModel from '../models/chat_room';
import mongoose from 'mongoose';
import { sign, refresh } from '../libs/utils/jwt';
import { groupBy, groupByOnce } from '../libs/utils/conjugation';
import redisClient from '../libs/utils/redis';
import PeriodService from './period.service';
import moment from 'moment-timezone';
//import { today } from '../libs/utils/moment';
import { getUserAge } from '../libs/utils/moment';

export const today = moment().tz('Asia/Seoul').startOf('day');
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

  static async update(Id, coachDTO, profileImgDTO) {
    try {
      const coachRecord = await CoachModel.findByIdAndUpdate(Id, { ...coachDTO, ...{ profile_img: profileImgDTO } }, { new: true });
      if (coachRecord) {
        return { success: true, body: coachRecord };
      } else {
        return { success: false, body: { statusCode: 404, err: `User not founded by ID : ${Id}` } };
      }
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

  static async findOne() {
    try {
      const coachRecord = await CoachModel.aggregate([
        {
          $project: {
            _id: 1,
            name: 1,
            phone_NO: 1,
            role: 1,
            profile_img: '$profile_img.location',
            thumbnail: '$profile_img.thumbnail'
          }
        },
        {
          $sort: { created_at: 1 }
        },
        {
          $limit: 1
        }
      ]);
      if (coachRecord.length > 0) {
        return { success: true, body: coachRecord[0] };
      } else {
        return { success: false, body: { statusCode: 404, message: `Coach not founded ` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, message: err.message } };
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
            profile_img: '$profile_img.location',
            thumbnail: '$profile_img.thumbnail'
          }
        }
      ]);
      if (coachRecord.length > 0) {
        coachRecord[0]._id = coachRecord[0]._id.toString();
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
        return { success: true, body: { ...{ id: coachRecord._id.toString() }, ...coachToken } };
      } else {
        return { success: false, body: { statusCode: 500, err: `Coach not founded by passCode : ${passCode}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async getUserInfo(targetUserId, userRole) {
    try {
      let projectPipeline;
      if (userRole === 'admin') {
        projectPipeline = {
          birthdate: { $dateToString: { format: '%Y-%m-%d', date: '$birthdate' } },
          weight: 1,
          height: 1,
          next_payment_d_day: { $toInt: { $divide: [{ $subtract: [new Date(), '$next_payment'] }, 24 * 60 * 60 * 1000] } },
          next_payment: 1
        };
      } else {
        projectPipeline = {
          name: 1,
          phone_NO: 1,
          birthdate: { $dateToString: { format: '%Y-%m-%d', date: '$birthdate' } },
          weight: 1,
          height: 1,
          next_payment_d_day: { $toInt: { $divide: [{ $subtract: [new Date(), '$next_payment'] }, 24 * 60 * 60 * 1000] } },
          next_payment: 1
        };
      }
      const userInfoRecord = await UserModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(targetUserId)
          }
        },
        {
          $project: projectPipeline
        }
      ]);
      if (userInfoRecord.length > 0) {
        userInfoRecord[0].age = getUserAge(userInfoRecord[0].birthdate);
        const periodResult = await PeriodService.getAll(targetUserId);
        console.log('periodResult', periodResult.body);
        if (!periodResult.success) {
          return { success: false, body: { err: `Period not founded by User ID : ${targetUserId}` } };
        }
        if (periodResult.body.length === 0) {
          return { success: true, body: { userInfo: userInfoRecord[0] } };
        } else {
          periodResult.body.forEach(period => console.log(`today: ${today.format('YYYY-MM-DD')}, period: ${moment(period.start).tz('Asia/Seoul').format('YYYY-MM-DD')}`));
          const recentPeriodRecord = periodResult.body.filter(period => !moment(today.format('YYYY-MM-DD')).isBefore(moment(period.start).tz('Asia/Seoul').format('YYYY-MM-DD'), 'day'))[0];
          console.log('recentPeriodRecord', recentPeriodRecord);
          const periodStatisticResult = await PeriodService.statistic(periodResult.body);
          console.log('periodStatisticResult', periodStatisticResult.body);
          const periodPhaseResult = await PeriodService.phase(recentPeriodRecord, periodStatisticResult.body, 'current');
          console.log('periodPhaseResult', periodPhaseResult.body);
          if (!periodPhaseResult.success) {
            return { success: false, body: { message: 'Period Phase Service Error', err: periodPhaseResult.body } };
          }
          userInfoRecord[0].currentPhase = periodPhaseResult.body.current_phase;
          //const allPhase = Object.values(periodPhaseResult.body.this_month_all_phase).concat(Object.values(periodPhaseResult.body.predict_month_all_phase));
          const renamePeriod = [];
          periodResult.body.forEach(item => {
            if (periodPhaseResult.body.this_month_all_phase.find(phase => phase.start_date === item.start) === undefined) {
              renamePeriod.push({ start_date: item.start, end_date: item.end, phase: 'period' });
            }
          });
          const periodAndPhaseRecord = renamePeriod.concat(periodPhaseResult.body.this_month_all_phase).sort((a, b) => (a.start_date > b.start_date && 1) || -1);
          return { success: true, body: { userInfo: userInfoRecord[0], periodRecord: periodAndPhaseRecord } };
        }
      } else {
        return { success: false, body: { err: `User not founded by User ID : ${targetUserId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err: err.message } };
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
        let note = noteRecord[0].note ? noteRecord[0].note : '';
        return { success: true, body: { note } };
      } else {
        return { success: false, body: { err: `Note not founded by User ID : ${targetUserId}` } };
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
        return { success: false, body: { err: `Note not founded by User ID : ${targetUserId}` } };
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
              date: 1,
              kilograms: 1,
              location: 1,
              thumbnail: 1,
              contentType: 1,
              key: 1
            },
            created_at_date: {
              $cond: [
                { $eq: ['$tag', 'weight'] },
                { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$body.date' } }, ' '] }, 0] },
                { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } }, ' '] }, 0] }
              ]
            },
            created_at_time: { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } }, ' '] }, 1] }
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
        const groupByTag = Object.keys(groupByUserLogRecord)
          .sort()
          .map(date => {
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
