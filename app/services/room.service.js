import RoomModel from '../models/chat_room';
import chatService from './chat.service';
import mongoose from 'mongoose';
import moment from 'moment-timezone';

const createGreetingMessage = roomRecord => {
  const userName = roomRecord.user.name;
  const coachName = roomRecord.coach.name;
  return `안녕하세요, ${userName}님! 모브 ${coachName} 코치입니다.
${userName}님의 건강한 체중감량을 위해 오늘부터 2주동안(~2/9) 채팅을 통해 꼼꼼한 식단관리를 해드릴 예정입니다. 
모브 앱에 매일 체중과 식단을 기록해주시면 문진표에 작성해주신 전반적인 건강 상태를 바탕으로 ${userName}님의 식습관과 생활습관, 그리고 월경주기를 분석해 건강한 다이어트 솔루션을 제공해드리겠습니다!
앞으로의 관리에 있어서 가장 중요한 6가지 규칙에 대해 알려드리겠습니다.

1️⃣ 식단일기 매일 보내기
식사를 하시기 전에 어떤 것을 먹어야 할지, 어떤 것을 먹을 계획인지 말씀해 주시면 균형 잡힌 식사를 하실 수 있도록 팁을 드릴 예정입니다.
그리고 식사를 하실 때는 식사 메뉴를 사진을 찍어 보내주세요. 사진을 통해서 더욱 상세한 피드백을 드릴 수 있고 ${userName}님의 식단 변화를 볼 수 있어요. 하단의 + 버튼을 누르시면 사진을 전송할 수 있습니다.
술 약속이나 외식이 있을 경우에는 사전에 말씀해 주시면 상황에 맞는 팁을 드릴게요.
* 주말이나 이른 아침, 늦은 저녁 식사의 경우 코치의 활동 시간인 평일 오전 10시~오후 6시 사이에 미리 상담을 해주세요.

2️⃣ 식사시간과 식사량 설정하기
정해진 식사시간에 맞추어 일정한 양으로 식사를 해야 스스로 대사할 수 있는 몸이 만들어집니다. 식사량을 줄이거나, 굶거나, 굳이 운동을 하지 않아도 우리의 몸 스스로 대사가 되면서 체중이 감량되어야 내장지방 감소와 혈관나이 개선 등의 효과를 볼 수 있습니다.
식사시간의 간격은 4시간 반 ~ 5시간이 가장 이상적입니다. 추천드리는 식사시간은 오전 8시 / 오후 12시 / 오후 6시 패턴입니다. 최대한 아침식사는 오전 9시 이전에, 저녁식사는 오후 7시 이전에 끝내주세요!

3️⃣ 3끼 식사는 ‘밥’으로 먹기
과일, 빵, 시리얼, 음료 등의 대체식으로 식사를 하거나 식사를 거르는 등 규칙적인 3끼 식사가 진행이 되지 않을 경우에는 효과적인 다이어트를 기대하기 어렵고, 요요가 올 확률도 높아집니다.
3대 영양소를 골고루 먹거나 최대한 ‘밥’위주의 식사를 진행해 주세요!

4️⃣ 아침 체중&저녁 체중 기록하기
매일매일 아침 체중과 저녁 체중을 측정해 주세요.
아침 체중 → 기상 직후 체중
저녁 체중 → 취침 직전 체중
${userName}님의 체중 변화 추이를 확인하면 ${userName}님이 현재 먹은 만큼 스스로 소비가 가능한 몸인지를 대략적으로 확인할 수 있습니다. 수면대사가 잘 되는지, 활동대사가 잘 되는지 등을 확인하면서 어떤 식단과 어떤 다이어트 방식이 효과적인지 알려드릴게요.
체중 입력 시 동일한 조건을 유지하기 위해서 가급적이면 속옷만 입은 상태에서 체중을 체크해 주시는 것을 권장 드립니다.

5️⃣ 수면시간 체크하기
늦은 밤에 운동을 하는 것보다는 일찍 자는 수면 습관 개선만으로도 자고 일어난 다음날 평균적으로 400~600g 정도의 체중 차이를 확인해 볼 수 있습니다. 
오전 12시 이전의 취침 습관과 7시간 ~ 7시간 30분 정도의 적당한 수면시간을 통해 살이 빠지는 호르몬 분비를 촉진시켜 살이 잘 빠지는 생활습관을 만들어주세요!

6️⃣ 물을 마시는 습관 바꾸기
수분 섭취는 마시는 양 보다 마시는 방법이 더욱 중요합니다.
벌컥벌컥 급하게 물을 마시는 습관, 차가운 물을 마시는 습관은 체온을 떨어뜨리면서 신진대사를 저하시킵니다. 따뜻하게 마시는 수분 섭취는 체온을 서서히 높여주기 때문에 몸의 면역력 뿐만 아니라 신진대사를 원활하게 도와주기 때문에 따뜻한 물 마시기 습관만으로도 요요 없는 몸을 만들 수 있습니다.
따뜻한 물 마시기를 싫어하는 경우에는 평소에 짜게 먹는 습관이 익숙한 사람일 확률이 높습니다. 평소에 내가 짜게 먹고 있지는 않은지, 염분 조절은 잘 되고 있는지 확인해 주세요.

다이어트에서 가장 중요한 것은 적게 먹고 운동하는 것이 아닌, 내 몸 스스로 소비할 수 있는 몸을 만드는 것 입니다. 몸에 불필요한 노폐물을 배출시키고, 신진대사를 끌어올려서 체지방을 감량할 수 있는 건강한 식습관 플랜을 모브와 함께 시작해 볼게요. 

시작하기 전에 회원님이 주로 하셨던 다이어트 방법에 대한 이해가 필요해요. 회원님이 최근 다이어트 하셨던 방법에 대해 알려주실 수 있을까요?`;
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
