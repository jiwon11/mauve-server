import UserModel from '../models/user';

export default class UserService {
  static async sign(userDTO) {
    try {
      let userRecord, created;
      const existUser = await UserModel.findOne(userDTO).exec();
      if (existUser) {
        userRecord = existUser;
        created = false;
      } else {
        const newUser = new UserModel(userDTO);
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
      const userRecord = await UserModel.findById(ID).exec();
      return { userRecord: userRecord };
    } catch (err) {
      console.log(err);
      return { result: 'fail', error: err };
    }
  }
}
