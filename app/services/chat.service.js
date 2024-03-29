import ChatModel from '../models/chat';
import RoomModel from '../models/chat_room';
import mongoose from 'mongoose';
import moment from 'moment';
import 'moment-timezone';

const chatAggregatePipeline = (byRoom, matchId, userId, userRole, from, to) => {
  let match;
  const fromQuery = moment(moment.utc(from).toDate()).tz('Asia/Seoul').toDate(); // moment.utc(moment.tz('Asia/Seoul').subtract(1, 'days').format('YYYY-MM-DDTHH:mm:ss')).toDate();
  const toQuery = moment(moment.utc(to).toDate()).tz('Asia/Seoul').toDate(); //moment.utc(moment.tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ss')).toDate();
  if (byRoom === true) {
    match = {
      $match: {
        room: mongoose.Types.ObjectId(matchId),
        created_at: { $gte: fromQuery, $lte: toQuery }
      }
    };
  } else {
    if (Array.isArray(matchId)) {
      match = {
        $match: {
          _id: { $in: matchId }
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
  let projectPipeLine;
  if (userRole === 'admin') {
    projectPipeLine = {
      tag: 1,
      body: {
        text: 1,
        time: 1,
        kilograms: 1,
        location: 1,
        thumbnail: 1,
        contentType: 1,
        key: 1
      },
      sender: { $ifNull: ['$sender_user', '$sender_coach'] },
      created_at: 1,
      created_at_date: {
        $cond: [
          { $eq: ['$tag', 'weight'] },
          { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$body.date' } }, ' '] }, 0] },
          { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } }, ' '] }, 0] }
        ]
      },
      created_at_time: {
        $cond: [
          { $eq: ['$tag', 'weight'] },
          { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$body.date' } }, ' '] }, 1] },
          { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } }, ' '] }, 1] }
        ]
      }
    };
  } else {
    projectPipeLine = {
      /*
        chat: 1,
        media: { location: 1 },
        weight: { time: 1, kilograms: 1 },
        */
      tag: 1,
      body: {
        text: 1,
        time: 1,
        kilograms: 1,
        location: 1,
        thumbnail: 1,
        contentType: 1,
        key: 1
      },
      sender: { $ifNull: ['$sender_user', '$sender_coach'] },
      readers: 1,
      userInReaders: { $in: [mongoose.Types.ObjectId(userId), '$readers'] },
      nonReadersNum: { $subtract: [2, { $size: '$readers' }] },
      created_at: 1,
      //created_date_time: { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } },
      created_at_date: {
        $cond: [
          { $eq: ['$tag', 'weight'] },
          { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$body.date' } }, ' '] }, 0] },
          { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } }, ' '] }, 0] }
        ]
      },
      created_at_time: {
        $cond: [
          { $eq: ['$tag', 'weight'] },
          { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$body.date' } }, ' '] }, 1] },
          { $arrayElemAt: [{ $split: [{ $dateToString: { format: '%Y-%m-%d %H:%M', date: '$created_at' } }, ' '] }, 1] }
        ]
      }
    };
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
          {
            $project: {
              _id: 1,
              name: 1,
              profile_img: '$profile_img.location',
              thumbnail: '$profile_img.thumbnail',
              deleted: 1,
              self: { $eq: [mongoose.Types.ObjectId(userId), '$_id'] }
            }
          }
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
          {
            $project: {
              _id: 1,
              name: { $concat: ['$name', ' ', '코치'] },
              profile_img: '$profile_img.location',
              thumbnail: '$profile_img.thumbnail',
              deleted: 1,
              self: { $eq: [mongoose.Types.ObjectId(userId), '$_id'] }
            }
          }
        ],
        as: 'sender_coach'
      }
    },
    { $unwind: { path: '$sender_user', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$sender_coach', preserveNullAndEmptyArrays: true } },
    {
      $project: projectPipeLine
    },
    {
      $sort: {
        created_at: -1
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
  static async postChat(io, connectedUser, senderId, senderRole, targetRoomId, chatBody, tag = 'chat') {
    try {
      const chatDTO = { room: targetRoomId, tag: tag, readers: connectedUser };
      if (senderRole === 'user') {
        chatDTO.sender_user = senderId;
      } else if (senderRole === 'coach') {
        chatDTO.sender_coach = senderId;
      } else {
        return { success: false, body: '유효하지 않는 role입니다.' };
      }
      chatDTO.body = chatBody;
      /*
      if (tag === 'chat') {
        chatDTO.chat = chatBody;
      } else if (tag === 'weight') {
        chatDTO.weight = chatBody;
      } else {
        chatDTO.media = chatBody;
      }
      */
      const chat = await ChatModel.create(chatDTO);
      const chatRecord = await this.getById(chat._id, senderId, senderRole);
      io.of('/chat').to(targetRoomId).emit('chat', chatRecord);
      return { success: true, body: chatRecord };
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err: err.message } };
    }
  }

  static async getById(chatId, userId, userRole) {
    try {
      const aggregatePipeline = chatAggregatePipeline(false, chatId, userId, userRole);
      const chatRecords = await ChatModel.aggregate(aggregatePipeline);
      return chatRecords[0];
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async getChatsByRoomId(targetRoomId, userId, userRole, from, to) {
    try {
      const roomMatchPipeline = {};
      roomMatchPipeline._id = mongoose.Types.ObjectId(targetRoomId);
      if (userRole !== 'admin') {
        roomMatchPipeline[userRole] = mongoose.Types.ObjectId(userId);
      }
      const existRoom = await RoomModel.aggregate([
        {
          $match: roomMatchPipeline
        }
      ]);
      if (existRoom.length === 0) {
        return { success: false, body: '조회 가능한 채팅방이 없습니다!' };
      }
      console.time('Find Chat');
      const aggregatePipeline = chatAggregatePipeline(true, targetRoomId, userId, userRole, from, to);
      const chatRecords = await ChatModel.aggregate(aggregatePipeline);
      console.timeEnd('Find Chat');
      if (chatRecords.length === 0) {
        return { success: true, body: chatRecords };
      }
      if (userRole !== 'admin') {
        const nonReadChatIds = [];
        chatRecords
          .filter(chat => chat.userInReaders === false)
          .forEach(chat => {
            chat.readers.push(mongoose.Types.ObjectId(userId));
            chat.nonReadersNum -= 1;
            nonReadChatIds.push(chat._id);
          });
        console.log('nonReadChatIds : ', nonReadChatIds);
        if (nonReadChatIds.length > 0) {
          console.time('Update Chat Readers');
          await ChatModel.updateMany(
            { _id: { $in: nonReadChatIds }, readers: { $nin: [userId] } },
            {
              $push: {
                readers: { $each: [userId] }
              }
            }
          );
          console.timeEnd('Update Chat Readers');
        }
      }
      /*
      const groupByDateChatRecords = groupBy(returnChatRecords, 'created_at_date');
      const groupByChatRecords = Object.keys(groupByDateChatRecords).map(date => {
        const result = {};
        result[date] = groupBy(groupByDateChatRecords[date], 'created_at_time');
        return result;
      });
      */
      return { success: true, body: chatRecords };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
