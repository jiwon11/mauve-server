import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as roomController from '../controllers/room.controller';
import jwtAuth from '../middlewares/authJWT';

router.get('/:id', jwtAuth, roomController.getRoom);
router.post('/:id/charge', jwtAuth, roomController.charge);
router.post('/:id/chat', jwtAuth, upload.none(), roomController.chat);
router.post('/:id/chat/media', jwtAuth, upload.single('media_file'), roomController.media);
export default router;
