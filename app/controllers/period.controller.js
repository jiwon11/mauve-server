import PeriodService from '../services/period.service';
import UserService from '../services/user.service';
import moment from 'moment-timezone';

export const add = async (req, res) => {
  try {
    const userId = req.user.ID;
    const periodDTO = req.body.map(period => {
      period.start = moment(period.start).tz('Asia/seoul').format('YYYY-MM-DD');
      period.ovulation_day = moment(period.start).tz('Asia/seoul').subtract(14, 'days').format('YYYY-MM-DD');
      period.end = period.hasOwnProperty('end') ? (period.end = moment(period.end).tz('Asia/seoul').format('YYYY-MM-DD')) : null;
      period.user = userId;
      return period;
    });
    const periodAddResult = await PeriodService.add(periodDTO);
    if (periodAddResult.success) {
      return res.jsonResult(201, periodAddResult.body);
    } else {
      return res.jsonResult(500, { message: 'Period Add Service Error', body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};

export const update = async (req, res) => {
  try {
    const userId = req.user.ID;
    const periodId = req.params.id;
    const periodDTO = req.body;
    periodDTO.start = moment(periodDTO.start).tz('Asia/seoul').format('YYYY-MM-DD');
    periodDTO.ovulation_day = moment(periodDTO.start).tz('Asia/seoul').subtract(14, 'days').format('YYYY-MM-DD');
    periodDTO.end = periodDTO.hasOwnProperty('end') ? (periodDTO.end = moment(periodDTO.end).tz('Asia/seoul').format('YYYY-MM-DD')) : null;
    const { success, body } = await PeriodService.update(periodId, userId, periodDTO);
    if (success) {
      return res.jsonResult(201, body);
    } else {
      return res.jsonResult(500, { message: 'User Service Error', err: existUser.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};

export const statistic = async (req, res) => {
  try {
    const userId = req.user.ID;
    const periodResult = await PeriodService.getAll(userId);
    if (periodResult.success) {
      const { success, body } = await PeriodService.statistic(periodResult.body);
      if (success) {
        return res.jsonResult(200, body);
      } else {
        return res.jsonResult(500, { message: 'Period Statistic Service Error', body });
      }
    } else {
      return res.jsonResult(500, { message: 'Period GetAll Service Error', body: periodResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};

export const phase = async (req, res) => {
  try {
    const userId = req.user.ID;
    const step = req.params.step;
    if (['current', 'all'].indexOf(step) !== -1) {
      const periodResult = await PeriodService.getAll(userId);
      if (periodResult.success) {
        const periodStatisticResult = await PeriodService.statistic(periodResult.body);
        const periodPhaseResult = await PeriodService.phase(periodResult.body[0], periodStatisticResult.body, step);
        if (periodPhaseResult.success) {
          return res.jsonResult(200, periodPhaseResult.body);
        } else {
          return res.jsonResult(500, { message: 'Period Phase Service Error', body });
        }
      } else {
        return res.jsonResult(500, { message: 'Period GetAll Service Error', body });
      }
    } else {
      return res.jsonResult(500, { message: 'Period Controller Error', body: '유효하지 않는 파라미터입니다.' });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Period Controller Error', err });
  }
};
