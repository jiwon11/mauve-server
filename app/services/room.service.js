import RoomModel from '../models/chat_room';
import ChatModel from '../models/chat';

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

  static async findById(req, roomId) {
    try {
      const roomRecord = await RoomModel.findOne({ _id: roomId }).lean();
      const io = await req.app.get('io');
      if (roomRecord) {
        const clients = await io.of('/chat').in(roomId).allSockets();
        console.log('clients', clients);
        const userCount = clients ? clients.size : 0;
        console.log('userCount', userCount);
        const chatRecords = await ChatModel.find({ room: roomRecord._id }).sort('createdAt');
        return { success: true, body: { room: roomRecord, chats: chatRecords } };
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
            chat: `${user.nickname}님이 매니저로 입장하셨습니다.`
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

  static async chat(req, senderId, targetRoomId, chatDTO) {
    try {
      const chat = new ChatModel({ room: targetRoomId, sender: senderId, chat: chatDTO });
      await chat.save();
      req.app.get('io').of('/chat').to(targetRoomId).emit('chat', chatDTO);
      return { success: true, body: 'ok' };
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async media(req, senderId, targetRoomId, chatMediaDTO) {
    try {
      const chat = new ChatModel({ room: targetRoomId, sender: senderId, media: chatMediaDTO });
      await chat.save();
      req.app.get('io').of('/chat').to(targetRoomId).emit('chat', chatMediaDTO);
      return { success: true, body: 'ok' };
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }
}
