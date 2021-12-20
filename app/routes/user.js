import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as userController from '../controllers/user.controller';
import jwtAuth from '../middlewares/authJWT';

router.post('/sign', upload.single('profile_img'), userController.signAccount);
router.post('/logout', userController.logout);
router.get('/profile/:id', jwtAuth, userController.getUserData);
router.post('/customer_uid', jwtAuth, userController.addCustomerUid);
router.get('/card', jwtAuth, userController.getAllCard);
router.post('/card', jwtAuth, userController.addCard);
router.delete('/card', jwtAuth, userController.deleteCard);

export default router;
