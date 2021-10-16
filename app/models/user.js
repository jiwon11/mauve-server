import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const notificationConfigSchema = new Schema({
  chat: { type: Boolean, default: true },
  record_feedback: { type: Boolean, default: true },
  plan_assignment: { type: Boolean, default: true },
  mission: { type: Boolean, default: true },
  event: { type: Boolean, default: true }
});

const userSchema = new Schema(
  {
    nickname: { type: String, required: true, unique: true },
    phone_NO: { type: String, required: true, unique: true },
    profileImg: { type: String, required: true, default: ` ` },
    fcm_token: { type: String, required: true, default: ` ` },
    role: { type: String, required: true, enum: ['student', 'trainer'] },
    notification_config: notificationConfigSchema
  },
  {
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
