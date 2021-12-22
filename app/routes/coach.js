import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as coachController from '../controllers/coach.controller';
import jwtAuth from '../middlewares/authJWT';

router.post('/sign', upload.single('profile_img'), coachController.signAccount);
router.post('/login', upload.none(), coachController.login);
//router.get('/:id', jwtAuth, coachController.getUserData);
router.get('/user/log/:userId', coachController.getUserLog);
export default router;
