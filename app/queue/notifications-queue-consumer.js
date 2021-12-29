import NotificationService from '../services/notification.service';
import request from 'request-promise-native';

const FLARELANE_PROJECT_ID = process.env.FLARELANE_PROJECT_ID;
const FLARELANE_TOKEN = process.env.FLARELANE_TOKEN;

const notificationsProcess = async job => {
  try {
    const data = job.data;
    console.log(data);
    const createNotificationResult = await NotificationService.createByChat(data.senderId, data.senderRole, data.chatRoomId, data.chatDTO);
    if (createNotificationResult.success) {
      console.log(createNotificationResult.body);
      const requestSMS = await request({
        method: method,
        json: true,
        uri: `https://api.flarelane.com/v1/projects/${FLARELANE_PROJECT_ID}/notifications`,
        headers: {
          'Content-type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${FLARELANE_TOKEN}`
        },
        body: {
          targetTypes: 'userId',
          targetIds: [createNotificationResult.body.notified_user],
          title: createNotificationResult.body.title,
          body: createNotificationResult.body.body
        }
      });
      console.log(requestSMS);
      if (requestSMS.statusCode === '200') {
        console.log({
          success: true,
          body: {
            message: '푸시 알림을 발신하였습니다.'
          }
        });
      } else {
        console.log({
          success: false,
          body: {
            message: requestSMS.messages
          }
        });
      }
    } else {
      console.error(createNotificationResult.body);
    }
  } catch (err) {
    console.error(err);
  }
};

export default notificationsProcess;
