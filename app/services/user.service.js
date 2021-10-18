import UserModel from '../models/user';
import ClassModel from '../models/class';

export default class UserService {
  static async sign(userDTO, profileImgDTO) {
    try {
      let userRecord, created;
      const existUser = await UserModel.findOne(userDTO);
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
      return { success: false, body: err };
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
      return { result: 'fail', body: err };
    }
  }
}
