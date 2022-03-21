import mongoose from 'mongoose';
import chatService from '../../services/chat.service';
import { createNewNotification } from '../../queue/notification-queue';

export const createGreetingMessage = async (req, roomRecord) => {
  const userName = roomRecord.user.name;
  const coachName = roomRecord.coach.name;
  const message = `안녕하세요, ${userName}님! 모브 ${coachName}입니다.

모브 1일차에는 응답해주신 문진표를 기반으로 ${userName} 님께 맞는 ‘1주일 추천 식단'과 맞춤 플랜 방향을 미리 안내해드리겠습니다. 자동화된 식단이 아닌 개개인별 상황에 맞게 맞춤형 식단으로 제공이 되기 때문에 시간이 다소 소요될 수 있으며, 당일 내로 식단표를 제공해드리겠습니다. (실제 식단관리 및 피드백은 내일부터 진행이 됩니다.)

문진표에 작성해 주신 전반적인 건강 상태를 바탕으로 ${userName}님의 식습관과 생활습관, 그리고 월경주기를 분석한 건강한 다이어트 솔루션 제공을 위해 매일 체중과 식단 기록을 부탁드립니다. 

또한, 모브 앱 사용 방법과 관리 방향에 대해서는 관리 시작 전 전화 서비스를 통해 알려드릴 예정입니다. 통화가 가능하신 시간대를 간단하게 알려주세요! 전화가 아닌 보이스톡으로 순차적으로 연락드릴 예정입니다. 통화 시간은 매주 1회 회원님과 정해진 시간에 대략 10~15분 정도 진행될 예정이니 꼭 참고해주세요.`;

  const io = req.app.get('io');
  const sockets = await io.of('/chat').in(roomRecord._id.toString()).fetchSockets();
  const connectedUser = sockets.map(socket => socket.handshake.auth._id);
  connectedUser.push(mongoose.Types.ObjectId(roomRecord.coach._id));
  const chatResult = await chatService.postChat(io, connectedUser, roomRecord.coach._id, 'coach', roomRecord._id.toString(), { text: message });
  await createNewNotification({ senderId: roomRecord.coach._id, senderRole: 'coach', chatRoomId: roomRecord._id.toString(), connectedUser, chatDTO: chatResult.body });
};
