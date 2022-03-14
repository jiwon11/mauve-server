import WeightModel from '../models/weight';
import ChatModel from '../models/chat';
import mongoose from 'mongoose';
import moment from 'moment-timezone';
export default class WeightService {
  static async create(weightDTO) {
    try {
      const weightExistRecord = await WeightModel.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(weightDTO.user),
            time: weightDTO.time,
            $expr: {
              $eq: [onlyDate, { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$date' } }, ' '] }, 0] }]
            }
          }
        }
      ]);
      console.log('weightExistRecord', weightExistRecord);
      if (weightExistRecord.length > 0) {
        return { success: false, body: { statusCode: 403, err: '이미 입력한 날짜와 시간대입니다.' } };
      } else {
        const newWeight = await WeightModel.create(weightDTO);
        const weightRecord = await WeightModel.aggregate([
          {
            $match: {
              _id: mongoose.Types.ObjectId(newWeight._id)
            }
          },
          {
            $project: {
              kilograms: 1,
              time: 1,
              date: 1,
              created_at: 1,
              updated_at: 1
            }
          }
        ]);
        return { success: true, body: weightRecord[0] };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err: err.message } };
    }
  }

  static async getAll(userId, limit, skip) {
    try {
      const pipeline = [
        {
          $match: {
            user: mongoose.Types.ObjectId(userId)
          }
        },
        {
          $project: {
            kilograms: 1,
            time: 1,
            date: { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$date' } },
            created_at: { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } }
          }
        },
        {
          $sort: {
            created_at: -1
          }
        }
      ];
      if (limit) {
        pipeline.push({ $limit: limit });
      }
      if (skip) {
        pipeline.push({ $skip: skip });
      }
      const weightRecord = await WeightModel.aggregate(pipeline);
      return { success: true, body: weightRecord };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async update(weightId, weightDTO) {
    try {
      const weight = await WeightModel.findOneAndUpdate(
        {
          _id: weightId
        },
        {
          kilograms: weightDTO.kilograms,
          time: weightDTO.time,
          date: weightDTO.date
        },
        {
          fields: { kilograms: 1, time: 1, date: 1, created_at: 1, updated_at: 1 },
          new: true
        }
      );
      const updateChatFieldResult = await ChatModel.findOneAndUpdate(
        {
          'body._id': mongoose.Types.ObjectId(weightId)
        },
        {
          'body.kilograms': weightDTO.kilograms,
          'body.time': weightDTO.time,
          'body.date': weightDTO.date
        },
        {
          new: true
        }
      );
      console.log(updateChatFieldResult);
      if (weight) {
        return { success: true, body: weight };
      } else {
        return { success: false, body: '해당 ID를 가진 몸무게 데이터가 없습니다.' };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async remove(userId, weightId) {
    try {
      const weightExistRecord = await WeightModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(weightId),
            user: mongoose.Types.ObjectId(userId)
          }
        }
      ]);
      if (weightExistRecord.length > 0) {
        await ChatModel.delete({
          'body._id': mongoose.Types.ObjectId(weightId)
        });
        const weightRecord = await WeightModel.delete({ _id: mongoose.Types.ObjectId(weightId), user: mongoose.Types.ObjectId(userId) });
        return { success: true, body: weightRecord };
      } else {
        return { success: false, body: '해당 유저ID와 몸무게ID를 가진 데이터가 없습니다.' };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async updateField() {
    try {
      const updateFieldResult = await WeightModel.updateMany({}, [{ $set: { date: { $dateFromString: { dateString: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } } } } } }]);
      const updateChatFieldResult = await ChatModel.updateMany({ tag: 'weight' }, [
        {
          $set: {
            'body.date': { $dateFromString: { dateString: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } } } },
            'body.created_at': '$created_at',
            'body.updated_at': '$created_at'
          }
        }
      ]);
      return { success: true, body: updateFieldResult };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
