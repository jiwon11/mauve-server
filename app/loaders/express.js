import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import compression from 'compression';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

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
  Sentry.init({
    dsn: 'https://f0bf76107d50428689919bb5db0b0a23@o1109647.ingest.sentry.io/6138175',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app })
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0
  });

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
  app.set('trust proxy', true);
  app.use(cors({ credentials: true, origin: true, exposedHeaders: ['cookie'] }));
  app.all('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });
  app.use(compression());
  app.use(logger.dev);

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
