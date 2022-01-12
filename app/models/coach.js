import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const coachSchema = new Schema(
  {
    name: {
      type: String,
      validate: {
        validator: function (v) {
          return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(v);
        },
        message: props => `이름은 반드시 한글이어야 합니다. 입력한 이름 : ${props.value}`
      }
    },
    pass_code: { type: String, required: true, unique: true },
    possible_time: [[{ type: Number }], [{ type: Number }], [{ type: Number }], [{ type: Number }], [{ type: Number }]],
    profile_img: {
      type: Schema.Types.Mixed,
      default: {
        fieldname: 'profile_img',
        originalname: ' ',
        mimetype: 'image/jpeg',
        key: ' ',
        location: ' '
      }
    },
    introduce: { type: String, required: true }, // 학력, 경력, 자격증 설명
    fcm_token: { type: String, required: true, default: ` ` },
    role: { type: String, default: 'coach' },
    active: { type: Boolean, default: true },
    notification_config: {
      type: Schema.Types.Mixed,
      default: {
        chat: true,
        record_feedback: true,
        plan_assignment: true,
        mission: true,
        event: true
      }
    }
  },
  {
    collection: 'COACH',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

coachSchema.plugin(mongoose_delete, { overrideMethods: true });

const Coach = mongoose.model('COACH', coachSchema);

export default Coach;
