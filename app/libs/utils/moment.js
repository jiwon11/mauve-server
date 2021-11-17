import moment from 'moment-timezone';

export const today = moment().tz('Asia/Seoul').startOf('day');

export const calPhase = (duringPeriod, time) => {
  const phaseName = ['effort_time', 'before_period', 'period', 'golden_time'];
  const phaseList = phaseName.map(phase => {
    let start_date, end_date;
    if (phase === 'effort_time') {
      start_date = moment(duringPeriod.ovulation_day).tz('Asia/Seoul').subtract(3, 'days').format('YYYY-MM-DD');
      end_date = moment(duringPeriod.start).tz('Asia/Seoul').subtract(9, 'days').format('YYYY-MM-DD');
    } else if (phase === 'before_period') {
      start_date = moment(duringPeriod.start).tz('Asia/Seoul').subtract(8, 'days').format('YYYY-MM-DD');
      end_date = moment(duringPeriod.start).tz('Asia/Seoul').subtract(1, 'days').format('YYYY-MM-DD');
    } else if (phase === 'period') {
      start_date = duringPeriod.start;
      end_date = duringPeriod.end;
    } else if (phase === 'golden_time') {
      start_date = moment(duringPeriod.end).tz('Asia/Seoul').add(1, 'days').format('YYYY-MM-DD');
      end_date = moment(duringPeriod.end).tz('Asia/Seoul').add(7, 'days').format('YYYY-MM-DD');
    }
    return {
      month: time,
      phase: phase,
      start_date: start_date,
      end_date: end_date,
      get is_between() {
        return moment().tz('Asia/Seoul').isBetween(this.start_date, this.end_date, 'day', '[]');
      }
    };
  });
  return phaseList;
};

export const adjustEffortDate = (thisMonthPhase, nextMonthPhase) => {
  const thisMonthGoldenTime = thisMonthPhase.filter(phase => phase.phase === 'golden_time')[0];
  const nextMonthEffortTime = nextMonthPhase.filter(phase => phase.phase === 'effort_time')[0];
  if (moment(thisMonthGoldenTime.end_date).diff(moment(nextMonthEffortTime.start_date).tz('Asia/Seoul'), 'days') !== 1) {
    nextMonthEffortTime.start_date = moment(thisMonthGoldenTime.end_date).tz('Asia/Seoul').add(1, 'days').format('YYYY-MM-DD');
  }
  return nextMonthPhase;
};

export const calPeriodSchedule = (currentPhase, periodPhase, predictPeriod) => {
  //d-day 계산의 경우 시작일을 포함 안함.
  let periodSchedule = {
    today: today.format('YYYY-MM-DD')
  };
  if (currentPhase.phase === 'period') {
    //월경기 phase일 경우, 오늘이 월경 시작일보다 작을 수 없음.
    periodSchedule.month = periodPhase.month;
    periodSchedule.start_date = periodPhase.start_date;
    periodSchedule.time_diff = today.diff(moment(periodPhase.start_date).tz('Asia/Seoul'), 'days') + 1;
  } else {
    if (today.isAfter(moment(periodPhase.end_date).tz('Asia/Seoul'))) {
      periodSchedule.month = periodPhase.month;
      periodSchedule.start_date = predictPeriod.start_date;
      periodSchedule.time_diff = today.diff(moment(predictPeriod.start).tz('Asia/Seoul'), 'days');
    } else if (today.isBefore(moment(periodPhase.start_date).tz('Asia/Seoul'))) {
      //오늘이 월경기의 시작일보다 작을 경우가 있을 수 있는가
      periodSchedule.month = periodPhase.month;
      periodSchedule.start_date = periodPhase.start_date;
      periodSchedule.time_diff = today.diff(moment(periodPhase.start_date).tz('Asia/Seoul'), 'days');
    }
  }
  return periodSchedule;
};
