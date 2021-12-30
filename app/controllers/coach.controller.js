import coachService from '../services/coach.service';
import dotenv from 'dotenv';

dotenv.config();

export const signAccount = async (req, res) => {
  try {
    const coachDTO = req.body;
    const profileImgDTO = req.file;
    if (profileImgDTO) {
      ['encoding', 'acl', 'contentDisposition', 'storageClass', 'serverSideEncryption', 'metadata', 'etag', 'versionId'].forEach(key => delete profileImgDTO[key]);
      profileImgDTO.thumbnail = `${process.env.CLOUD_FRONT_URL}/${profileImgDTO.key}?w=150&h=150&f=png&q=100`;
    }
    coachDTO.pass_code = Math.random().toString(20).substr(2, 11);
    coachDTO.possible_time = JSON.parse(coachDTO.possible_time);
    console.log('coachData', coachDTO);
    console.log('userProfileImgData', profileImgDTO);
    const { success, body } = await coachService.sign(coachDTO, profileImgDTO);
    if (success) {
      return res.jsonResult(201, body);
    } else {
      return res.jsonResult(body.statusCode, body.err);
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Coach Controller Error', err });
  }
};

export const login = async (req, res) => {
  try {
    const pass_code = req.body.pass_code;
    const { success, body } = await coachService.loginByPassCode(pass_code);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(body.statusCode, body.err);
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Coach Controller Error', err });
  }
};

export const getUserLog = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const { success, body } = await coachService.getUserLog(targetUserId);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'Coach Service Error', err: body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Coach Controller Error', err });
  }
};

export const getUserList = async (req, res) => {
  try {
    const { success, body } = await coachService.getUserList();
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'Coach Service Error', err: body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Coach Controller Error', err });
  }
};

export const updateUserNote = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const noteDTO = req.body.note;
    const { success, body } = await coachService.updateUserNote(targetUserId, noteDTO);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'Coach Service Error', err: body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Coach Controller Error', err });
  }
};

export const getUserNote = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const { success, body } = await coachService.getUserNote(targetUserId);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'Coach Service Error', err: body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Coach Controller Error', err });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const { success, body } = await coachService.getUserInfo(targetUserId);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(500, { message: 'Coach Service Error', err: body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Coach Controller Error', err });
  }
};
