import NotificationService from '../services/notification.service';
import axios from 'axios';

const FLARELANE_PROJECT_ID = process.env.FLARELANE_PROJECT_ID;
const FLARELANE_TOKEN = process.env.FLARELANE_TOKEN;

export const notificationsProcess = async function (job, done) {
  console.log(`Job ${job.id} is ready!`);
  const data = job.data;
  console.log('notificationsProcess Data', data);
  NotificationService.createByChat(data.senderId, data.senderRole, data.chatRoomId, data.chatDTO).then(createNotificationResult => {
    if (createNotificationResult.success) {
      const result = createNotificationResult.body;
      axios({
        url: `https://api.flarelane.com/v1/projects/${FLARELANE_PROJECT_ID}/notifications`,
        method: 'post',
        headers: { 'Content-type': 'application/json; charset=utf-8', Authorization: `Bearer ${FLARELANE_TOKEN}` },
        data: {
          targetTypes: 'userId',
          targetIds: [result.body.notified_user],
          title: result.body.title,
          body: result.body.body
        }
      })
        .then(function (response) {
          console.log(response);
          let responseResult;
          if (response.statusCode == 200) {
            responseResult = {
              success: true,
              body: {
                message: '푸시 알림을 발신하였습니다.'
              }
            };
          } else {
            responseResult = {
              success: false,
              body: body
            };
          }
          console.log(responseResult);
          done(null);
        })
        .catch(function (error) {
          if (error.response) {
            console.log({
              success: false,
              body: error.response.data
            });
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
          done(null);
        });
    } else {
      console.log('success:false', createNotificationResult.body);
      done(null);
    }
  });
};
