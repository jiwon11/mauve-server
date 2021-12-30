import ChatService from '../services/chat.service';
import dotenv from 'dotenv';
import { createNewNotification } from '../queue/notification-queue';
dotenv.config();

export const getChatsByRoomId = async (req, res) => {
  try {
    const targetRoomId = req.params.roomId;
    const userId = req.user.ID;
    const from = req.query.from;
    const to = req.query.to;
    const { success, body } = await ChatService.getChatsByRoomId(targetRoomId, userId, from, to);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'Chat Service Error', body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};

export const postChat = async (req, res) => {
  try {
    const targetRoomId = req.params.roomId;
    const chatBody = req.body.chat;
    const senderId = req.user.ID;
    const senderRole = req.user.role;
    const io = await req.app.get('io');
    const sockets = await io.of('/chat').in(targetRoomId).fetchSockets();
    const connectedUser = sockets.map(socket => socket.handshake.auth._id);
    console.log('connectedUser', connectedUser);
    const postChatResult = await ChatService.postChat(io, connectedUser, senderId, senderRole, targetRoomId, { text: chatBody });
    if (postChatResult.success) {
      if (senderRole === 'coach') {
        await createNewNotification({ senderId, senderRole, chatRoomId: targetRoomId, connectedUser, chatDTO: postChatResult.body });
      }
      return res.jsonResult(201, postChatResult.body);
    } else {
      return res.jsonResult(500, { message: 'Chat Service Error', err: postChatResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Chat Controller Error', err: err.message });
  }
};

export const postMedia = async (req, res) => {
  try {
    const targetRoomId = req.params.roomId;
    const media_tag = req.params.tag;
    const chatMediaDTO = req.file;
    console.log(chatMediaDTO);
    chatMediaDTO.thumbnail = `${process.env.CLOUD_FRONT_URL}/${chatMediaDTO.key}?w=150&h=150&f=png&q=100`;
    const senderId = req.user.ID;
    const senderRole = req.user.role;
    const io = await req.app.get('io');
    const sockets = await io.of('/chat').in(targetRoomId).fetchSockets();
    const connectedUser = sockets.map(socket => socket.handshake.auth._id);
    console.log('connectedUser', connectedUser);
    const postChatMediaResult = await ChatService.postChat(io, connectedUser, senderId, senderRole, targetRoomId, chatMediaDTO, media_tag);
    if (postChatMediaResult.success) {
      if (senderRole === 'coach') {
        await createNewNotification({ senderId, senderRole, chatRoomId: targetRoomId, connectedUser, chatDTO: postChatResult.body });
      }
      return res.jsonResult(201, postChatMediaResult.body);
    } else {
      return res.jsonResult(500, { message: 'User Service Error', err: postChatMediaResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err: err.message });
  }
};
