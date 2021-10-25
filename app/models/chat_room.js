import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const ChatRoomSchema = new Schema(
  {
    title: { type: String, unique: true },
    member: [{ type: Schema.Types.ObjectId, ref: 'USER' }]
  },
  {
    collection: 'CHAT_ROOM',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

ChatRoomSchema.plugin(mongoose_delete);

const ChatRoom = mongoose.model('CHAT_ROOM', ChatRoomSchema);

export default ChatRoom;
