import { Server } from 'socket.io';
import { createServer } from 'http';
import socketIoRedisAdapter from 'socket.io-redis';
const { instrument } = require('@socket.io/admin-ui');
import redis from 'redis';
import dotenv from 'dotenv';
import { verify } from '../libs/utils/jwt.js';
import UserService from '../services/user.service.js';

dotenv.config();

const verifyMiddleware = async (socket, next) => {
  const token = socket.handshake.headers.authorization.split('Bearer ')[1];
  const result = verify(token);
  if (result.ok) {
    const {
      success,
      body: { userRecord }
    } = await UserService.findById(result.id);
    if (success) {
      socket.handshake.auth = userRecord;
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
    namespaceName: '/chat',
    readonly: true
  });

  const pubClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
    password: process.env.REDIS_PW
  });
  const subClient = pubClient.duplicate();
  const redisAdapter = socketIoRedisAdapter({ pubClient, subClient });
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

  io.of('/room').use(verifyMiddleware);
  io.of('/chat').use(verifyMiddleware);

  roomNamespace.on('connection', socket => {
    console.log('connect room namespace');
    console.log('user nickname :', socket.handshake.auth.nickname);
    socket.on('disconnect', () => {
      console.log('break connection room namespace');
    });
  });

  chatNamespace.on('connection', async socket => {
    try {
      console.log('connect chat namespace');
      console.log('user nickname :', socket.handshake.auth.nickname);
      console.log('socket id', socket.id);
      const roomId = socket.handshake.query.roomId;
      await socket.join(roomId);

      socket.to(roomId).emit('join', {
        sender: 'system',
        connect: true,
        userId: socket.handshake.auth._id
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

  httpServer.listen(3030);
};
