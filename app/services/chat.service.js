import ChatModel from '../models/chat';
import mongoose from 'mongoose';

const chatAggregatePipeline = (matchId, limit, offset) => {
  let match;
  if (Array.isArray(matchId)) {
    match = {
      $match: {
        _id: { $in: matchId }
      }
    };
  } else {
    if (limit !== 1) {
      match = {
        $match: {
          room: mongoose.Types.ObjectId(matchId)
        }
      };
    } else {
      match = {
        $match: {
          _id: mongoose.Types.ObjectId(matchId)
        }
      };
    }
  }
  return [
    match,
    {
      $lookup: {
        from: 'USER',
        //localField: 'sender_user',
        //foreignField: '_id',
        let: { user: '$sender_user' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$user'] }
            }
          },
          { $project: { _id: 1, name: 1, profile_img: { location: 1 } } }
        ],
        as: 'sender_user'
      }
    },
    {
      $lookup: {
        from: 'COACH',
        //localField: 'sender_coach',
        //foreignField: '_id',
        let: { coach: '$sender_coach' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$coach'] }
            }
          },
          { $project: { _id: 1, name: 1, profile_img: { location: 1 } } }
        ],
        as: 'sender_coach'
      }
    },
    { $unwind: { path: '$sender_user', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$sender_coach', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        tag: 1,
        chat: 1,
        media: { location: 1 },
        weight: 1,
        sender: { $ifNull: ['$sender_user', '$sender_coach'] },
        readers: 1,
        nonReadersNum: { $subtract: [2, { $size: '$readers' }] },
        //created_date_time: { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } },
        created_at_date: { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } }, ' '] }, 0] },
        created_at_time: { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } }, ' '] }, 1] }
      }
    },
    { $limit: limit },
    { $skip: offset },
    {
      $sort: {
        created_date_time: -1
      }
    }
  ];
};

function groupBy(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
    var key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

export default class chatService {
  static async postChat(req, senderId, senderRole, targetRoomId, chatBody, tag = 'chat') {
    try {
      const io = await req.app.get('io');
      const sockets = await io.of('/chat').in(targetRoomId).fetchSockets();
      const connectedUser = sockets.map(socket => socket.handshake.auth._id);
      console.log('connectedUser', connectedUser);
      const chatDTO = { room: targetRoomId, tag: tag, readers: connectedUser };
      if (senderRole === 'user') {
        chatDTO.sender_user = senderId;
      } else if (senderRole === 'coach') {
        chatDTO.sender_coach = senderId;
      } else {
        return { success: false, body: '유효하지 않는 role입니다.' };
      }
      if (tag === 'chat') {
        chatDTO.chat = chatBody;
      } else if (tag === 'weight') {
        chatDTO.weight = chatBody;
      } else {
        chatDTO.media = chatBody;
      }
      const chat = await ChatModel.create(chatDTO);
      const chatRecord = await this.getById(chat._id);
      req.app.get('io').of('/chat').to(targetRoomId).emit('chat', chatRecord);
      return { success: true, body: chatRecord };
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async getById(chatId) {
    try {
      const aggregatePipeline = chatAggregatePipeline(chatId, 1, 0);
      const chatRecords = await ChatModel.aggregate(aggregatePipeline);
      return chatRecords[0];
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async getChatsByRoomId(targetRoomId, userId, limit = 20, offset = 0) {
    try {
      console.time('Find Chat');
      const aggregatePipeline = chatAggregatePipeline(targetRoomId, limit, offset);
      const chatRecords = await ChatModel.aggregate(aggregatePipeline);
      console.timeEnd('Find Chat');
      const recentRead = chatRecords[0].readers.findIndex(chat => chat._id.toString() === userId);
      let updatedChatRecords;
      if (recentRead === -1) {
        console.time('Update Chat Readers');
        const chatRecordIds = chatRecords.map(chat => chat._id);
        await ChatModel.updateMany(
          { _id: { $in: chatRecordIds }, readers: { $nin: [userId] } },
          {
            $push: {
              readers: { $each: [userId] }
            }
          }
        );
        console.timeEnd('Update Chat Readers');
        const aggregatePipeline = chatAggregatePipeline(chatRecordIds, chatRecordIds.length, 0);
        updatedChatRecords = await ChatModel.aggregate(aggregatePipeline);
      }
      let returnChatRecords = updatedChatRecords ? updatedChatRecords : chatRecords;
      const groupByDateChatRecords = groupBy(returnChatRecords, 'created_at_date');
      /*
      const groupByChatRecords = Object.keys(groupByDateChatRecords).map(date => {
        const result = {};
        result[date] = groupBy(groupByDateChatRecords[date], 'created_at_time');
        return result;
      });
      */
      return { success: true, body: { chats: groupByDateChatRecords } };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
