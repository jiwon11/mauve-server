import WeightModel from '../models/weight';
import mongoose from 'mongoose';
import moment from 'moment-timezone';
export default class WeightService {
  static async create(weightDTO) {
    try {
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
            created_at: { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } }
          }
        }
      ]);
      return { success: true, body: weightRecord[0] };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
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
}
