import express from 'express';
const router = express.Router();

// custom utils And middlewares
import refresh from '../libs/utils/refresh';
import * as authController from '../controllers/auth.controller';

router.get('/refresh', refresh);
router.post('/pushToken', authController.pushTokenToUser);
router.post('/verifyToken', authController.verifyTokenByUser);

export default router;
