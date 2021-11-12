import ChatModel from '../models/chat';

export default class chatService {
  static async postChat(req, senderId, senderRole, targetRoomId, chatDTO) {
    try {
      const io = await req.app.get('io');
      const sockets = await io.of('/chat').in(targetRoomId).fetchSockets();
      const connectedUser = sockets.map(socket => socket.handshake.auth._id);
      console.log('connectedUser', connectedUser);
      const chat = new ChatModel({
        room: targetRoomId,
        sender: senderId,
        senderModel: senderRole === 'user' ? 'USER' : 'COACH',
        readers: connectedUser,
        chat: chatDTO
      });
      await chat.save();
      req.app.get('io').of('/chat').to(targetRoomId).emit('chat', chatDTO);
      return { success: true, body: 'ok' };
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async postMedia(req, senderId, senderRole, targetRoomId, chatMediaDTO) {
    try {
      const io = await req.app.get('io');
      const sockets = await io.of('/chat').in(targetRoomId).fetchSockets();
      const connectedUser = sockets.map(socket => socket.handshake.auth._id);
      console.log(connectedUser);
      const chat = new ChatModel({
        room: targetRoomId,
        sender: senderId,
        senderModel: senderRole === 'user' ? 'USER' : 'COACH',
        readers: connectedUser,
        media: chatMediaDTO
      });
      await chat.save();
      req.app.get('io').of('/chat').to(targetRoomId).emit('chat', chatMediaDTO);
      return { success: true, body: 'ok' };
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  } 

  static async getChatsByRoomId(targetRoomId, userId, limit = 20, offset = 0) {
    try {
      console.time('Find Chat');
      const chatRecords = await ChatModel.find({ room: targetRoomId })
        .populate('sender', '_id name profile_img.location')
        .select({ _id: 1, chat: 1, sender: 1, senderModel: 1, readers: 1, nonReadersNum: 2 - { $size: '$readers' } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
      console.timeEnd('Find Chat');
      if (chatRecords[0].readers.indexOf(userId) === -1) {
        console.time('Update Chat Readers');
        const chatRecordIds = chatRecords.map(chat => chat._id);
        await ChatModel.updateMany(
          { _id: { $in: chatRecordIds }, readers: { $nin: [userId] } },
          {
            $push: {
              readers: { $each: [userId] }
            }
          }
        );
        console.timeEnd('Update Chat Readers');
        const updatedChatRecords = await ChatModel.find({ _id: chatRecordIds })
          .populate('sender', '_id name profile_img.location')
          .select({ _id: 1, chat: 1, sender: 1, senderModel: 1, readers: 1, readersNum: { $size: '$readers' } })
          .sort({ createdAt: -1 })
          .lean();
        return { success: true, body: { chats: updatedChatRecords } };
      }
      return { success: true, body: { chats: chatRecords } };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
