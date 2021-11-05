import RoomModel from '../models/chat_room';
import mongoose from 'mongoose';
export default class roomService {
  static async create(req, roomDTO) {
    try {
      const room = new RoomModel(roomDTO);
      const newRoom = await room.save();
      const io = req.app.get('io');
      io.of('/room').emit('newRoom', newRoom);
      return { success: true, body: newRoom };
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

  static async findAll(limit = 20, offset = 0) {
    try {
      const roomRecords = await RoomModel.aggregate([
        {
          $lookup: {
            from: 'USER',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'COACH',
            localField: 'coach',
            foreignField: '_id',
            as: 'coach'
          }
        },
        { $project: { _id: 1, title: 1, createdAt: 1, 'user.name': 1, 'user._id': 1, 'user.profile_img.location': 1, 'coach.name': 1, 'coach._id': 1, 'coach.profile_img.location': 1 } },
        { $limit: limit },
        { $skip: offset }
      ]);
      return { success: true, body: { room: roomRecords } };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async findById(roomId) {
    try {
      const roomRecord = await RoomModel.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(roomId) } },
        {
          $lookup: {
            from: 'USER',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'COACH',
            localField: 'coach',
            foreignField: '_id',
            as: 'coach'
          }
        },
        { $project: { _id: 1, title: 1, createdAt: 1, 'user.name': 1, 'user._id': 1, 'user.profile_img.location': 1, 'coach.name': 1, 'coach._id': 1, 'coach.profile_img.location': 1 } }
      ]);
      if (roomRecord) {
        return { success: true, body: { room: roomRecord[0] } };
      } else {
        return { success: false, body: { message: `Room not founded by ID : ${roomId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async setCharge(req, roomId, coach) {
    try {
      const roomRecord = await RoomModel.findOne({ _id: roomId });
      if (roomRecord) {
        if (roomRecord.coach) {
          return { success: false, body: { message: '해당 사용자는 이미 코치가 배정되어 있습니다.' } };
        } else {
          roomRecord.coach = coach._id;
          await roomRecord.save();
          req.app
            .get('io')
            .of('/chat')
            .to(roomId)
            .emit('join', {
              sender: 'system',
              chat: `${coach.name}님이 매니저로 입장하셨습니다.`
            });
          // const chatRecords = await ChatModel.find({ room: roomRecord._id }).sort('createdAt');
          return { success: true, body: { room: roomRecord } };
        }
      } else {
        return { success: false, body: { message: `Room not founded by ID : ${roomId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
