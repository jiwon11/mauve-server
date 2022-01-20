import { sendSMSByNCP, pushSMS, verifyToken } from '../libs/utils/verify';

export const pushTokenToUser = async (req, res) => {
  try {
    const phoneNumber = req.body.phone_NO;
    const pushTokenResult = await sendSMSByNCP(phoneNumber);
    let statusCode;
    if (pushTokenResult.success) {
      statusCode = 200;
    } else {
      statusCode = 500;
    }
    return res.jsonResult(statusCode, pushTokenResult.body);
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, err);
  }
};

export const verifyTokenByUser = async (req, res) => {
  try {
    const phoneNumber = req.body.phone_NO;
    const token = req.body.token;
    const verifyTokenResult = await verifyToken(phoneNumber, token);
    let statusCode;
    if (verifyTokenResult.success) {
      statusCode = 200;
    } else {
      statusCode = 500;
    }
    return res.jsonResult(statusCode, verifyTokenResult.body);
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, err.message);
  }
};
