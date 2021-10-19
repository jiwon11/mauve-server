import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    nickname: { type: String, required: true, unique: true },
    phone_NO: { type: String, required: true, unique: true },
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
    fcm_token: { type: String, required: true, default: ` ` },
    role: { type: String, required: true, enum: { values: ['student', 'trainer'], message: '{VALUE} is not supported' } },
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
    collection: 'USER',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

userSchema.plugin(mongoose_delete);

const User = mongoose.model('USER', userSchema);

export default User;
