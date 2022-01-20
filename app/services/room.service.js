import RoomModel from '../models/chat_room';
import chatService from './chat.service';
import mongoose from 'mongoose';
import moment from 'moment-timezone';
export default class roomService {
  static async create(req, roomDTO) {
    try {
      const room = new RoomModel(roomDTO);
      const newRoom = await room.save();
      const findRoom = await this.findById(roomDTO.user, 'user', newRoom._id.toString());
      const roomRecord = findRoom.body.room;
      const io = req.app.get('io');
      const sockets = await io.of('/chat').in(newRoom._id.toString()).fetchSockets();
      const connectedUser = sockets.map(socket => socket.handshake.auth._id);
      await chatService.postChat(io, connectedUser, roomDTO.coach, 'coach', newRoom._id.toString(), { text: `${roomRecord.user.name}님 안녕하세요! 모브 ${roomRecord.coach.name} 입니다!` });
      return { success: true, body: roomRecord };
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

  static async findAll(userId, userRole, limit = 20, offset = 0) {
    try {
      const matchPipeline = {};
      matchPipeline[userRole] = mongoose.Types.ObjectId(userId);
      const roomRecords = await RoomModel.aggregate([
        {
          $match: matchPipeline
        },
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
            let: { roomId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $not: {
                          $in: [mongoose.Types.ObjectId(userId), '$readers']
                        }
                      },
                      { $eq: ['$room', '$$roomId'] }
                    ]
                  }
                }
              },
              {
                $project: {
                  body: { text: 1, time: 1, kilograms: 1, location: 1, thumbnail: 1, contentType: 1, key: 1 },
                  _id: 0,
                  tag: 1,
                  created_at: { $dateToString: { format: '%Y-%m-%d %H:%M:%S', date: '$created_at' } }
                }
              },
              {
                $sort: {
                  created_at: -1
                }
              }
            ],
            as: 'non_read_chats'
          }
        },
        {
          $lookup: {
            from: 'CHAT',
            let: { roomId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$room', '$$roomId'] }, { $gt: ['$sender_user', null] }]
                  }
                }
              },
              {
                $project: {
                  body: { text: 1, time: 1, kilograms: 1, location: 1, thumbnail: 1, contentType: 1, key: 1 },
                  _id: 0,
                  tag: 1,
                  created_at: { $dateToString: { format: '%Y-%m-%d %H:%M:%S', date: '$created_at' } }
                }
              },
              {
                $sort: {
                  created_at: -1
                }
              },
              {
                $limit: 1
              }
            ],
            as: 'recent_user_chat'
          }
        },
        {
          $lookup: {
            from: 'CHAT',
            let: { roomId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$room', '$$roomId']
                  }
                }
              },
              {
                $project: {
                  body: { text: 1, time: 1, kilograms: 1, location: 1, thumbnail: 1, contentType: 1, key: 1 },
                  _id: 0,
                  tag: 1,
                  created_at: { $dateToString: { format: '%Y-%m-%d %H:%M:%S', date: '$created_at' } },
                  sender_role: { $cond: { if: { $gt: ['$sender_user', null] }, then: 'user', else: 'coach' } }
                }
              },
              {
                $sort: {
                  created_at: -1
                }
              },
              {
                $limit: 1
              }
            ],
            as: 'recent_chat'
          }
        },
        {
          $lookup: {
            from: 'CHAT',
            let: { created_at: '$created_at', roomId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$room', '$$roomId'] },
                      {
                        $gte: [
                          '$created_at',
                          {
                            $dateFromString: {
                              dateString: moment().tz('Asia/Seoul').format('YYYY-MM-DD'),
                              format: '%Y-%m-%d'
                            }
                          }
                        ]
                      }
                    ]
                  }
                }
              },
              {
                $project: {
                  body: { text: 1, time: 1, kilograms: 1, location: 1, thumbnail: 1, contentType: 1, key: 1 },
                  _id: 0,
                  tag: 1,
                  created_at: { $dateToString: { format: '%Y-%m-%d %H:%M:%S', date: '$created_at' } }
                }
              },
              {
                $sort: {
                  created_at: -1
                }
              }
            ],
            as: 'today_chats'
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
          $unwind: {
            path: '$recent_user_chat',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            //created_at: 1,
            'user.name': 1,
            'user._id': 1,
            'user.profile_img.location': 1,
            'user.profile_img.thumbnail': 1,
            'user.deleted': 1,
            'coach.name': 1,
            'coach._id': 1,
            'coach.profile_img.location': 1,
            'coach.profile_img.thumbnail': 1,
            'coach.deleted': 1,
            //today_chats: 1,
            input_breakfast: {
              $cond: [
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$today_chats',
                          as: 'today_chat',
                          cond: { $eq: ['$$today_chat.tag', 'breakfast'] }
                        }
                      }
                    },
                    0
                  ]
                },
                true,
                false
              ]
            },
            input_lunch: {
              $cond: [
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$today_chats',
                          as: 'today_chat',
                          cond: { $eq: ['$$today_chat.tag', 'lunch'] }
                        }
                      }
                    },
                    0
                  ]
                },
                true,
                false
              ]
            },
            input_dinner: {
              $cond: [
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$today_chats',
                          as: 'today_chat',
                          cond: { $eq: ['$$today_chat.tag', 'dinner'] }
                        }
                      }
                    },
                    0
                  ]
                },
                true,
                false
              ]
            },
            input_morning_weight: {
              $cond: [
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$today_chats',
                          as: 'today_chat',
                          cond: { $and: [{ $eq: ['$$today_chat.tag', 'weight'] }, { $eq: ['$$today_chat.body.time', 'morning'] }] }
                        }
                      }
                    },
                    0
                  ]
                },
                true,
                false
              ]
            },
            input_night_weight: {
              $cond: [
                {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$today_chats',
                          as: 'today_chat',
                          cond: { $and: [{ $eq: ['$$today_chat.tag', 'weight'] }, { $eq: ['$$today_chat.body.time', 'night'] }] }
                        }
                      }
                    },
                    0
                  ]
                },
                true,
                false
              ]
            },
            recent_chat: { $first: '$recent_chat' },
            //{ $cond: { if: { $eq: [{ $size: '$non_read_chats' }, 0] }, then: { $first: '$recent_chat' }, else: '$i' } },
            recent_time_user_send_chat: '$recent_user_chat.created_at',
            //recent_non_read_chats: { $first: '$non_read_chats' },
            /*{ $cond: { if: { $eq: [{ $first: '$non_read_chats' }, null] }, then: { $first: '$non_read_chats' }, else: { $first: '$recent_chat' } } }*/
            non_read_chats_num: {
              $size: '$non_read_chats'
            }
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

  static async getRoomIdByUserId(userId) {
    try {
      const roomRecord = await RoomModel.findOne({
        user: userId
      });
      console.log(roomRecord);
      if (roomRecord) {
        return { success: true, body: roomRecord };
      } else {
        return { success: false, body: { message: `Room not founded by User ID : ${userId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async simpleFindById(roomId) {
    try {
      const roomRecord = await RoomModel.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(roomId) } },
        {
          $lookup: {
            from: 'USER',
            localField: 'user',
            foreignField: '_id',
            as: 'notified_user'
          }
        },
        {
          $unwind: {
            path: '$notified_user',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            notified_user: {
              _id: 1,
              notification_config: 1
            }
          }
        }
      ]);
      if (roomRecord.length > 0) {
        return { success: true, body: { room: roomRecord[0] } };
      } else {
        return { success: false, body: { message: `Room not founded by ID : ${roomId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async findById(userId, userRole, roomId) {
    try {
      const dayOfWeek = moment().tz('Asia/seoul').day() - 1; // 0:일 ~ 6:토요일 --> 코치의 상담시간 array : 0:월요일 ~ 4:금요일
      const nonReadChatRole =
        userRole === 'user'
          ? [
              {
                $in: [userId, '$readers']
              },
              {
                $ne: ['$type', 'weight']
              }
            ]
          : [
              {
                $in: [userId, '$readers']
              }
            ];
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
                    $and: nonReadChatRole
                  }
                }
              },
              { $project: { chat: 1, _id: 1, type: 1 } },
              { $sort: { created_at: -1 } }
            ],
            as: 'non_read_chats'
          }
        },
        {
          $lookup: {
            from: 'CHAT',
            let: { roomId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$room', '$$roomId']
                  }
                }
              },
              {
                $project: {
                  body: { text: 1, time: 1, kilograms: 1, location: 1, thumbnail: 1, contentType: 1, key: 1 },
                  _id: 0,
                  tag: 1,
                  created_at: { $dateToString: { format: '%Y-%m-%d %H:%M:%S', date: '$created_at' } },
                  sender_role: { $cond: { if: { $gt: ['$sender_user', null] }, then: 'user', else: 'coach' } }
                }
              },
              {
                $sort: {
                  created_at: -1
                }
              },
              {
                $limit: 1
              }
            ],
            as: 'recent_chat'
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
            'user.deleted': 1,
            'user._id': 1,
            'user.profile_img.location': 1,
            'user.profile_img.thumbnail': 1,
            'coach.name': 1,
            'coach._id': 1,
            'coach.deleted': 1,
            'coach.profile_img.location': 1,
            'coach.profile_img.thumbnail': 1,
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
            recent_chat: { $first: '$recent_chat' },
            non_read_chats_num: {
              $size: '$non_read_chats'
            }
          }
        }
      ]);
      if (roomRecord.length > 0) {
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
