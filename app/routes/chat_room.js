import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as roomController from '../controllers/room.controller';
import jwtAuth from '../middlewares/authJWT';

router.get('/:id', jwtAuth, roomController.getRoom);
router.post('/:id/charge', jwtAuth, roomController.charge);
export default router;
