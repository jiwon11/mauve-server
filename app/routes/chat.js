import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as chatController from '../controllers/chat.controller';
import jwtAuth from '../middlewares/authJWT';
import { ChainableTemporaryCredentials } from 'aws-sdk';

router.get('/:roomId', jwtAuth, chatController.getChatsByRoomId);
router.post('/:roomId', jwtAuth, upload.none(), chatController.postChat);
router.post('/:roomId/media/:tag', jwtAuth, upload.single('media_file'), chatController.postMedia);

// router.post('/:roomId/breakfast', jwtAuth, upload.single(), chatController.postMedia);
// router.post('/:roomId/lunch', jwtAuth, upload.single(), chatController.postMedia);
// router.post('/:roomId/dinner', jwtAuth, upload.single(), chatController.postMedia);

export default router;
