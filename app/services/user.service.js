import mongoose from 'mongoose';
import UserModel from '../models/user';
import WhiteListModel from '../models/white_list';
export default class UserService {
  static async sign(userDTO, profileImgDTO) {
    try {
      let userRecord, created;
      const whiteUser = await WhiteListModel.aggregate([
        {
          $match: {
            phone_NO: userDTO.phone_NO
          }
        }
      ]);
      if (whiteUser.length > 0) {
        const existUser = await UserModel.findOne({ phone_NO: userDTO.phone_NO });
        if (existUser) {
          userRecord = existUser;
          created = false;
        } else {
          const newUser = new UserModel({ ...userDTO, ...{ profile_img: profileImgDTO } });
          const saveUser = await newUser.save();
          userRecord = saveUser;
          created = true;
        }
        return { success: true, body: { userRecord, created } };
      } else {
        return { success: false, body: { statusCode: 401, err: 'white User가 아닙니다.' } };
      }
    } catch (err) {
      console.log(err);
      if (err.name === 'ValidationError') {
        let errors = {};

        Object.keys(err.errors).forEach(key => {
          errors[key] = err.errors[key].message;
        });

        return { success: false, body: { statusCode: 400, err: errors } };
      }
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async findById(ID) {
    try {
      const userRecord = await UserModel.findOne({ _id: ID }).select({ name: 1, phone_NO: 1, role: 1, profile_img: '$profile_img.location' }).lean();
      if (userRecord) {
        return { success: true, body: { userRecord } };
      } else {
        return { success: false, body: { message: `User not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async updatePaid(ID, paid) {
    try {
      const userRecord = await UserModel.findByIdAndUpdate(ID, {
        paid: paid
      }).exec();
      if (userRecord) {
        return { success: true, body: { userRecord } };
      } else {
        return { success: false, body: { message: `User not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async addCustomerUid(ID, customer_uid) {
    try {
      const userRecord = await UserModel.findByIdAndUpdate(ID, {
        $push: {
          customer_uid: { $each: [customer_uid] }
        }
      });
      if (userRecord) {
        return { success: true, body: { userRecord } };
      } else {
        return { success: false, body: { message: `User not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async getCustomerUid(userId) {
    try {
      const userRecord = await UserModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(userId)
          },
          $project: {
            _id: 1,
            customer_uid: 1
          }
        }
      ]);
      if (userRecord) {
        return { success: true, body: userRecord };
      } else {
        return { success: false, body: { message: `User not founded by ID : ${userId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
