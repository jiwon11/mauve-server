import ChatService from '../services/chat.service';
import { createNewNotification } from '../queue/notification-queue';
import { createSlackMessage } from '../queue/slack-msg-queue';
import dotenv from 'dotenv';
dotenv.config();

export const getChatsByRoomId = async (req, res) => {
  try {
    const targetRoomId = req.params.roomId;
    const userId = req.user.ID;
    const userRole = req.user.role;
    const from = req.query.from;
    const to = req.query.to;
    const { success, body } = await ChatService.getChatsByRoomId(targetRoomId, userId, userRole, from, to);
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
    const connectedUser = Array.from(new Set(sockets.map(socket => socket.handshake.auth._id)));
    console.log('connectedUser', connectedUser);
    const postChatResult = await ChatService.postChat(io, connectedUser, senderId, senderRole, targetRoomId, { text: chatBody });
    if (postChatResult.success) {
      if (senderRole === 'coach') {
        await createNewNotification({ senderId, senderRole, chatRoomId: targetRoomId, connectedUser, chatDTO: postChatResult.body });
      } else {
        if (process.env.NODE_ENV === 'development') {
          await createSlackMessage(postChatResult.body);
        }
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
    chatMediaDTO.thumbnail = `${process.env.CLOUD_FRONT_URL}/${chatMediaDTO.key}?f=png&q=100`;
    const senderId = req.user.ID;
    const senderRole = req.user.role;
    const io = await req.app.get('io');
    const sockets = await io.of('/chat').in(targetRoomId).fetchSockets();
    const connectedUser = Array.from(new Set(sockets.map(socket => socket.handshake.auth._id)));
    console.log('connectedUser', connectedUser);
    const postChatMediaResult = await ChatService.postChat(io, connectedUser, senderId, senderRole, targetRoomId, chatMediaDTO, media_tag);
    if (postChatMediaResult.success) {
      if (senderRole === 'coach') {
        await createNewNotification({ senderId, senderRole, chatRoomId: targetRoomId, connectedUser, chatDTO: postChatMediaResult.body });
      } else {
        if (process.env.NODE_ENV === 'production') {
          await createSlackMessage(postChatMediaResult.body);
        }
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
