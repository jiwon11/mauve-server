import NotificationModel from '../models/notification';
import mongoose from 'mongoose';

export default class NotificationService {
  static async createByChat(senderId, room, chatDTO) {
    try {
      let notificationDTO = {};
      notificationDTO.sender_coach = senderId;
      notificationDTO.title = chatDTO.sender.name;
      notificationDTO.notified_user = room.user;
      if (chatDTO.tag === 'chat') {
        notificationDTO.body = chatDTO.body.text;
      } else if (chatDTO.tag === 'weight') {
        notificationDTO.body = '몸무게';
      } else {
        notificationDTO.body = '사진';
      }
      notificationDTO.data = { id: chatDTO._id, type: 'chat' };
      const newNotificationRecord = await NotificationModel.create(notificationDTO);
      return { success: true, body: newNotificationRecord };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async getAllByUserId(receiverId, receiverRole) {
    try {
      const matchTransform = {};
      matchTransform[`notified_${receiverRole}`] = mongoose.Types.ObjectId(receiverId);
      const pipeline = [
        {
          $match: matchTransform
        },
        {
          $lookup: {
            from: 'USER',
            //localField: 'sender_user',
            //foreignField: '_id',
            let: { user: '$sender_user' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$user'] }
                }
              },
              { $project: { _id: 1, name: 1, profile_img: '$profile_img.location', thumbnail: '$profile_img.thumbnail', deleted: 1 } }
            ],
            as: 'sender_user'
          }
        },
        {
          $lookup: {
            from: 'COACH',
            //localField: 'sender_coach',
            //foreignField: '_id',
            let: { coach: '$sender_coach' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$coach'] }
                }
              },
              { $project: { _id: 1, name: 1, profile_img: '$profile_img.location', thumbnail: '$profile_img.thumbnail', deleted: 1 } }
            ],
            as: 'sender_coach'
          }
        },
        { $unwind: { path: '$sender_user', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$sender_coach', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            body: 1,
            data: 1,
            sender: { $ifNull: ['$sender_user', '$sender_coach'] },
            created_at: { $dateToString: { format: '%Y-%m-%d %H:%M:%S', date: '$created_at' } }
          }
        },
        {
          $sort: {
            created_at: -1
          }
        }
      ];
      const notificationRecord = await NotificationModel.aggregate(pipeline);
      return { success: true, body: notificationRecord };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async remove(userId, userRole, notificationId) {
    try {
      const deletePipeLine = {};
      deletePipeLine[`notified_${userRole}`] = mongoose.Types.ObjectId(userId);
      if (notificationId !== 'all') {
        deletePipeLine._id = mongoose.Types.ObjectId(notificationId);
      }
      const chatRoomRecord = await NotificationModel.delete(deletePipeLine);
      return { success: true, body: chatRoomRecord };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
