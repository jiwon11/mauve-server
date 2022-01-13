import PeriodModel from '../models/period';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { calPhase, adjustEffortDate, calPeriodSchedule } from '../libs/utils/moment';

export default class PeriodService {
  static async add(periodDTO) {
    try {
      const periodRecord = await PeriodModel.insertMany(periodDTO);
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

  static async getAll(userId, limit) {
    try {
      const pipeline = [
        {
          $match: {
            user: mongoose.Types.ObjectId(userId)
          }
        },
        {
          $project: {
            ovulation_day: { $dateToString: { format: '%Y-%m-%d', date: '$ovulation_day', timezone: 'Asia/Seoul' } },
            start: { $dateToString: { format: '%Y-%m-%d', date: '$start', timezone: 'Asia/Seoul' } },
            end: { $dateToString: { format: '%Y-%m-%d', date: '$end', timezone: 'Asia/Seoul' } }
          }
        },
        {
          $sort: {
            start: -1
          }
        }
      ];
      if (limit) {
        pipeline.push({ $limit: limit });
      }
      const periodRecord = await PeriodModel.aggregate(pipeline);
      return { success: true, body: periodRecord };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async statistic(periodRecord) {
    try {
      const periodLen = periodRecord.length;
      let cycleLen = 0;
      let cycleSum = 0;
      let termSum = 0;
      for (let i = 0; i < periodLen; i++) {
        if (periodRecord[i].end !== null) {
          const termStart = moment(periodRecord[i].start);
          const termEnd = moment(periodRecord[i].end);
          const termDiff = moment.duration(termEnd.diff(termStart)).asDays() + 1;
          termSum += termDiff;
          if (periodRecord[i + 1]) {
            const thisMonth = moment(periodRecord[i].start);
            const lastMonth = moment(periodRecord[i + 1].start);
            const cycleDiff = moment.duration(thisMonth.diff(lastMonth)).asDays();
            cycleSum += cycleDiff;
            cycleLen++;
          }
        }
      }
      const cycleAvg = parseFloat((cycleSum / cycleLen).toFixed(0));
      const termAvg = parseFloat((termSum / periodLen).toFixed(0));
      const predictStartDate = moment(periodRecord[0].start, 'YYYY-MM-DD').add(cycleAvg, 'days').format('YYYY-MM-DD');
      const predictOvulationDate = moment(predictStartDate, 'YYYY-MM-DD').subtract(14, 'days').format('YYYY-MM-DD');
      const predictEndDate = moment(predictStartDate, 'YYYY-MM-DD')
        .add(termAvg - 1, 'days')
        .format('YYYY-MM-DD');
      return { success: true, body: { cycleAvg, termAvg, predict: { start: predictStartDate, ovulation_day: predictOvulationDate, end: predictEndDate } } };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async phase(periodRecord, statistic, step) {
    try {
      const duringPeriod = periodRecord;
      duringPeriod.end = periodRecord.end ? periodRecord.end : moment(periodRecord.start).tz('Asia/Seoul').add(statistic.termAvg, 'days').format('YYYY-MM-DD');
      const thisMonthAllPhase = calPhase(duringPeriod, 'this');
      const predictMonthPhase = calPhase(statistic.predict, 'next');
      const adjustThisMonthPhase = adjustEffortDate(thisMonthAllPhase, predictMonthPhase);
      //const phaseInThisMonth = thisMonthPhase.filter(phase => phase.is_between === true);
      //const monthPhase = phaseInThisMonth.length > 0 ? thisMonthPhase : adjustNextMonthPhase;
      if (step === 'current') {
        const existCurrentPhase = thisMonthAllPhase.filter(phase => phase.is_between === true);
        const currentPhase = existCurrentPhase[0];
        //const periodPhase = monthPhase.filter(phase => phase.phase === 'period')[0];
        //const periodSchedule = calPeriodSchedule(monthPhase, periodPhase, statistic.predict);
        return { success: true, body: { current_phase: currentPhase, this_month_all_phase: adjustThisMonthPhase /*predict_month_all_phase: predictMonthPhase*/ } };
      } else {
        return { success: true, body: thisMonthPhase.concat(predictMonthPhase) };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
