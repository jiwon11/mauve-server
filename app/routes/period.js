import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as periodController from '../controllers/period.controller';
import jwtAuth from '../middlewares/authJWT';

router.post('/', upload.none(), jwtAuth, periodController.add);
router.put('/:id', upload.none(), jwtAuth, periodController.update);
router.get('/statistic', jwtAuth, periodController.statistic);
router.get('/phase/:step', jwtAuth, periodController.phase);
router.get('/:userId', jwtAuth, periodController.getAll);

export default router;
