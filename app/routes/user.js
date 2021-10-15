import express from 'express';
const router = express.Router();

// custom utils And middlewares
import * as userController from '../controllers/user.controller';

router.post('/sign', userController.signAccount);

export default router;
