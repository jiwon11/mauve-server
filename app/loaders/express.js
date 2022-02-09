import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import compression from 'compression';
// custom utils And middlewares
import logger from '../libs/logger/index';
import jsonResult from '../middlewares/jsonResult';
import Rollbar from 'rollbar';

const rollbar = new Rollbar({
  accessToken: '39da91c82c7c45c29b3dc3d612969af1',
  captureUncaught: true,
  captureUnhandledRejections: true
});
// application Controllers for Routes
import authRouter from '../routes/auth';
import userRouter from '../routes/user';
import coachRouter from '../routes/coach';
import chatRoomRouter from '../routes/chat_room';
import chatRouter from '../routes/chat';
import paymentRouter from '../routes/payment';
import periodRouter from '../routes/period';
import weightRouter from '../routes/weight';
import mainPhraseRouter from '../routes/mainPhrase';
import notificationRouter from '../routes/notification';
import questionnaireRouter from '../routes/questionnaire';
import { pageNotFoundError, respondInternalError } from '../controllers/errorController';

export default async app => {
  app.set('trust proxy', true);
  app.use(cors({ credentials: true, origin: true, exposedHeaders: ['cookie'] }));
  app.all('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });
  app.use(compression());
  app.use(logger.dev);
  rollbar.log(logger.dev);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(path.resolve(), 'public')));
  // custom middlewares
  app.use(jsonResult);
  // application routes
  app.use('/auth', authRouter);
  app.use('/user', userRouter);
  app.use('/coach', coachRouter);
  app.use('/room', chatRoomRouter);
  app.use('/chat', chatRouter);
  app.use('/payment', paymentRouter);
  app.use('/period', periodRouter);
  app.use('/weight', weightRouter);
  app.use('/mainPhrase', mainPhraseRouter);
  app.use('/notification', notificationRouter);
  app.use('/questionnaire', questionnaireRouter);
  // custom Error controllers
  app.use(pageNotFoundError);
  app.use(respondInternalError);
  app.use(rollbar.errorHandler());

  return app;
};
