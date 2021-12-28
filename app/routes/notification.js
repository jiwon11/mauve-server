import express from 'express';

const router = express.Router();

// custom utils And middlewares
import * as userController from '../controllers/user.controller';
import * as notificationController from '../controllers/notification.controller';
import jwtAuth from '../middlewares/authJWT';

router.put('/config', jwtAuth, userController.updateNotificationConfig);
router.get('/', jwtAuth, notificationController.getAll);
export default router;
