import socketIO from 'socket.io';
import { verify } from '../libs/utils/jwt.js';

export default (server, app) => {
  console.log('CONNECT SOCKET.IO');
  const io = socketIO(server, { path: '/socket.io' }); // socket.io 패키지와 express 서버 연결

  app.set('io', io); // 라우터에서 io 객체를 쓸 수 있게 저장. req.app.get('io')로 접근 가능
  const room = io.of('/room'); // io.of : 네임스페이스를 만들어 접속
  const chat = io.of('/chat'); // 같은 네임스페이스끼리만 데이터 전달
  io.use((socket, next) => {
    const token = socket.request.headers.authorization.split('Bearer ')[1];
    const result = verify(token);
    if (result.ok) {
      // token이 검증되었으면 req에 값을 세팅하고, 다음 콜백함수로 갑니다.
      socket.request.user = { ID: result.id, role: result.role };
      next();
    } else {
      socket.on('disconnect', () => {
        console.log(result.message);
      });
    }
  });
  room.on('connection', socket => {
    console.log('connect room namespace');
    console.log(socket.request.user);
    socket.on('disconnect', () => {
      console.log('break connection room namespace');
    });
  });
  chat.on('connection', async socket => {
    console.log('connect chat namespace');
    console.log(socket.request.user);
    const roomId = socket.handshake.query.roomId;
    console.log(roomId);
    socket.join(roomId);
    console.log('join room success');
    socket.to(roomId).emit('join', {
      sender: 'system',
      chat: `${socket.request.user.ID}님이 입장하셨습니다.`
    });
    socket.on('disconnect', async () => {
      const currentRoom = socket.adapter.rooms[roomId];
      const userCount = currentRoom ? currentRoom.length : 0;
      console.log(userCount);
      console.log('break connection chat namespace');
      socket.leave(roomId);
      if (userCount === 0) {
        socket.to(roomId).emit('exit', {
          sender: 'system',
          chat: `${socket.request.user.ID}님이 퇴장하셨습니다.`
        });
      } else {
        socket.to(roomId).emit('exit', {
          sender: 'system',
          chat: `${socket.request.user.ID}님이 퇴장하셨습니다.`
        });
      }
    });
  });
};
