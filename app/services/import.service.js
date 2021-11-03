import UserModel from '../models/user';
import OrderModel from '../models/order';
import itemModel from '../models/item';
import IMPORT from '../libs/utils/import';

export default class ImportService {
  static async requestPayment(userId, customer_uid, itemId) {
    try {
      const getTokenResult = await IMPORT.getToken();
      let accessToken;
      if (getTokenResult.success) {
        accessToken = getTokenResult.body.access_token;
        const itemRecord = await itemModel.findById(itemId).select({ name: 1, amount: 1, role: 1, period: 1 }).lean();
        const requestPaymentResult = await IMPORT.requestPayment(accessToken, userId, customer_uid, itemRecord);
        if (requestPaymentResult.success) {
          const imp_uid = requestPaymentResult.body.response.imp_uid;
          const getPaymentResult = await IMPORT.requestPayment(imp_uid);
          if (getPaymentResult.success) {
            const newOrder = new OrderModel({
              user: userId,
              bills: [requestPaymentResult.body.response]
            });
            await newOrder.save();
            return { success: true, body: { order: newOrder } };
          } else {
            return { success: false, body: { statusCode: 400, message: `import 결제 내역 조회에 실패하였습니다. [${getPaymentResult.body.status}]`, status: getPaymentResult.body.status } };
          }
        } else {
          return { success: false, body: { statusCode: 400, message: `import 결제 요청에 실패하였습니다. [${requestPaymentResult.body.status}]` } };
        }
      } else {
        return { success: false, body: { statusCode: 400, message: `import access_token 취득에 실패하였습니다. ` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async createSchedule(imp_uid, merchant_uid) {
    try {
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
        const requestPaymentResult = await IMPORT.requestPayment(accessToken, userId, customer_uid, itemRecord);
        if (requestPaymentResult.success) {
          const getPaymentResult = await IMPORT.requestPayment(imp_uid);
          if (getPaymentResult.success) {
            await OrderModel.findAndUpdate(
              { user: userId },
              {
                $push: {
                  customer_uid: { $each: [customer_uid] }
                }
              }
            );
            return { success: true, body: { order: newOrder } };
          } else {
            return { success: false, body: { statusCode: 400, message: `import 결제 내역 조회에 실패하였습니다. [${getPaymentResult.body.status}]`, status: getPaymentResult.body.status } };
          }
        } else {
          return { success: false, body: { statusCode: 400, message: `import access_token 취득에 실패하였습니다. ` } };
        }
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }
}
