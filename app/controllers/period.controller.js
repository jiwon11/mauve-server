import PeriodService from '../services/period.service';
import UserService from '../services/user.service';
import moment from 'moment-timezone';

export const add = async (req, res) => {
  try {
    const userId = req.user.ID;
    const periodDTO = req.body.map(period => {
      period.start = moment(period.start).tz('Asia/seoul').format('YYYY-MM-DD');
      period.end = period.hasOwnProperty('end') ? (period.end = moment(period.end).tz('Asia/seoul').format('YYYY-MM-DD')) : null;
      period.user = userId;
      return period;
    });
    const { success, body } = await PeriodService.add(periodDTO);
    if (success) {
      return res.jsonResult(201, body);
    } else {
      return res.jsonResult(500, { message: 'Period Service Error', body });
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
    const { success, body } = await PeriodService.statistic(userId);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'Period Service Error', body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};
