import WeightService from '../services/weight.service';
import RoomService from '../services/room.service';
import ChatService from '../services/chat.service';
import moment from 'moment-timezone';

export const create = async (req, res) => {
  try {
    const userId = req.user.ID;
    const userRole = req.user.role;
    const kilograms = req.body.kilograms;
    console.log(moment().tz('Asia/Seoul').hour());
    const time = moment().tz('Asia/Seoul').hour() > 12 ? 'night' : 'morning';
    const weightDTO = { user: userId, time: time, kilograms: kilograms };
    const weightCreateResult = await WeightService.create(weightDTO);
    if (weightCreateResult.success) {
      const roomResult = await RoomService.getRoomIdByUserId(userId);
      let errorMsg;
      if (!roomResult.success) {
        errorMsg = { message: 'Room get By User ID Service Error', err: roomResult.body };
      }
      const targetRoomId = roomResult.body._id.toString();
      const postChatResult = await ChatService.postChat(req, userId, userRole, targetRoomId, weightCreateResult.body, 'weight');
      if (!postChatResult.success) {
        errorMsg = { message: 'Chat post weight Service Error', err: postChatResult.body };
      }
      return res.jsonResult(201, { body: weightCreateResult.body, err_message: errorMsg });
    } else {
      return res.jsonResult(500, { message: 'Weight Create Service Error', err: weightCreateResult.body });
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
