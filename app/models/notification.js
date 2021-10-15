import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    title: String,
    body: String,
    data: { any: Object },
    sender: { type: Schema.Types.ObjectId, ref: 'USER' },
    notified_user: { type: Schema.Types.ObjectId, ref: 'USER' }
  },
  {
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

notificationSchema.plugin(mongoose_delete);

const Notification = mongoose.model('NOTIFICATION', notificationSchema);

export default Notification;
