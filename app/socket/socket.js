import { Server } from 'socket.io';
import { createServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
const { instrument } = require('@socket.io/admin-ui');
import dotenv from 'dotenv';
import { verify } from '../libs/utils/jwt.js';
import UserService from '../services/user.service';
import CoachService from '../services/coach.service';

dotenv.config();

const verifyMiddleware = async (socket, next) => {
  let token;
  if (socket.handshake.auth.authorization) {
    token = socket.handshake.auth.authorization.split('Bearer ')[1];
  } else {
    token = socket.handshake.headers.authorization.split('Bearer ')[1];
  }
  const result = verify(token);
  if (result.ok) {
    let success, clientRecord;
    if (result.role === 'user') {
      const findUserResult = await UserService.findById(result.id);
      success = findUserResult.success;
      clientRecord = findUserResult.body;
    } else {
      const findCoachResult = await CoachService.findById(result.id);
      success = findCoachResult.success;
      clientRecord = findCoachResult.body;
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

  const pubClient = createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
    password: process.env.REDIS_PW,
    requestsTimeout: 5000,
    options: {
      connect_timeout: 600
    }
  });
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

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
      // socket.join & socket.to(roomId).emit('join', {}) 이벤트를 connection외 다른 곳에서 on이 되도록
      // await socket.join(roomId);

      let roomId;
      socket.on('room-join', async msg => {
        roomId = msg.roomId;
        const userId = socket.handshake.auth._id;
        const sockets = await chatNamespace.in(roomId).fetchSockets();
        const connectedUser = Array.from(new Set(sockets.map(socket => socket.handshake.auth._id)));
        console.log('connectedUser :', connectedUser);
        if (!connectedUser.includes(userId)) {
          await socket.join(roomId);
          console.log('userId :', userId);
          console.log('join roomId :', roomId);
          chatNamespace.to(roomId).emit('join', {
            sender: 'system',
            connect: true,
            userId: socket.handshake.auth._id,
            name: socket.handshake.auth.name
          });
        } else {
          console.log('already join chat room');
        }
      });

      socket.on('room-leave', async msg => {
        roomId = msg.roomId;
        console.log('leave roomId: ', roomId);

        chatNamespace.to(roomId).emit('exit', {
          sender: 'system',
          connect: false,
          userId: socket.handshake.auth._id,
          name: socket.handshake.auth.name
        });

        await socket.leave(roomId);
      });

      socket.on('disconnect', async () => {
        console.log('disconnect roomId: ', roomId);
        console.log('break connection chat namespace');
        await socket.leave(roomId);
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
