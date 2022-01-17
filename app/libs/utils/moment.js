import moment from 'moment-timezone';

export const today = moment().tz('Asia/Seoul').startOf('day');

export const calPhase = (duringPeriod, month) => {
  const phaseName = ['period', 'golden_time', 'effort_time', 'before_period'];
  const phaseList = phaseName.map(phase => {
    let start_date, end_date, phase_kor;
    if (phase === 'period') {
      start_date = duringPeriod.start;
      end_date = duringPeriod.end ? duringPeriod.end : today.format('YYYY-MM-DD');
      phase_kor = '월경기';
    } else if (phase === 'golden_time') {
      start_date = moment(duringPeriod.end).tz('Asia/Seoul').add(1, 'days').format('YYYY-MM-DD');
      end_date = moment(start_date).add(7, 'days').format('YYYY-MM-DD');
      phase_kor = '황금기';
    } else if (phase === 'effort_time') {
      start_date = moment(duringPeriod.end).tz('Asia/Seoul').add(9, 'days').format('YYYY-MM-DD');
      end_date = moment(start_date).add(7, 'days').format('YYYY-MM-DD');
      phase_kor = '유지기';
    } else if (phase === 'before_period') {
      start_date = moment(duringPeriod.end).tz('Asia/Seoul').add(17, 'days').format('YYYY-MM-DD');
      end_date = moment(start_date).add(7, 'days').format('YYYY-MM-DD');
      phase_kor = '월경 전';
    }
    return {
      predict: month === 'this' ? false : true,
      phase: phase,
      phase_kor: phase_kor,
      start_date: start_date,
      end_date: end_date,
      get is_between() {
        return moment().tz('Asia/Seoul').isBetween(this.start_date, this.end_date, 'day', '[]');
      }
    };
  });
  if (phaseList.filter(phase => phase.is_between === true).length === 0) {
    phaseList.push({
      predict: month === 'this' ? false : true,
      phase: 'delayed',
      phase_kor: '지연',
      start_date: moment(phaseList[phaseList.length - 1].end_date)
        .tz('Asia/Seoul')
        .add(1, 'days')
        .format('YYYY-MM-DD'),
      end_date: moment('9999-12-31').tz('Asia/Seoul').format('YYYY-MM-DD'),
      get is_between() {
        return moment().tz('Asia/Seoul').isBetween(this.start_date, this.end_date, 'day', '[]');
      }
    });
  }
  return phaseList;
};

export const adjustEffortDate = (thisMonthPhase, nextMonthPhase) => {
  const thisMonthBeforePeriod = thisMonthPhase.filter(phase => phase.phase === 'before_period')[0];
  const nextMonthPeriod = nextMonthPhase.filter(phase => phase.phase === 'period')[0];
  const thisMonthEffortTime = thisMonthPhase.filter(phase => phase.phase === 'effort_time')[0];
  const phaseDateDiff = Math.abs(moment(thisMonthBeforePeriod.end_date).diff(moment(nextMonthPeriod.start_date).tz('Asia/Seoul'), 'days')) - 1;
  if (phaseDateDiff !== 1) {
    thisMonthEffortTime.end_date = moment(thisMonthEffortTime.end_date).tz('Asia/Seoul').add(phaseDateDiff, 'days').format('YYYY-MM-DD');
    thisMonthBeforePeriod.start_date = moment(thisMonthBeforePeriod.start_date).tz('Asia/Seoul').add(phaseDateDiff, 'days').format('YYYY-MM-DD');
    thisMonthBeforePeriod.end_date = moment(thisMonthBeforePeriod.end_date).tz('Asia/Seoul').add(phaseDateDiff, 'days').format('YYYY-MM-DD');
  }
  return thisMonthPhase;
};

export const calPeriodSchedule = (currentPhase, periodPhase, predictPeriod) => {
  //d-day 계산의 경우 시작일을 포함 안함.
  let periodSchedule = {
    today: today.format('YYYY-MM-DD')
  };
  if (currentPhase.phase === 'period') {
    //월경기 phase일 경우, 오늘이 월경 시작일보다 작을 수 없음.
    periodSchedule.predict = periodPhase.predict;
    periodSchedule.start_date = periodPhase.start_date;
    periodSchedule.time_diff = today.diff(moment(periodPhase.start_date).tz('Asia/Seoul'), 'days') + 1;
  } else {
    if (today.isAfter(moment(periodPhase.end_date).tz('Asia/Seoul'))) {
      periodSchedule.predict = periodPhase.predict;
      periodSchedule.start_date = predictPeriod.start_date;
      periodSchedule.time_diff = today.diff(moment(predictPeriod.start).tz('Asia/Seoul'), 'days');
    } else if (today.isBefore(moment(periodPhase.start_date).tz('Asia/Seoul'))) {
      //오늘이 월경기의 시작일보다 작을 경우가 있을 수 있는가
      periodSchedule.predict = periodPhase.predict;
      periodSchedule.start_date = periodPhase.start_date;
      periodSchedule.time_diff = today.diff(moment(periodPhase.start_date).tz('Asia/Seoul'), 'days');
    }
  }
  return periodSchedule;
};

export const getUserAge = birthdate => {
  const todayDate = moment().tz('Asia/Seoul');
  const birthDate = moment(birthdate).tz('Asia/Seoul');
  let age = todayDate.year() - birthDate.year();
  const month = todayDate.month() - birthDate.month();
  if (month < 0 || (month === 0 && todayDate.date() < birthDate.date())) {
    age--;
  }
  return age;
};
