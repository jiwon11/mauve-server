import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import compression from 'compression';
import AWSXRay from 'aws-xray-sdk';
// custom utils And middlewares
import logger from '../libs/logger/index';
import jsonResult from '../middlewares/jsonResult';

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
  AWSXRay.config([AWSXRay.plugins.EC2Plugin, AWSXRay.plugins.ElasticBeanstalkPlugin]);
  app.set('trust proxy', true);
  app.use(cors({ credentials: true, origin: true, exposedHeaders: ['cookie'] }));
  app.use(AWSXRay.express.openSegment(`mauve-${process.env.NODE_ENV}`));
  app.all('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });
  app.use(compression());
  app.use(logger.dev);
  AWSXRay.setLogger(logger.dev);
  AWSXRay.config([AWSXRay.plugins.EC2Plugin]);
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
  app.use(AWSXRay.express.closeSegment());

  app.use(
    Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Capture all 404 and 500 errors
        if (error.status === 404 || error.status === 500) {
          return true;
        }
        return false;
      }
    })
  );

  return app;
};
