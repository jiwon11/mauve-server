import RoomService from '../services/room.service';
import UserService from '../services/user.service';

export const getRoom = async (req, res) => {
  try {
    const targetRoomId = req.params.id;
    const { success, body } = await RoomService.findById(req, targetRoomId);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'User Service Error', body });
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

export const chat = async (req, res) => {
  try {
    console.log(req.body);
    const targetRoomId = req.params.id;
    const chatDTO = req.body.chat;
    const senderId = req.user.ID;
    const { success, body } = await RoomService.chat(req, senderId, targetRoomId, chatDTO);
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

export const media = async (req, res) => {
  try {
    const targetRoomId = req.params.id;
    const chatMediaDTO = req.file;
    const senderId = req.user.id;
    const { success, body } = await RoomService.media(req, senderId, targetRoomId, chatMediaDTO);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'User Service Error', body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};
