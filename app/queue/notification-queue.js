import Queue from 'bull';
import notificationsProcess from './notifications-queue-consumer';

const notificationsQueue = new Queue('notifications', {
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, password: process.env.REDIS_PW }
});

notificationsQueue.process(notificationsProcess);

export const createNewNotification = async notification => {
  notificationsQueue.add(notification, {});
};
