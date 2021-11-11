import RoomService from '../services/room.service';
import UserService from '../services/user.service';
import CoachService from '../services/coach.service';
import ChatService from '../services/chat.service';

export const getAll = async (req, res) => {
  try {
    const userId = req.user.ID;
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
    const { success, body } = await RoomService.findAll(userId, limit, offset);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'Room Service Error', body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};

export const getRoom = async (req, res) => {
  try {
    const targetRoomId = req.params.id;
    const userId = req.user.ID;
    const { success, body } = await RoomService.findById(userId, targetRoomId);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'Room Service Error', body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};

export const charge = async (req, res) => {
  try {
    const targetRoomId = req.params.id;
    const managerId = req.user.ID;
    const getCoachResult = await CoachService.findById(managerId);
    if (getCoachResult.success) {
      const setChargeResult = await RoomService.setCharge(req, targetRoomId, getCoachResult.body.coachRecord);
      if (setChargeResult.success) {
        return res.jsonResult(201, setChargeResult.body);
      } else {
        return res.jsonResult(500, { message: 'Room Service Error', body: setChargeResult.body });
      }
    } else {
      return res.jsonResult(500, { message: 'Coach Service Error', body: getCoachResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Room Controller Error', err });
  }
};
