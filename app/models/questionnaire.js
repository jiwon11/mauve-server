import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const QuestionnaireSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER' },
    weight: {
      avg_over_last_5y: { type: Number }, // 최근 5년동안의 평균 체중
      min_since_age20: { type: Number } // 20살 이후 최저 체중
    },
    goal: [{ type: Number, enum: [0, 1, 2, 3] }], // 목표
    menstrual_cycle: { type: Number, enum: [0, 1, 2] }, // 월경 주기
    childbirth: {
      // 출산 경험
      has: { type: Boolean }, // 여부
      last_year: { type: Number } // 최근 연도
    },
    during_pregnancy: { type: Boolean }, // 현재 임신 여부
    lifestyle: {
      // 식습관과 생활습관
      type: Number,
      enum: [0, 1, 2, 3, 4]
    },
    eating_category: {
      // 일주일 중 가장 많이 찾고, 자주 섭취하는 식사의 형태
      type: Number,
      enum: [0, 1, 2, 3, 4]
    },
    eating_habits: [
      // 식사 습관
      {
        type: Number,
        enum: [0, 1, 2, 3]
      }
    ],
    breakfast: {
      // 아침 식사
      type: Number,
      enum: [0, 1, 2, 3]
    },
    lunch: {
      // 점심 식사
      type: Number,
      enum: [0, 1, 2, 3, 4]
    },
    dinner: {
      // 저녁 식사
      type: Number,
      enum: [0, 1, 2, 3, 4]
    },
    drinking: {
      // 음주 빈도
      type: String,
      enum: [0, 1, 2, 3, 4]
    },
    diseases: {
      // 질병, 알러지
      type: String
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
