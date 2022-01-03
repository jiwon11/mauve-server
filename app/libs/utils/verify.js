import PhoneVerifyModel from '../../models/phone_verify';
import UserModel from '../../models/user';
import dotenv from 'dotenv';
import CryptoJS from 'crypto-js';
import request from 'request-promise-native';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SID;

const client = require('twilio')(accountSid, authToken);

export const sendSMSByNCP = async phoneNumber => {
  try {
    const token = Math.floor(100000 + Math.random() * 900000);
    const newPhoneVerify = new PhoneVerifyModel({
      token: token,
      phone_NO: phoneNumber
    });
    await newPhoneVerify.save();
    const date = Date.now().toString();
    const uri = 'ncp:sms:kr:277324711721:mauve_sms';
    const secretKey = process.env.NCP_SECRET_KEY;
    const accessKey = process.env.NCP_ACCESS_KEY;
    const method = 'POST';
    const space = ' ';
    const newLine = '\n';
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
    const url2 = `/sms/v2/services/${uri}/messages`;
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
    hmac.update(method);
    hmac.update(space);
    hmac.update(url2);
    hmac.update(newLine);
    hmac.update(date);
    hmac.update(newLine);
    hmac.update(accessKey);
    const hash = hmac.finalize();
    const signature = hash.toString(CryptoJS.enc.Base64);
    const requestSMS = await request({
      method: method,
      json: true,
      uri: url,
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': accessKey,
        'x-ncp-apigw-timestamp': date,
        'x-ncp-apigw-signature-v2': signature
      },
      body: {
        type: 'SMS',
        countryCode: '82',
        from: '0264097409',
        content: `[MAUVE]인증번호 [${token}]를 입력해주세요.`,
        messages: [
          {
            to: `${phoneNumber}`
          }
        ]
      }
    });
    console.log(requestSMS);
    if (requestSMS.statusCode === '202') {
      return {
        success: true,
        body: {
          message: '인증번호 문자를 발신하였습니다.'
        }
      };
    } else {
      return {
        success: false,
        body: {
          message: requestSMS.messages
        }
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      body: {
        message: 'server error',
        error
      }
    };
  }
};

export const pushSMS = async phoneNumber => {
  const token = Math.floor(Math.random() * 1000000);
  const newPhoneVerify = new PhoneVerifyModel({
    token: token,
    phone_NO: phoneNumber
  });
  await newPhoneVerify.save();
  try {
    const message = await client.messages.create({
      body: `[MAUVE]인증번호 [${token}]를 입력해주세요.`,
      messagingServiceSid: messagingServiceSid,
      to: `+82${phoneNumber}`
    });
    console.log(message);
    if (message.status === 'accepted') {
      return {
        success: true,
        body: {
          message: '인증번호 문자를 발신하였습니다.'
        }
      };
    } else {
      return {
        success: false,
        body: {
          message: message.sid
        }
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      body: {
        message: 'server error',
        error
      }
    };
  }
};

export const verifyToken = async (userPhoneNumber, token) => {
  const verifies = await PhoneVerifyModel.findOne({
    phone_NO: userPhoneNumber,
    token: token
  }).lean();
  if (verifies) {
    const existedUser = await UserModel.findOne({
      phone_NO: userPhoneNumber
    }).lean();
    await PhoneVerifyModel.deleteOne({ _id: verifies._id }).exec();
    return {
      success: true,
      body: {
        message: '인증되었습니다.',
        existedUser: existedUser ? true : false
      }
    };
  } else {
    return {
      success: false,
      body: {
        message: '인증번호가 틀립니다.'
      }
    };
  }
};
