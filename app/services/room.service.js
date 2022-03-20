import RoomModel from '../models/chat_room';
import chatService from './chat.service';
import mongoose from 'mongoose';
import moment from 'moment-timezone';

const createGreetingMessage = roomRecord => {
  const userName = roomRecord.user.name;
  const coachName = roomRecord.coach.name;
  return `안녕하세요, ${userName}님! 모브 ${coachName} 코치입니다. 

모브 1일차에는 응답해주신 문진표를 기반으로 ${userName} 님께 맞는 ‘1주일 추천 식단'과 맞춤 플랜 방향을 미리 안내해드리겠습니다. 자동화된 식단이 아닌 개개인별 상황에 맞게 맞춤형 식단으로 제공이 되기 때문에 시간이 다소 소요될 수 있으며, 당일 내로 식단표를 제공해드리겠습니다. (실제 식단관리 및 피드백은 내일부터 진행이 됩니다.)

문진표에 작성해 주신 전반적인 건강 상태를 바탕으로 ${userName}님의 식습관과 생활습관, 그리고 월경주기를 분석한 건강한 다이어트 솔루션 제공을 위해 매일 체중과 식단 기록을 부탁드립니다. 

또한, 모브 앱 사용 방법과 관리 방향에 대해서는 관리 시작 전 전화 서비스를 통해 알려드릴 예정입니다. 통화가 가능하신 시간대를 간단하게 알려주세요! 전화가 아닌 보이스톡으로 순차적으로 연락드릴 예정입니다. 통화 시간은 매주 1회 회원님과 정해진 시간에 대략 10~15분 정도 진행될 예정이니 꼭 참고해주세요.`;
};
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
      connectedUser.push(mongoose.Types.ObjectId(roomRecord.coach._id));
      const greetingMessage = createGreetingMessage(roomRecord);
      await chatService.postChat(io, connectedUser, roomDTO.coach, 'coach', newRoom._id.toString(), { text: greetingMessage });
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
      let roomAggregatePipeLine;
      if (userRole === 'admin') {
        roomAggregatePipeLine = [
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
              //created_at: 1,
              'user.name': 1,
              'user._id': 1,
              'user.profile_img.location': 1,
              'user.profile_img.thumbnail': 1,
              'user.deleted': 1,
              'coach.name': { $concat: ['$coach.name', ' ', '코치'] },
              'coach._id': 1,
              'coach.profile_img.location': 1,
              'coach.profile_img.thumbnail': 1,
              'coach.deleted': 1
            }
          }
        ];
      } else {
        let matchPipeline = {};
        matchPipeline[userRole] = mongoose.Types.ObjectId(userId);
        roomAggregatePipeLine = [
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
                          $eq: ['$deleted', false]
                        },
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
                      $and: [{ $eq: ['$deleted', false] }, { $eq: ['$room', '$$roomId'] }, { $gt: ['$sender_user', null] }]
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
                      $and: [{ $eq: ['$deleted', false] }, { $eq: ['$room', '$$roomId'] }]
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
                        { $eq: ['$deleted', false] },
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
              'coach.name': { $concat: ['$coach.name', ' ', '코치'] },
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
        ];
      }
      const roomRecords = await RoomModel.aggregate(roomAggregatePipeLine);
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
                    $and: [{ $eq: ['$room', '$$roomId'] }, { $gt: ['$sender_coach', null] }]
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
            'coach.name': { $concat: ['$coach.name', ' ', '코치'] },
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
