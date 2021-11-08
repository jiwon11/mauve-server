import ChatService from '../services/chat.service';

export const getChatsByRoomId = async (req, res) => {
  try {
    const targetRoomId = req.params.roomId;
    const userId = req.user.ID;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    const { success, body } = await ChatService.getChatsByRoomId(targetRoomId, userId, limit, offset);
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
    const chatDTO = req.body.chat;
    const senderId = req.user.ID;
    const senderRole = req.user.role;
    const { success, body } = await ChatService.postChat(req, senderId, senderRole, targetRoomId, chatDTO);
    if (success) {
      return res.jsonResult(201, body);
    } else {
      return res.jsonResult(500, { message: 'User Service Error', body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};

export const postMedia = async (req, res) => {
  try {
    const targetRoomId = req.params.roomId;
    const chatMediaDTO = req.file;
    const senderId = req.user.id;
    const senderRole = req.user.role;
    const { success, body } = await ChatService.postMedia(req, senderId, senderRole, targetRoomId, chatMediaDTO);
    if (success) {
      return res.jsonResult(201, body);
    } else {
      return res.jsonResult(500, { message: 'User Service Error', body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};
