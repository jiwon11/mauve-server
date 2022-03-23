import WeightService from '../services/weight.service';
import RoomService from '../services/room.service';
import ChatService from '../services/chat.service';
import moment from 'moment-timezone';
import { createSlackMessage } from '../queue/slack-msg-queue';

export const create = async (req, res) => {
  try {
    const userId = req.user.ID;
    const userRole = req.user.role;
    const kilograms = req.body.kilograms;
    const time = req.body.time;
    const date = moment(moment.utc(req.body.date).toDate()).tz('Asia/Seoul').toDate();
    console.log(date);
    //const time = moment().tz('Asia/Seoul').hour() > 12 ? 'night' : 'morning';
    const weightDTO = { user: userId, time: time, kilograms: kilograms, date: date };
    const weightCreateResult = await WeightService.create(weightDTO);
    console.log(weightCreateResult.body);
    if (weightCreateResult.success) {
      const roomResult = await RoomService.getRoomIdByUserId(userId);
      let errorMsg;
      if (!roomResult.success) {
        errorMsg = { message: 'Room get By User ID Service Error', err: roomResult.body };
      }
      const targetRoomId = roomResult.body._id.toString();
      const io = await req.app.get('io');
      const sockets = await io.of('/chat').in(targetRoomId).fetchSockets();
      const connectedUser = Array.from(new Set(sockets.map(socket => socket.handshake.auth._id)));
      console.log('connectedUser', connectedUser);
      const postChatResult = await ChatService.postChat(io, connectedUser, userId, userRole, targetRoomId, weightCreateResult.body, 'weight');
      if (process.env.NODE_ENV === 'production') {
        await createSlackMessage(postChatResult.body);
      }
      if (!postChatResult.success) {
        errorMsg = { message: 'Chat post weight Service Error', err: postChatResult.body };
      }
      return res.jsonResult(201, { body: weightCreateResult.body, err_message: errorMsg });
    } else {
      return res.jsonResult(weightCreateResult.body.statusCode, { message: 'Weight Create Service Error', err: weightCreateResult.body.err });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Weight Controller Error', err: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const userId = req.user.ID;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const skip = req.query.offset ? parseInt(req.query.offset) : null;
    const weightGetAllResult = await WeightService.getAll(userId, limit, skip);
    if (weightGetAllResult.success) {
      return res.jsonResult(201, weightGetAllResult.body);
    } else {
      return res.jsonResult(500, { message: 'Weight Create Service Error', err: weightGetAllResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Weight Controller Error', err: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const userId = req.user.ID;
    const weightId = req.params.id;
    const userRole = req.user.role;
    const kilograms = req.body.kilograms;
    const time = req.body.time;
    const date = moment(moment.utc(req.body.date).toDate()).tz('Asia/Seoul').toDate();
    //const time = moment().tz('Asia/Seoul').hour() > 12 ? 'night' : 'morning';
    const weightDTO = { user: userId, time: time, kilograms: kilograms, date: date };
    const weightUpdateResult = await WeightService.update(weightId, userId, weightDTO);
    if (weightUpdateResult.success) {
      /*
      const roomResult = await RoomService.getRoomIdByUserId(userId);
      let errorMsg;
      if (!roomResult.success) {
        errorMsg = { message: 'Room get By User ID Service Error', err: roomResult.body };
      }
      const targetRoomId = roomResult.body._id.toString();
      const io = await req.app.get('io');
      const sockets = await io.of('/chat').in(targetRoomId).fetchSockets();
      const connectedUser = Array.from(new Set(sockets.map(socket => socket.handshake.auth._id)));
      console.log('connectedUser', connectedUser);
      const postChatResult = await ChatService.postChat(io, connectedUser, userId, userRole, targetRoomId, weightUpdateResult.body, 'weight');
      if (process.env.NODE_ENV === 'production') {
        await createSlackMessage(postChatResult.body);
      }
      if (!postChatResult.success) {
        errorMsg = { message: 'Chat post weight Service Error', err: postChatResult.body };
      }
      */
      return res.jsonResult(200, weightUpdateResult.body);
    } else {
      return res.jsonResult(500, { message: 'Weight Update Service Error', err: weightUpdateResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Weight Controller Error', err: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const userId = req.user.ID;
    const weightId = req.params.id;
    const weightRemoveResult = await WeightService.remove(userId, weightId);
    if (weightRemoveResult.success) {
      return res.jsonResult(204, weightRemoveResult.body);
    } else {
      return res.jsonResult(500, { message: 'Weight Remove Service Error', err: weightRemoveResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Weight Controller Error', err: err.message });
  }
};

export const updateField = async (req, res) => {
  try {
    const weightUpdateResult = await WeightService.updateField();
    if (weightUpdateResult.success) {
      return res.jsonResult(201, weightUpdateResult.body);
    } else {
      return res.jsonResult(500, { message: 'Weight Create Service Error', err: weightGetAllResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Weight Controller Error', err: err.message });
  }
};
