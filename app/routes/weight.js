import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as weightController from '../controllers/weight.controller';
import jwtAuth from '../middlewares/authJWT';

router.post('/', upload.none(), jwtAuth, weightController.create);
router.get('/', jwtAuth, weightController.getAll);
router.put('/:id', jwtAuth, weightController.update);
router.delete('/:id', jwtAuth, weightController.remove);
router.put('/update/field', weightController.updateField);

export default router;
