import NotificationService from '../services/notification.service';
import RoomService from '../services/room.service';
import axios from 'axios';

const FLARELANE_PROJECT_ID = process.env.FLARELANE_PROJECT_ID;
const FLARELANE_TOKEN = process.env.FLARELANE_TOKEN;

export const notificationsProcess = async function (job, done) {
  console.log(`Job ${job.id} is ready!`);
  const data = job.data;
  console.log('notificationsProcess Data', data);
  const RoomRecordResult = await RoomService.simpleFindById(data.chatRoomId);
  if (RoomRecordResult.success) {
    const room = RoomRecordResult.body.room;
    if (data.connectedUser.includes(room.user)) {
      console.log('알람을 받을 사용자가 없습니다.');
      done();
    } else {
      NotificationService.createByChat(data.senderId, room, data.chatDTO).then(createNotificationResult => {
        if (createNotificationResult.success) {
          const result = createNotificationResult.body;
          console.log(result);
          const dataUrl = `roomId=${room._id.toString()}&chatId=${data.chatDTO._id.toString()}&created_at=${data.chatDTO.created_at}`;
          console.log(dataUrl);
          axios({
            url: `https://api.flarelane.com/v1/projects/${FLARELANE_PROJECT_ID}/notifications`,
            method: 'post',
            headers: { 'Content-type': 'application/json; charset=utf-8', Authorization: `Bearer ${FLARELANE_TOKEN}` },
            data: {
              targetType: 'device',
              targetIds: [/*result.notified_user.toString()*/ '3c7410b8-ed4e-4fe2-81fc-a5a21bf0f4e1'],
              title: `MAUVE`,
              body: `${result.title} : ${result.body}`,
              url: dataUrl
            }
          })
            .then(function (response) {
              let responseResult;
              if (response.status == 201) {
                responseResult = {
                  success: true,
                  body: {
                    message: '푸시 알림을 발신하였습니다.'
                  }
                };
              } else {
                responseResult = {
                  success: false,
                  body: response.data
                };
              }
              console.log(responseResult);
              done();
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
              done();
            });
        } else {
          console.log('success:false', createNotificationResult.body);
          done();
        }
      });
    }
  } else {
    console.log('success:false', RoomRecordResult.body);
    done();
  }
};
