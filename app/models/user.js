import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String
    },
    phone_NO: { type: String, required: true, unique: true },
    birthdate: { type: Date },
    height: { type: Number },
    weight: {
      now: { type: Number },
      goal: { type: Number }
    },
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
    role: { type: String, default: 'user' },
    customer_uid: [{ type: String }],
    has_paid: { type: Boolean, default: false },
    next_payment: { type: Date },
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

userSchema.plugin(mongoose_delete, { overrideMethods: true });

const User = mongoose.model('USER', userSchema);

export default User;
