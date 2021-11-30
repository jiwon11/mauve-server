import { Server } from 'socket.io';
import { createServer } from 'http';
import socketIoRedisAdapter from 'socket.io-redis';
const { instrument } = require('@socket.io/admin-ui');
import redis from 'redis';
import dotenv from 'dotenv';
import { verify } from '../libs/utils/jwt.js';
import UserService from '../services/user.service';
import CoachService from '../services/coach.service';

dotenv.config();

const verifyMiddleware = async (socket, next) => {
  let token;
  console.log(socket.handshake);
  if (socket.handshake.auth.authorization) {
    token = socket.handshake.auth.authorization.split('Bearer ')[1];
  } else {
    token = socket.handshake.headers.authorization.split('Bearer ')[1];
  }
  const result = verify(token);
  if (result.ok) {
    let success, clientRecord;
    console.log(result.role);
    if (result.role === 'user') {
      const findUserResult = await UserService.findById(result.id);
      success = findUserResult.success;
      clientRecord = findUserResult.body.userRecord;
    } else {
      const findCoachResult = await CoachService.findById(result.id);
      success = findCoachResult.success;
      clientRecord = findCoachResult.body.coachRecord;
    }
    if (success) {
      socket.handshake.auth = clientRecord;
      next();
    } else {
      socket.on('disconnect', () => {
        console.log(body);
      });
    }
  } else {
    socket.on('disconnect', () => {
      console.log(result.message);
    });
  }
};

export default (server, app) => {
  console.log('CONNECT SOCKET.IO');
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    path: '/socket.io',
    transports: ['websocket'],
    cors: {
      origin: ['https://admin.socket.io'],
      credentials: true
    }
  }); // socket.io 패키지와 express 서버 연결

  instrument(io, {
    auth: false,
    namespaceName: '/admin',
    readonly: true
  });

  const pubClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
    password: process.env.REDIS_PW
  });
  const subClient = pubClient.duplicate();
  const redisAdapter = socketIoRedisAdapter({
    pubClient,
    subClient,
    requestsTimeout: 3000,
    key: 'chat-socket'
  });
  io.adapter(redisAdapter);

  pubClient.on('connect', () => {
    console.log('Redis adapter pubClient connected');
  });
  subClient.on('connect', () => {
    console.log('Redis adapter subClient connected');
  });

  app.set('io', io); // 라우터에서 io 객체를 쓸 수 있게 저장. req.app.get('io')로 접근 가능

  const roomNamespace = io.of('/room'); // io.of : 네임스페이스를 만들어 접속
  const chatNamespace = io.of('/chat'); // 같은 네임스페이스끼리만 데이터 전달
  const adminNamespace = io.of('/admin');

  io.of('/room').use(verifyMiddleware);
  io.of('/chat').use(verifyMiddleware);

  roomNamespace.on('connection', socket => {
    console.log('connect room namespace');
    console.log('user name :', socket.handshake.auth.name);
    socket.on('disconnect', () => {
      console.log('break connection room namespace');
    });
  });

  chatNamespace.on('connection', async socket => {
    try {
      console.log('connect chat namespace');
      console.log('user name :', socket.handshake.auth.name);
      console.log('socket id', socket.id);
      const roomId = socket.handshake.query.roomId;
      // socket.join & socket.to(roomId).emit('join', {}) 이벤트를 connection외 다른 곳에서 on이 되도록
      await socket.join(roomId);

      socket.to(roomId).emit('join', {
        sender: 'system',
        connect: true,
        userId: socket.handshake.auth._id,
        name: socket.handshake.auth.name
      });
      socket.on('disconnect', async () => {
        console.log('break connection chat namespace');
        await socket.leave(roomId);
        socket.to(roomId).emit('exit', {
          sender: 'system',
          connect: false,
          userId: socket.handshake.auth._id
        });
      });
    } catch (err) {
      console.log(err);
    }
  });

  httpServer.listen(3030, '0.0.0.0', err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
};
