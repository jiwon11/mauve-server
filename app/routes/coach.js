import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as coachController from '../controllers/coach.controller';
import jwtAuth from '../middlewares/authJWT';

router.post('/sign', upload.single('profile_img'), coachController.signAccount);
router.post('/login', upload.none(), coachController.login);
router.put('/', jwtAuth, upload.single('profile_img'), coachController.update);
//router.get('/:id', jwtAuth, coachController.getUserData);
router.get('/users', coachController.getUserList);
router.get('/user/log/:userId', coachController.getUserLog);
router.get('/user/info/:userId', jwtAuth, coachController.getUserInfo);
router.get('/note/:userId', coachController.getUserNote);
router.put('/note/:userId', coachController.updateUserNote);
export default router;
