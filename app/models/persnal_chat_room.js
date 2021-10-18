import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const personalChatRoomSchema = new Schema(
  {
    class: { type: Schema.Types.ObjectId, ref: 'CLASS' }
  },
  {
    collection: 'PERSONAL_CHAT_ROOM',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

personalChatRoomSchema.plugin(mongoose_delete);

const PersonalChatRoom = mongoose.model('PERSONAL_CHAT_ROOM', personalChatRoomSchema);

export default PersonalChatRoom;
