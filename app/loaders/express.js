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
import importRouter from '../routes/import';
import periodRouter from '../routes/period';
import { pageNotFoundError, respondInternalError } from '../controllers/errorController';

AWSXRay.captureHTTPsGlobal(require('https'));

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

  AWSXRay.config([AWSXRay.plugins.EC2Plugin, AWSXRay.plugins.ECSPlugin]);
  var rules = {
    rules: [{ description: 'Player moves.', service_name: '*', http_method: '*', url_path: '/*', fixed_target: 0, rate: 0.05 }],
    default: { fixed_target: 1, rate: 0.1 },
    version: 1
  };

  AWSXRay.middleware.setSamplingRules(rules);
  app.use(AWSXRay.express.openSegment('tuningApp'));
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
  app.use('/import', importRouter);
  app.use('/period', periodRouter);
  // custom Error controllers
  app.use(pageNotFoundError);
  app.use(respondInternalError);
  app.use(AWSXRay.express.closeSegment());

  return app;
};
