import NotificationService from '../services/notification.service';

export const getAll = async (req, res) => {
  try {
    const userId = req.user.ID;
    const userRole = req.user.role;
    const notificationGetAllResult = await NotificationService.getAllByUserId(userId, userRole);
    if (notificationGetAllResult.success) {
      return res.jsonResult(200, notificationGetAllResult.body);
    } else {
      return res.jsonResult(500, { message: 'Notification Service Error', err: notificationGetAllResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Notification Controller Error', err: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const userId = req.user.ID;
    const userRole = req.user.role;
    const notificationId = req.params.id;

    const notificationRemoveResult = await NotificationService.remove(userId, userRole, notificationId);
    if (notificationRemoveResult.success) {
      return res.jsonResult(204, notificationRemoveResult.body);
    } else {
      return res.jsonResult(500, { message: 'Notification Service Error', err: notificationRemoveResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Notification Controller Error', err: err.message });
  }
};
