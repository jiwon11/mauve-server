import NotificationService from '../services/notification.service';

const notificationsProcess = async job => {
  try {
    const data = job.data;
    console.log(data);
    const createNotificationResult = await NotificationService.createByChat(data.senderId, data.senderRole, data.chatRoomId, data.chatDTO);
    if (createNotificationResult.success) {
      console.log(createNotificationResult.body);
    } else {
      console.error(createNotificationResult.body);
    }
  } catch (err) {
    console.error(err);
  }
};

export default notificationsProcess;
