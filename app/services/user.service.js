import mongoose from 'mongoose';
import UserModel from '../models/user';
import ChatRoomModel from '../models/chat_room';
import QuestionnaireModel from '../models/questionnaire';
import NotificationModel from '../models/notification';
import WeightModel from '../models/weight';
import PeriodModel from '../models/period';
import WhiteListModel from '../models/white_list';
import moment from 'moment-timezone';
export default class UserService {
  static async sign(userDTO) {
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
        const existUsers = await UserModel.findWithDeleted({ phone_NO: userDTO.phone_NO });
        const existUser = existUsers[0];
        if (existUser) {
          if (existUser.deleted) {
            //const restoredUser = await UserModel.restore({ _id: existUser._id });
            const restoreUser = await UserModel.restore({ _id: existUser._id });
            console.log(restoreUser);
            if (restoreUser.modifiedCount > 0) {
              userRecord = existUser;
              created = false;
            } else {
              return { success: false, body: { statusCode: 404, err: '수정할 회원이 없습니다.' } };
            }
          } else {
            return { success: false, body: { statusCode: 403, err: '이미 등록된 회원입니다.' } };
          }
        } else {
          const newUser = new UserModel(userDTO);
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

  static async login(phoneNumber) {
    try {
      const userRecord = await UserModel.aggregate([
        {
          $match: {
            phone_NO: phoneNumber
          }
        },
        {
          $project: {
            _id: 1,
            role: 1
          }
        }
      ]);
      if (userRecord.length > 0) {
        return { success: true, body: userRecord[0] };
      } else {
        return { success: false, body: { statusCode: 404, err: `User not founded by Phone Number : ${phoneNumber}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err: err.message } };
    }
  }

  static async findById(ID, self) {
    try {
      const projectPipeLine = {
        name: 1,
        phone_NO: 1,
        role: 1,
        profile_img: '$profile_img.location',
        thumbnail: '$profile_img.thumbnail',
        room_id: '$room._id'
      };
      const modelPipeLine = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(ID)
          }
        }
      ];
      if (self) {
        projectPipeLine.notification_config = {
          chat: 1,
          record_feedback: 1,
          plan_assignment: 1,
          mission: 1,
          event: 1
        };
        projectPipeLine.height = 1;
        projectPipeLine.weight = 1;
        modelPipeLine.push({
          $lookup: {
            from: 'CHAT_ROOM',
            localField: '_id',
            foreignField: 'user',
            as: 'room'
          }
        });
        modelPipeLine.push({ $unwind: { path: '$room', preserveNullAndEmptyArrays: true } });
        //projectPipeLine.roomId = '$room._id';
      }
      modelPipeLine.push({
        $project: projectPipeLine
      });
      const userRecord = await UserModel.aggregate(modelPipeLine);
      if (userRecord.length > 0) {
        userRecord[0]._id = userRecord[0]._id.toString();
        return { success: true, body: userRecord[0] };
      } else {
        return { success: false, body: { statusCode: 404, message: `User not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, message: err.message } };
    }
  }

  static async updateNotificationConfig(ID, notificationConfigDTO) {
    try {
      const userRecord = await UserModel.findByIdAndUpdate(ID, { notification_config: notificationConfigDTO }, { new: true });
      if (userRecord) {
        return { success: true, body: userRecord.notification_config };
      } else {
        return { success: false, body: { statusCode: 404, err: `User not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err: err.message } };
    }
  }

  static async update(Id, userDTO, profileImgDTO) {
    try {
      const userRecord = await UserModel.findByIdAndUpdate(Id, { ...userDTO, ...{ profile_img: profileImgDTO } }, { new: true });
      if (userRecord) {
        return { success: true, body: userRecord };
      } else {
        return { success: false, body: { statusCode: 404, err: `User not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err: err.message } };
    }
  }

  static async updatePaid(ID, paid) {
    try {
      const userRecord = await UserModel.findByIdAndUpdate(
        ID,
        {
          has_paid: paid,
          next_payment: paid === true ? moment.tz('Asia/Seoul').add(1, 'month').format() : null
        },
        { new: true }
      ).exec();
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

  static async withdraw(userId) {
    try {
      const userRecord = await UserModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(userId)
          }
        }
      ]);
      if (userRecord.length > 0) {
        const deletedUserChatRoom = await ChatRoomModel.deleteMany({ user: userRecord[0]._id });
        const deletedUserQuestionnaire = await QuestionnaireModel.deleteMany({ user: userRecord[0]._id });
        const deletedUserNotification = await NotificationModel.deleteMany({ user: userRecord[0]._id });
        const deletedUserWeight = await WeightModel.deleteMany({ user: userRecord[0]._id });
        const deletedUserPeriod = await PeriodModel.deleteMany({ user: userRecord[0]._id });
        const deletedUser = await UserModel.deleteById(userId);
        console.log(deletedUser);
        return { success: true, body: { deletedUser, deletedUserChatRoom, deletedUserQuestionnaire, deletedUserNotification, deletedUserWeight, deletedUserPeriod } };
      } else {
        return { success: false, body: { statusCode: 404, err: `User not founded by ID : ${userId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err: err.message } };
    }
  }
}
