import RoomService from '../services/room.service';
import UserService from '../services/user.service';
import ChatService from '../services/chat.service';

export const getRoom = async (req, res) => {
  try {
    const targetRoomId = req.params.id;
    const userId = req.user.ID;
    const { success, body } = await RoomService.findById(targetRoomId);
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
    const { success: getUserSuccess, body: manager } = await UserService.findById(managerId);
    const { success, body } = await RoomService.setCharge(req, targetRoomId, manager.userRecord);
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
