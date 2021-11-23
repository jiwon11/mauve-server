import axios from 'axios';
import dotenv from 'dotenv';
import moment from 'moment-timezone';
import Iamport from 'iamport';
dotenv.config();

const iamport = new Iamport({
  impKey: process.env.IMPORT_KEY,
  impSecret: process.env.IMPORT_SECRET
});

const createMerchantUid = (userId, nextMonth = 0) => {
  /*
  return `${userId}_${moment().tz('Asia/Seoul').add(1, 'months').year()}_${moment().tz('Asia/Seoul').add(1, 'months').month() + nextMonth}`;
  */
  return `${userId}_${moment().unix()}`;
};
// 인증 토큰 발급 받기
export const getToken = async function () {
  try {
    const token = await axios({
      url: 'https://api.iamport.kr/users/getToken',
      method: 'post', // POST method
      headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
      data: {
        imp_key: process.env.IMPORT_KEY, // REST API 키
        imp_secret: process.env.IMPORT_SECRET // REST API Secret
      }
    });
    const { access_token } = token.data.response;
    return { success: true, body: { access_token } };
  } catch (err) {
    console.log(err);
    return { success: false, body: { message: err } };
  }
};

// 구매자 빌링키 정보 조회
export const getBillingKeyInfo = async function (access_token, customer_uid) {
  try {
    const billingKeyResult = await axios({
      url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
      method: 'get',
      headers: { Authorization: access_token }
    });
    console.log(billingKeyResult);
    const { code, message, response } = billingKeyResult.data;
    if (code === 0) {
      return { success: true, body: response };
    } else {
      return { success: false, body: { message: message } };
    }
  } catch (err) {
    console.log(err);
    return { success: false, body: { message: err } };
  }
};

//여러 개의 빌링키를 한 번에 조회
export const getMultiBillingKey = async function (access_token, customerUidList) {
  try {
    const billingKeyResult = await axios({
      url: `https://api.iamport.kr/subscribe/customers?${customerUidList}`,
      method: 'get',
      headers: { Authorization: access_token }
    });
    const { code, message, response } = billingKeyResult.data;
    if (code === 0) {
      return { success: true, body: response };
    } else {
      return { success: false, body: { message: message } };
    }
  } catch (err) {
    console.log(err);
    return { success: false, body: { message: err } };
  }
};

//결제 요청
export const requestPayment = async function (access_token, userId, customer_uid, amount, name) {
  try {
    const paymentResult = await axios({
      url: 'https://api.iamport.kr/subscribe/payments/again',
      method: 'post', // POST method
      headers: { Authorization: access_token },
      data: {
        customer_uid,
        merchant_uid: createMerchantUid(userId) || 'order_monthly_0001', // 새로 생성한 결제(재결제)용 주문 번호
        amount: amount,
        name: name,
        notice_url: '' //결제성공 시 통지될 Notification URL(Webhook URL) 추후 slack 연동
      }
    });
    const { code, message, response } = paymentResult.data;
    if (code === 0) {
      //카드사 통신에 성공(실제 승인 성공 여부는 추가 판단이 필요함)
      if (response.status === 'paid') {
        //카드 정상 승인
        return { success: true, body: { response: response, status: '카드 정상 승인(카드사 통신 성공)', message: message } };
      } else {
        //카드 승인 실패 (예: 고객 카드 한도초과, 거래정지카드, 잔액부족 등) || paymentResult.status : failed 로 수신됨
        return { success: false, body: { status: '카드 승인 실패 (예: 고객 카드 한도초과, 거래정지카드, 잔액부족 등)', message: message } };
      }
    } else {
      // 카드사 요청에 실패 (paymentResult is null)
      return { success: false, body: { status: 'payment result is null', message: message } };
    }
  } catch (err) {
    console.log(err);
    return { success: false, body: { message: err } };
  }
};

// 결제 예약 등록
export const bookingPayments = async function (access_token, customer_uid, userId, amount, name) {
  try {
    const booking = await axios({
      url: 'https://api.iamport.kr/subscribe/payments/schedule',
      method: 'post',
      headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가,
      data: {
        customer_uid: customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
        schedules: [
          {
            merchant_uid: createMerchantUid(userId, 1), // 주문 번호
            schedule_at: moment.tz('Asia/Seoul').add(10, 'second').unix(), // 결제 시도 시각 Unix Time Stamp + 다음 달
            amount: amount,
            currency: 'KRW',
            name: name,
            notice_url: ''
          }
        ]
      }
    });
    const { code, message, response } = booking.data;
    if (code === 0) {
      return { success: true, body: response };
    } else {
      return { success: false, body: message };
    }
  } catch (err) {
    console.log(err);
    return { success: false, body: { message: err.message } };
  }
};

//결제요청예약 취소
export const unschedule = async function (access_token, customer_uid) {
  try {
    const unscheduleResult = await axios({
      url: `https://api.iamport.kr/subscribe/payments/unschedule`,
      method: 'post',
      headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
      data: {
        customer_uid: customer_uid
      }
    });
    const { code, message, response } = unscheduleResult.data;
    if (code === 0) {
      return { success: true, body: response };
    } else {
      return { success: false, body: message };
    }
  } catch (err) {
    console.log(err);
    return { success: false, body: { message: err } };
  }
};

//결제 취소
export const paymentCancel = async function (access_token, paymentData, reason) {
  try {
    const { merchant_uid, imp_uid, amount, cancel_amount, paid_at } = paymentData;
    const paidAtDiffWeeks = Math.ceil(moment.duration(moment().diff(moment.unix(paid_at))).asWeeks()) > 4 ? 4 : Math.ceil(moment.duration(moment().diff(moment.unix(paid_at))).asWeeks());
    const cancelableAmount = (amount - cancel_amount) * ((4 - paidAtDiffWeeks) / 4);
    const paymentCancelResult = await axios({
      url: 'https://api.iamport.kr/payments/cancel',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: access_token // 아임포트 서버로부터 발급받은 엑세스 토큰
      },
      data: {
        reason, // 가맹점 클라이언트로부터 받은 환불사유
        merchant_uid,
        amount: cancelableAmount, // 가맹점 클라이언트로부터 받은 환불금액
        checksum: cancelableAmount // [권장] 환불 가능 금액 입력
      }
    });
    const { code, message, response } = paymentCancelResult.data;
    if (code === 0) {
      return { success: true, body: response };
    } else {
      return { success: false, body: message };
    }
  } catch (err) {
    console.log(err);
    return { success: false, body: { message: err } };
  }
};

export const getPayment = async function (access_token, imp_uid) {
  try {
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
      method: 'get', // GET method
      headers: { Authorization: access_token } // 인증 토큰 Authorization header에 추가
    });
    const response = getPaymentData.data.response;
    const { code, message, status } = response;
    if (status === 'paid') {
      return { success: true, body: response };
    } else {
      return { success: false, body: message };
    }
  } catch (err) {
    console.log(err);
    return { success: false, body: { message: err } };
  }
};
