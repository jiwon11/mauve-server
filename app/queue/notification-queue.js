import Queue from 'bull';
import notificationsProcess from './notifications-queue-consumer';

const notificationsQueue = new Queue('notifications', {
  redis: { host: process.env.REDIS_PROD_HOST, port: process.env.REDIS_PROD_PORT, password: process.env.REDIS_PROD_PW, db: process.env.REDIS_PROD_DB }
});

notificationsQueue.process(notificationsProcess);

export const createNewNotification = async notification => {
  notificationsQueue.add(notification, {});
};
