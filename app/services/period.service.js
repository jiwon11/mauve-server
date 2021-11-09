import PeriodModel from '../models/period';
import moment from 'moment-timezone';
import mongoose from 'mongoose';

export default class PeriodService {
  static async add(periodDTO) {
    try {
      const periodRecord = await PeriodModel.create(periodDTO);
      return { success: true, body: { periodRecord } };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async update(periodId, userId, periodDTO) {
    try {
      const periodRecord = await PeriodModel.findOneAndUpdate(
        {
          _id: periodId,
          user: userId
        },
        periodDTO,
        {
          rawResult: true
        }
      );
      return { success: true, body: { periodRecord: periodRecord.value } };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async statistic(userId) {
    try {
      const periodRecord = await PeriodModel.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
            end: { $ne: null }
          }
        },
        {
          $project: {
            start: 1,
            end: 1
          }
        },
        {
          $sort: {
            end: -1
          }
        }
      ]);
      const periodLen = periodRecord.length;
      let cycleLen = 0;
      let cycleSum = 0;
      let termSum = 0;
      for (let i = 0; i < periodLen; i++) {
        const termStart = moment(periodRecord[i].start);
        const termEnd = moment(periodRecord[i].end);
        const termDiff = moment.duration(termEnd.diff(termStart)).asDays() + 1;
        termSum += termDiff;
        if (periodRecord[i + 1]) {
          const thisMonth = moment(periodRecord[i].start);
          const lastMonth = moment(periodRecord[i + 1].start);
          const cycleDiff = moment.duration(thisMonth.diff(lastMonth)).asDays() + 1;
          cycleSum += cycleDiff;
          cycleLen++;
        }
      }
      const cycleAvg = parseFloat(cycleSum / cycleLen).toFixed(0);
      const termAvg = parseFloat(termSum / periodLen).toFixed(0);
      return { success: true, body: { cycleAvg, termAvg, periodRecord } };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
