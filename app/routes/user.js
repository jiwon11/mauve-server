import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as userController from '../controllers/user.controller';
import jwtAuth from '../middlewares/authJWT';

router.post('/sign', upload.single('profile_img'), userController.signAccount);
router.get('/:id', jwtAuth, userController.getUserData);
router.post('/customer_uid', jwtAuth, userController.addCustomerUid);

export default router;
