import express from 'express';
const router = express.Router();

// custom utils And middlewares
import * as userController from '../controllers/user.controller';
import jwtAuth from '../middlewares/authJWT';

router.post('/sign', userController.signAccount);
router.get('/user', jwtAuth, userController.getUserData);

export default router;
