import { verify } from '../libs/utils/jwt.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import socketIoRedisAdapter from 'socket.io-redis';
const { instrument } = require('@socket.io/admin-ui');
import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

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

  io.use((socket, next) => {
    const token = socket.handshake.headers.authorization.split('Bearer ')[1];
    const result = verify(token);
    if (result.ok) {
      // token이 검증되었으면 req에 값을 세팅하고, 다음 콜백함수로 갑니다.
      socket.user = { ID: result.id, role: result.role };
      next();
    } else {
      socket.on('disconnect', () => {
        console.log(result.message);
      });
    }
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

  roomNamespace.on('connection', socket => {
    console.log('connect room namespace');
    console.log('user', socket.user);
    socket.on('disconnect', () => {
      console.log('break connection room namespace');
    });
  });

  chatNamespace.on('connection', async socket => {
    try {
      console.log('connect chat namespace');
      //console.log('user', socket.user);
      console.log('socket id', socket.id);
      const roomId = socket.handshake.query.roomId;
      await socket.join(roomId);
      console.log(socket.rooms);

      socket.to(roomId).emit('join', {
        sender: 'system',
        chat: `${socket.id}님이 입장하셨습니다.`
      });
      socket.on('disconnect', async () => {
        const currentRoom = socket.adapter.rooms.get(roomId);
        const userCount = currentRoom ? currentRoom.size : 0;
        console.log(userCount);
        console.log('break connection chat namespace');
        await socket.leave(roomId);
        if (userCount === 0) {
          socket.to(roomId).emit('exit', {
            sender: 'system',
            chat: `${socket.id}님이 퇴장하셨습니다.`
          });
        } else {
          socket.to(roomId).emit('exit', {
            sender: 'system',
            chat: `${socket.id}님이 퇴장하셨습니다.`
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  });

  httpServer.listen(3030);
};
