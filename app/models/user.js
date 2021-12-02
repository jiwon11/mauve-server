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
    birthdate: { type: Date, required: true },
    //height: { type: Number, required: true },
    //tendency: { type: String, required: true },
    profile_img: {
      type: Schema.Types.Mixed,
      default: {
        fieldname: 'profile_img',
        originalname: ' ',
        mimetype: 'image/jpeg',
        key: ' ',
        location: ' '
      }
    } /*
    weight_info: {
      now: { type: Number, required: true },
      avg_over_last_5y: { type: Number, required: true },
      min_since_age20: { type: Number, required: true },
      max_since_age20: { type: Number, required: true },
      goal: { type: Number, required: true }
    },
    */,
    fcm_token: { type: String, required: true, default: ` ` },
    role: { type: String, default: 'user' },
    customer_uid: [{ type: String }],
    has_paid: { type: Boolean, default: false },
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
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

userSchema.plugin(mongoose_delete);

const User = mongoose.model('USER', userSchema);

export default User;
