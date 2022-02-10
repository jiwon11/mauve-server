import express from 'express';

const router = express.Router();

// custom utils And middlewares
import * as adminController from '../controllers/admin.controller';
import * as coachController from '../controllers/coach.controller';
import * as roomController from '../controllers/room.controller';
import * as chatController from '../controllers/chat.controller';
import jwtAuth from '../middlewares/authJWT';

router.post('/sign', adminController.signAccount);
router.post('/login', adminController.login);
router.get('/rooms', jwtAuth, roomController.getAll);
router.get('/:roomId', jwtAuth, chatController.getChatsByRoomId);
router.get('/user/log/:userId', coachController.getUserLog);
router.get('/user/info/:userId', jwtAuth, coachController.getUserInfo);
router.get('/note/:userId', coachController.getUserNote);
export default router;
