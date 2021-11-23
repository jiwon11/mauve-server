import mongoose from 'mongoose';
import OrderModel from '../models/order';

export default class OrderService {
  static async create(userId, itemId, bills, customer_uid, merchant_uid) {
    try {
      const newOrder = await OrderModel.create({
        user: userId,
        item: itemId,
        bills,
        customer_uid,
        merchant_uid
      });
      return { success: true, body: newOrder };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async getRecentOrder(userId) {
    try {
      const orderRecord = await OrderModel.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId)
          }
        },
        {
          $project: {
            _id: 1,
            customer_uid: 1
          }
        },
        {
          $sort: {
            created_at: -1
          }
        }
      ]);
      if (orderRecord) {
        return { success: true, body: orderRecord[0] };
      } else {
        return { success: false, body: { message: `User not founded by ID : ${userId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
