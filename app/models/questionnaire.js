import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const QuestionnaireSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER' },
    body_info: {
      height: { type: Number },
      weight: {
        now: { type: Number },
        avg_over_last_5y: { type: Number },
        min_since_age20: { type: Number },
        //max_since_age20: { type: Number },
        goal: { type: Number }
      }
    },
    goal: [{ type: String, enum: ['건강관리', '체중관리', '월경관리'] }],
    menstrual_cycle: { type: String, enum: ['주기가 일정한 편이에요. (1-2일 차이)', '주기가 종종 바뀌어요. (3일 이상 차이)', '주기의 기복이 심해요. (5일 이상 차이)'] },
    childbirth: {
      has: { type: Boolean },
      last_year: { type: Number }
    },
    lifestyle: {
      type: String,
      enum: [
        '건강한 식습관과 생활습관을 갖고 있어요.',
        '식습관은 규칙적이고 활동적인 편이에요.',
        '식습관은 규칙적이지만 활동량은 부족한 편이에요.',
        '식습관이 불규칙한 편이고 활동적인 편이에요.',
        '식습관과 생활습관 모두 노력이 필요해요.',
        '잘 먹지 않고 활동량도 거의 없어요.'
      ]
    },
    eating_category: {
      type: String,
      enum: ["주로 '밥' 위주로 식사를 해요. 밥 없인 못살아요!", "주로 '밀가루' 위주로 식사를 해요. 밀가루 없인 못살아요!", '밥, 밀가루 골고루 식사를 해요.']
    },
    eating_habits: {
      type: String,
      enum: [
        '밥 보다는 반찬위주로 식사를 하는 편이에요.',
        '반찬 보다는 밥양을 많이 먹는 편이에요.',
        '식사 시간 외로 간식을 자주 먹는 편이에요. (단음료 포함)',
        '맵고 짜고 자극적인 음식을 제일 좋아해요.',
        '담백한 음식을 좋아하고 간을 싱겁게 먹는 편이에요.'
      ]
    },
    number_of_eating: {
      type: String,
      enum: [
        '하루 3끼 이상 식사해요. (계속 배가고파요.)',
        '아침, 점심, 저녁 3끼 모두 식사해요.',
        '아침, 점심, 저녁 3끼 모두 식사하고, 간식도 먹는 편이에요.',
        '아침, 점심, 저녁 중 하루 2끼 식사를 해요.',
        '하루 2끼 식사를 하고, 간식도 먹는 편이에요.',
        '아침, 점심, 저녁 중 하루 1끼 식사를 해요.',
        '하루 1끼 식사를 하고, 간식도 먹는 편이에요.'
      ]
    },
    number_of_coffee: {
      type: String,
      enum: ['하루 한잔은 꼭 마셔요.', '하루 2잔 이상 마셔요.', '일주일에 4-5 잔 정도 마셔요.', '일주일에 2-3잔 정도 마셔요.', '일주일에 1잔 정도 마셔요. (가끔마셔요)', '커피를 아예 안마셔요.']
    },
    diseases: {
      name: {
        type: String,
        enum: ['만성질환 및 대사성 질환', '만성 소화불량 질환', '호르몬관련 질환', '정신질환', '암', '알러지', '기타', '해당없음']
      },
      text: {
        type: String
      }
    }
  },
  {
    collection: 'QUESTIONNAIRE',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

QuestionnaireSchema.plugin(mongoose_delete);

const Questionnaire = mongoose.model('QUESTIONNAIRE', QuestionnaireSchema);

export default Questionnaire;
