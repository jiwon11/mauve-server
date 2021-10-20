import UserModel from '../models/user';
import ClassModel from '../models/class';

export default class UserService {
  static async sign(userDTO, profileImgDTO) {
    try {
      let userRecord, created;
      const existUser = await UserModel.findOne({ phone_no: userDTO.phone_NO }).lean();
      if (existUser) {
        userRecord = existUser;
        created = false;
      } else {
        const newUser = UserModel.create({ ...userDTO, ...{ profile_img: profileImgDTO } });
        userRecord = newUser;
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
      const userRecord = await UserModel.findOne({ _id: ID }).select({ nickname: 1, phone_NO: 1, role: 1, profile_img: 1 }).lean();
      if (userRecord) {
        let classInfo;
        if (userRecord.role === 'student') {
          classInfo = await ClassModel.find({ students: { $in: [userRecord._id] } }).lean();
        } else {
          classInfo = await ClassModel.find({ trainer: userRecord._id }).lean();
        }
        return { success: true, body: { userRecord, classInfo } };
      } else {
        return { success: false, body: { message: `User not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { result: 'fail', body: err.message };
    }
  }
}
