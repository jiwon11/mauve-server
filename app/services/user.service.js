import UserModel from '../models/user';

export default class UserService {
  static async sign(userDTO, profileImgDTO) {
    try {
      let userRecord, created;
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
      const userRecord = await UserModel.findOne({ _id: ID }).select({ name: 1, phone_NO: 1, role: 1, profile_img: 1 }).lean();
      if (userRecord) {
        return { success: true, body: { userRecord } };
      } else {
        return { success: false, body: { message: `User not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { result: 'fail', body: err.message };
    }
  }

  static async addCustomerUid(ID, customer_uid) {
    try {
      const userRecord = await ChatModel.findByIdAndUpdate(ID, {
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
      return { result: 'fail', body: err.message };
    }
  }
}
