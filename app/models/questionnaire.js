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
    menstrual_cycle: { type: String, enum: ['주기가 일정한 편이에요. (1-2일 차이)', '주기가 종종 바뀌어요. (3일 이상 차이)', '주기의 편차가 심해요. (5일 이상 차이)'] },
    childbirth: {
      has: { type: Boolean },
      last_year: { type: Number }
    },
    during_pregnancy: { type: Boolean },
    lifestyle: {
      type: String,
      enum: [
        '식습관이 규칙적이며 주기적인 운동을 하고 활동적인 편이에요.',
        '식습관은 규칙적이지만 활동량은 부족한 편이에요.',
        '식습관은 불규칙하지만 주기적인 운동을 하고 활동적인 편이에요.',
        '식습관이 불규칙하고 활동량도 부족한 편이에요.',
        '식사량과 식사 시간이 매우 불규칙하고 활동량도 거의 없어요.'
      ]
    },
    eating_category: {
      type: String,
      enum: [
        '주로 ‘밥’ 위주 식사를 해요. 밥 없인 못살아요!',
        '주로 밀가루 위주 식사를 해요. 밀가루 없인 못살아요!',
        '밥, 밀가루 골고루 식사를 해요.',
        '밥, 밀가루, 등 탄수화물보다는 다른 영양소 위주 식사를 해요.'
      ]
    },
    eating_habits: [
      {
        type: String,
        enum: [
          '밥 보다는 반찬위주로 식사를 하는 편이에요.',
          '반찬 보다는 밥양을 많이 먹는 편이에요.',
          '식사 외 간식이나 단 음료를 자주 먹는 편이에요.',
          '맵고 짜고 자극적인 음식을 제일 좋아해요.',
          '담백한 음식을 좋아하고 간을 싱겁게 먹는 편이에요.'
        ]
      }
    ],
    number_of_eating: {
      type: String,
      enum: [
        '하루 3끼 이상 식사해요. (계속 배가 고파요)',
        '3끼 (아침, 점심, 저녁)를 정해진 시간에 식사하고 그 외 군것질은 안 하는 편이에요.',
        '하루 3끼와 중간에 간식도 종종 먹어요.',
        '아침, 점심, 저녁 중 하루 2끼 식사를 해요.',
        '하루 2끼와 중간에 간식도 종종 먹어요.',
        '아침, 점심, 저녁 중 하루 1끼 식사를 해요.',
        '하루 1끼와 중간에 간식도 종종 먹어요.'
      ]
    },
    number_of_coffee: {
      type: String,
      enum: ['하루 한잔은 꼭 마셔요.', '하루 2잔 이상 마셔요.', '일주일에 4-5 잔 정도 마셔요.', '일주일에 2-3잔 정도 마셔요.', '아주 가끔 마셔요. (일주일에 1잔 정도)', '아예 안 마셔요.']
    },
    diseases: {
      name: {
        type: String,
        enum: ['만성질환 및 대사성 질환', '호르몬관련 질환', '정신 질환', '암', '알러지', '기타', '해당없음']
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

QuestionnaireSchema.plugin(mongoose_delete, { overrideMethods: true });

const Questionnaire = mongoose.model('QUESTIONNAIRE', QuestionnaireSchema);

export default Questionnaire;
