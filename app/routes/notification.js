import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as userController from '../controllers/user.controller';
import jwtAuth from '../middlewares/authJWT';

router.put('/config', jwtAuth, /*upload.none(),*/ userController.updateNotificationConfig);

export default router;
