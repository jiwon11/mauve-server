import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
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
    detail_info: {
      height: Number,
      tendency: String,
      diseases: [String],
      job: String
    },
    weight_info: {
      now: Number,
      avg_over_last_5y: Number,
      min_since_age20: Number,
      max_since_age20: Number,
      goal: Number
    },
    fcm_token: { type: String, required: true, default: ` ` },
    role: { type: String, default: 'user' },
    customer_uid: [{ type: String }],
    has_paid: { type: Boolean },
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
