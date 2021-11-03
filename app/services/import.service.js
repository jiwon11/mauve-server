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
          const newOrder = new OrderModel({
            user: userId,
            item: itemId,
            bills: requestPaymentResult.body.response,
            customer_uid: customer_uid,
            merchant_uid: requestPaymentResult.body.response.merchant_uid
          });
          await newOrder.save();
          const bookingPaymentResult = await IMPORT.bookingPayments(accessToken, customer_uid, userId, itemRecord);
          if (bookingPaymentResult.success) {
            return { success: true, body: { order: newOrder } };
          } else {
            return { success: false, body: { statusCode: 400, message: `import 결제 예약 등록에 실패하였습니다. [${bookingPaymentResult.body.status}]` } };
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

  static async callbackSchedule(imp_uid, merchant_uid) {
    try {
      const getTokenResult = await IMPORT.getToken();
      let accessToken;
      if (getTokenResult.success) {
        accessToken = getTokenResult.body.access_token;
        const getPaymentResult = await IMPORT.getPayment(accessToken, imp_uid);
        if (getPaymentResult.success) {
          const newOrder = new OrderModel({
            user: userId,
            item: itemId,
            bills: getPaymentResult.body.response,
            customer_uid: customer_uid,
            merchant_uid: merchant_uid
          });
          await newOrder.save();
          return { success: true, body: { order: newOrder } };
        } else {
          return { success: false, body: { statusCode: 400, message: `import 결제 내역 조회에 실패하였습니다. [${getPaymentResult.body.status}]`, status: getPaymentResult.body.status } };
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
