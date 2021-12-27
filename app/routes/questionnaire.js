import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as questionnaireController from '../controllers/questionnaire.controller';
import jwtAuth from '../middlewares/authJWT';

router.post('/', upload.none(), jwtAuth, questionnaireController.create);
router.get('/:userId', jwtAuth, questionnaireController.getByUserId);
router.put('/:id', upload.none(), jwtAuth, questionnaireController.update);

export default router;
