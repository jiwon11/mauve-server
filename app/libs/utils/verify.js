import PhoneVerifyModel from '../../models/phone_verify';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SID;

const client = require('twilio')(accountSid, authToken);

export const pushToken = async phoneNumber => {
  const token = Math.floor(Math.random() * 1000000);
  await PhoneVerifyModel.create({
    token: token,
    phone_NO: phoneNumber
  });
  try {
    const message = await client.messages.create({
      body: `[WECAN]인증번호 [${token}]를 입력해주세요.`,
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
  }).exec();
  if (verifies) {
    await PhoneVerifyModel.deleteOne({ _id: verifies._id }).exec();
    return {
      success: true,
      body: {
        message: '인증되었습니다.'
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
