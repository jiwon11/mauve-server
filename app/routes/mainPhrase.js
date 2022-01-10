import express from 'express';
import { upload } from '../middlewares/multer';

const router = express.Router();

// custom utils And middlewares
import * as mainPhraseController from '../controllers/mainPhrase.controller';

router.put('/:phase', upload.single('image'), mainPhraseController.update);
router.get('/all', mainPhraseController.getAll);

export default router;
