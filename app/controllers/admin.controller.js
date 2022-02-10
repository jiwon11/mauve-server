import adminService from '../services/admin.service';
import dotenv from 'dotenv';

dotenv.config();

export const signAccount = async (req, res) => {
  try {
    const adminDTO = req.body;
    adminDTO.pass_code = Math.random().toString(20).substr(2, 11);
    console.log('adminData', adminDTO);
    const { success, body } = await adminService.sign(adminDTO);
    if (success) {
      return res.jsonResult(201, body);
    } else {
      return res.jsonResult(body.statusCode, body.err);
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Admin Controller Error', err });
  }
};

export const login = async (req, res) => {
  try {
    const pass_code = req.body.pass_code;
    const { success, body } = await adminService.loginByPassCode(pass_code);
    if (success) {
      return res.jsonResult(200, body);
    } else {
      return res.jsonResult(body.statusCode, body.err);
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Admin Controller Error', err });
  }
};
