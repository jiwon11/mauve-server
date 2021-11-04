import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as couchController from '../controllers/couch.controller';
import jwtAuth from '../middlewares/authJWT';

router.post('/sign', upload.single('profile_img'), couchController.signAccount);
router.get('/:id', jwtAuth, couchController.getUserData);

export default router;
