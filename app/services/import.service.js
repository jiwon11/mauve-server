import OrderModel from '../models/order';
import ItemModel from '../models/item';
import UserService from './user.service';
import * as IMPORT from '../libs/utils/import';
import mongoose from 'mongoose';
export default class ImportService {
  static async getUserCards(userId) {
    try {
      const getTokenResult = await IMPORT.getToken();
      if (!getTokenResult.success) {
        return { success: false, body: { statusCode: 400, message: `import access_token 취득에 실패하였습니다. ` } };
      }
      const accessToken = getTokenResult.body.access_token;
      const userCustomerUidResults = await UserService.getCustomerUid(accessToken, userId);
      if (!userCustomerUidResults.success) {
        return { success: false, body: userCustomerUidResults.body };
      }
      const customerUidList = userCustomerUidResults.body.customer_uid;
      const billKeyResult = await IMPORT.getMultiBillingKey(accessToken, customerUidList);
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
      const getTokenResult = await IMPORT.getToken();
      let accessToken;
      if (getTokenResult.success) {
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
        const requestPaymentResult = await IMPORT.requestPayment(accessToken, userId, customer_uid, itemRecord[0].amount, `${itemRecord[0]._id.toString()}_${itemRecord[0].name}`);
        if (requestPaymentResult.success) {
          const newOrder = await OrderModel.create({
            user: userId,
            item: itemId,
            bills: requestPaymentResult.body.response,
            customer_uid: customer_uid,
            merchant_uid: requestPaymentResult.body.response.merchant_uid
          });
          return { success: true, body: { order: newOrder } };
        } else {
          return { success: false, body: { statusCode: 400, message: `import 결제 요청에 실패하였습니다.`, error: requestPaymentResult.body } };
        }
      } else {
        return { success: false, body: { statusCode: 400, message: `import access_token 취득에 실패하였습니다. ` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async callbackSchedule(imp_uid, merchant_uid) {
    try {
      const getTokenResult = await IMPORT.getToken();
      let accessToken;
      if (getTokenResult.success) {
        accessToken = getTokenResult.body.access_token;
        const getPaymentResult = await IMPORT.getPayment(accessToken, imp_uid);
        if (getPaymentResult.success) {
          console.log(getPaymentResult.body);
          const bookingPaymentResult = await IMPORT.bookingPayments(
            accessToken,
            getPaymentResult.body.customer_uid,
            getPaymentResult.body.customer_uid.split('_')[0],
            getPaymentResult.body.amount,
            getPaymentResult.body.name
          );
          if (bookingPaymentResult.success) {
            return { success: true, body: { schedule: bookingPaymentResult.body.schedule_status } };
          } else {
            return { success: false, body: { statusCode: 400, message: `import 결제 예약 등록에 실패하였습니다.`, error: bookingPaymentResult.body } };
          }
        } else {
          return { success: false, body: { statusCode: 400, message: `import 결제 내역 조회에 실패하였습니다.`, error: getPaymentResult.body } };
        }
      } else {
        return { success: false, body: { statusCode: 400, message: `import access_token 취득에 실패하였습니다. ` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }
}
