import OrderModel from '../models/order';
import ItemModel from '../models/item';
import UserService from './user.service';
import * as IAMPORT from '../libs/utils/iamport';
import mongoose from 'mongoose';
export default class PaymentService {
  static async getUserCards(userId) {
    try {
      const getTokenResult = await IAMPORT.getToken();
      if (!getTokenResult.success) {
        return { success: false, body: { statusCode: 400, message: `import access_token 취득에 실패하였습니다. ` } };
      }
      const accessToken = getTokenResult.body.access_token;
      const userCustomerUidResults = await UserService.getCustomerUid(accessToken, userId);
      if (!userCustomerUidResults.success) {
        return { success: false, body: userCustomerUidResults.body };
      }
      const customerUidList = userCustomerUidResults.body.customer_uid;
      const billKeyResult = await IAMPORT.getMultiBillingKey(accessToken, customerUidList);
      if (!billKeyResult.success) {
        return { success: false, body: billKeyResult.body };
      }
      return { success: true, body: billKeyResult.body };
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async requestPayment(userId, customer_uid, itemId) {
    try {
      console.time('getToken');
      const getTokenResult = await IAMPORT.getToken();
      let accessToken;
      console.timeEnd('getToken');
      if (!getTokenResult.success) {
        return { success: false, body: { statusCode: 400, message: `import access_token 취득에 실패하였습니다. ` } };
      }
      accessToken = getTokenResult.body.access_token;
      const itemRecord = await ItemModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(itemId)
          }
        },
        {
          $project: {
            name: 1,
            amount: 1,
            period: 1
          }
        }
      ]);
      console.time('requestPayment');
      const requestPaymentResult = await IAMPORT.requestPayment(accessToken, userId, customer_uid, itemRecord[0].amount, `${itemRecord[0]._id.toString()}_${itemRecord[0].name}`);
      console.timeEnd('requestPayment');
      if (requestPaymentResult.success) {
        return { success: true, body: requestPaymentResult.body.response };
      } else {
        return { success: false, body: { statusCode: 400, message: `import 결제 요청에 실패하였습니다.`, error: requestPaymentResult.body } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async callbackSchedule(imp_uid, merchant_uid) {
    try {
      const getTokenResult = await IAMPORT.getToken();
      let accessToken;
      if (!getTokenResult.success) {
        return { success: false, body: { statusCode: 400, message: `import access_token 취득에 실패하였습니다. ` } };
      }
      accessToken = getTokenResult.body.access_token;
      const getPaymentResult = await IAMPORT.getPayment(accessToken, imp_uid);
      if (!getPaymentResult.success) {
        return { success: false, body: { statusCode: 400, message: `import 결제 내역 조회에 실패하였습니다.`, error: getPaymentResult.body } };
      }
      const bookingPaymentResult = await IAMPORT.bookingPayments(
        accessToken,
        getPaymentResult.body.customer_uid,
        getPaymentResult.body.customer_uid.split('_')[0],
        getPaymentResult.body.amount,
        getPaymentResult.body.name
      );
      if (!bookingPaymentResult.success) {
        return { success: false, body: { statusCode: 400, message: `import 결제 예약 등록에 실패하였습니다.`, error: bookingPaymentResult.body } };
      }
      return { success: true, body: { payment: getPaymentResult.body, schedule: bookingPaymentResult.body.schedule_status } };
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async unschedule(paymentData, reason) {
    try {
      const getTokenResult = await IAMPORT.getToken();
      if (!getTokenResult.success) {
        return { success: false, body: { statusCode: 400, error: `import access_token 취득에 실패하였습니다. ` } };
      }
      const accessToken = getTokenResult.body.access_token;
      const paymentCancel = await IAMPORT.paymentCancel(accessToken, paymentData, reason);
      if (!paymentCancel.success) {
        return { success: false, body: { statusCode: 400, error: `import 결제 취소에 실패하였습니다.`, message: paymentCancel.body } };
      }
      const unscheduleResult = await IAMPORT.unschedule(accessToken, paymentCancel.body.customer_uid, reason);
      if (!unscheduleResult.success) {
        return { success: false, body: { statusCode: 400, error: `import 결제 요청예약 취소에 실패하였습니다.`, message: unscheduleResult.body } };
      }
      return { success: true, body: { cancel: paymentCancel, unschedule: unscheduleResult } };
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }
}
