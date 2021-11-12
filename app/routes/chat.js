import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as chatController from '../controllers/chat.controller';
import jwtAuth from '../middlewares/authJWT';

router.get('/:roomId', jwtAuth, chatController.getChatsByRoomId);
router.post('/:roomId', jwtAuth, upload.none(), chatController.postChat);
router.post('/:roomId/media', jwtAuth, upload.single('media_file'), chatController.postMedia);

export default router;
