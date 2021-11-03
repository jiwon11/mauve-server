import express from 'express';
const router = express.Router();

// custom utils And middlewares
import jwtAuth from '../middlewares/authJWT';
import * as importController from '../controllers/import.controller';

router.post('/billings', jwtAuth, importController);
export default router;
