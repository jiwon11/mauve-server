import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    title: String,
    body: String,
    data: Object,
    sender_user: { type: Schema.Types.ObjectId, ref: 'USER' },
    sender_coach: { type: Schema.Types.ObjectId, ref: 'COACH' },
    notified_user: { type: Schema.Types.ObjectId, ref: 'USER' },
    notified_coach: { type: Schema.Types.ObjectId, ref: 'COACH' }
  },
  {
    collection: 'NOTIFICATION',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

notificationSchema.plugin(mongoose_delete, { overrideMethods: true });

const Notification = mongoose.model('NOTIFICATION', notificationSchema);

export default Notification;
