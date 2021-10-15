import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const personalChatSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER' },
    chat: String,
    media: Schema.Types.Mixed
  },
  {
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

personalChatSchema.plugin(mongoose_delete);

const PersonalChatRoom = mongoose.model('PERSONAL_CHAT', personalChatSchema);

export default PersonalChatRoom;
