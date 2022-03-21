import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import compression from 'compression';
import * as Sentry from '@sentry/node';
const SentryTracing = require('@sentry/tracing');

// custom utils And middlewares
import morgan from 'morgan';
import logger from '../libs/logger/winston';
import morganFormat from '../libs/logger/index';
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
import adminRouter from '../routes/admin';
import { pageNotFoundError, respondInternalError } from '../controllers/errorController';

export default async app => {
  Sentry.init({
    dsn: 'https://61a0a40ab4344cb99f697de1678f16be@o1173468.ingest.sentry.io/6268550',
    debug: true,
    environment: process.env.NODE_ENV,
    release: 'mauve@' + process.env.NODE_ENV,
    autoSessionTracking: false,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new SentryTracing.Integrations.Express({
        // to trace all requests to the default router
        app
        // alternatively, you can specify the routes you want to trace:
        // router: someRouter,
      }),
      new SentryTracing.Integrations.Mongo({
        useMongoose: true // Default: false
      })
    ],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  app.set('trust proxy', true);
  app.use(cors({ credentials: true, origin: true, exposedHeaders: ['cookie'] }));
  app.all('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });
  app.use(compression());
  app.use(morgan(morganFormat.dev, { stream: logger.stream }));
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
  app.use('/admin', adminRouter);
  // custom Error controllers
  app.use(pageNotFoundError);
  app.use(respondInternalError);
  app.use(Sentry.Handlers.errorHandler());
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
