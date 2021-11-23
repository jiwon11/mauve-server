import mongoose from 'mongoose';
import CardModel from '../models/card';
import * as IMPORT from '../libs/utils/import';

export default class CardService {
  static async createBillingKey(userId, billingKeyData) {
    try {
      const newCardRecord = await CardModel.create({ ...{ user: userId }, ...billingKeyData });
      return { success: true, body: newCardRecord };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async getAll(userId) {
    try {
      const cardRecord = await CardModel.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId)
          }
        },
        {
          $project: {
            customer_uid: 1,
            card_name: 1,
            card_number: 1,
            created_at: 1
          }
        }
      ]);
      return { success: true, body: cardRecord };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async deleteBillingKey(customer_uid) {
    try {
      const getTokenResult = await IMPORT.getToken();
      if (!getTokenResult.success) {
        return { success: false, body: { statusCode: 400, message: `import access_token 취득에 실패하였습니다. ` } };
      }
      const accessToken = getTokenResult.body.access_token;
      const deleteBillingKeyResult = await IMPORT.deleteBillingKey(accessToken, customer_uid);
      if (!deleteBillingKeyResult) {
        return { success: false, body: { statusCode: 400, message: `import 구매자의 빌링키 정보 삭제에 실패하였습니다. `, error: deleteBillingKeyResult.body } };
      }
      await CardModel.deleteOne({ customer_uid });
      return { success: true, body: { deleted: deleteBillingKeyResult.success } };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
