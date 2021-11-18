import RoomModel from '../models/chat_room';
import mongoose from 'mongoose';
import moment from 'moment-timezone';
export default class roomService {
  static async create(req, roomDTO) {
    try {
      const room = new RoomModel(roomDTO);
      const newRoom = await room.save();
      const io = req.app.get('io');
      io.of('/room').emit('newRoom', newRoom);
      return { success: true, body: newRoom };
    } catch (err) {
      console.log(err);
      if (err.name === 'ValidationError') {
        let errors = {};

        Object.keys(err.errors).forEach(key => {
          errors[key] = err.errors[key].message;
        });

        return { success: false, body: { statusCode: 400, err: errors } };
      }
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async findAll(userId, limit = 20, offset = 0) {
    try {
      const roomRecords = await RoomModel.aggregate([
        {
          $lookup: {
            from: 'USER',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'COACH',
            localField: 'coach',
            foreignField: '_id',
            as: 'coach'
          }
        },
        {
          $lookup: {
            from: 'CHAT',
            let: { readers: '$readers' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $not: {
                      $in: [userId, '$readers']
                    }
                  }
                }
              }
            ],
            as: 'non_read_chats'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$coach',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            created_at: 1,
            'user.name': 1,
            'user._id': 1,
            'user.profile_img.location': 1,
            'coach.name': 1,
            'coach._id': 1,
            'coach.profile_img.location': 1,
            non_read_chats_num: { $size: '$non_read_chats' }
          }
        },
        { $limit: limit },
        { $skip: offset }
      ]);
      return { success: true, body: { room: roomRecords } };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async findById(userId, roomId) {
    try {
      const dayOfWeek = moment().tz('Asia/seoul').day() - 1;
      console.log(dayOfWeek);
      const roomRecord = await RoomModel.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(roomId) } },
        {
          $lookup: {
            from: 'USER',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'COACH',
            localField: 'coach',
            foreignField: '_id',
            as: 'coach'
          }
        },
        {
          $lookup: {
            from: 'CHAT',
            let: { readers: '$readers' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $not: {
                      $in: [userId, '$readers']
                    }
                  }
                }
              },
              { $project: { chat: 1, _id: 1 } },
              { $sort: { createdAt: -1 } },
              { $limit: 1 }
            ],
            as: 'recent_non_read_chats'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$coach',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            created_at: 1,
            'user.name': 1,
            'user._id': 1,
            'user.profile_img.location': 1,
            'coach.name': 1,
            'coach._id': 1,
            'coach.profile_img.location': 1,
            coach_chat_possible_time_start: {
              $arrayElemAt: [
                {
                  $arrayElemAt: ['$coach.possible_time', dayOfWeek]
                },
                0
              ]
            },
            coach_chat_possible_time_end: {
              $arrayElemAt: [
                {
                  $arrayElemAt: ['$coach.possible_time', dayOfWeek]
                },
                1
              ]
            },
            coach_chat_possible: {
              $cond: {
                if: {
                  $and: [
                    {
                      $ne: [moment().tz('Asia/seoul').day(), 0]
                    },
                    {
                      $ne: [moment().tz('Asia/seoul').day(), 6]
                    }
                  ]
                },
                then: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $lte: [
                            {
                              $arrayElemAt: [
                                {
                                  $arrayElemAt: ['$coach.possible_time', dayOfWeek]
                                },
                                0
                              ]
                            },
                            moment().tz('Asia/seoul').hour()
                          ]
                        },
                        {
                          $gte: [
                            {
                              $arrayElemAt: [
                                {
                                  $arrayElemAt: ['$coach.possible_time', dayOfWeek]
                                },
                                1
                              ]
                            },
                            moment().tz('Asia/seoul').hour()
                          ]
                        }
                      ]
                    },
                    then: true,
                    else: false
                  }
                },
                else: false
              }
            },
            recent_non_read_chats: '$recent_non_read_chats'
          }
        }
      ]);
      if (roomRecord) {
        return { success: true, body: { room: roomRecord[0] } };
      } else {
        return { success: false, body: { message: `Room not founded by ID : ${roomId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async setCharge(req, roomId, coach) {
    try {
      const roomRecord = await RoomModel.findOne({ _id: roomId });
      if (roomRecord) {
        if (roomRecord.coach) {
          return { success: false, body: { message: '해당 사용자는 이미 코치가 배정되어 있습니다.' } };
        } else {
          roomRecord.coach = coach._id;
          await roomRecord.save();
          req.app
            .get('io')
            .of('/chat')
            .to(roomId)
            .emit('join', {
              sender: 'system',
              chat: `${coach.name}님이 매니저로 입장하셨습니다.`
            });
          // const chatRecords = await ChatModel.find({ room: roomRecord._id }).sort('created_at');
          return { success: true, body: { room: roomRecord } };
        }
      } else {
        return { success: false, body: { message: `Room not founded by ID : ${roomId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
