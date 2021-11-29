import express from 'express';
const router = express.Router();

// custom utils And middlewares
import jwtAuth from '../middlewares/authJWT';
import * as paymentController from '../controllers/payment.controller';

router.post('/billings', jwtAuth, paymentController.billing);
router.post('/callback/schedule', paymentController.callbackSchedule);
router.post('/unschedule', jwtAuth, paymentController.unschedule);
export default router;
