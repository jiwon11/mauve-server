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

  static async findById(roomId) {
    try {
      const roomRecord = await RoomModel.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(roomId) } },
        {
          $lookup: {
            from: 'USER',
            localField: 'member',
            foreignField: '_id',
            as: 'member'
          }
        },
        { $project: { _id: 1, title: 1, createdAt: 1, 'member.name': 1, 'member._id': 1, 'member.profile_img.location': 1 } }
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

  static async setCharge(req, roomId, user) {
    try {
      const roomRecord = await RoomModel.findOne({ _id: roomId });
      if (roomRecord) {
        if (roomRecord.member.length > 3) {
          return { success: false, body: { message: `허용 인원을 초과하였습니다.` } };
        } else {
          if (roomRecord.member.indexOf(user._id) !== -1) {
            return { success: false, body: { message: `매니저는 이미 해당 유저의 담당입니다.` } };
          } else {
            roomRecord.member.push(user);
            await roomRecord.save();
          }
        }
        req.app
          .get('io')
          .of('/chat')
          .to(roomId)
          .emit('join', {
            sender: 'system',
            chat: `${user.name}님이 매니저로 입장하셨습니다.`
          });
        // const chatRecords = await ChatModel.find({ room: roomRecord._id }).sort('createdAt');
        return { success: true, body: { room: roomRecord } };
      } else {
        return { success: false, body: { message: `Room not founded by ID : ${roomId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
