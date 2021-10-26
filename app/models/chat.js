import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'USER' },
    chat: String,
    media: Schema.Types.Mixed,
    room: { type: Schema.Types.ObjectId, ref: 'CHAT_ROOM' },
    readers: [{ type: Schema.Types.ObjectId, ref: 'USER' }]
  },
  {
    collection: 'CHAT',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

ChatSchema.plugin(mongoose_delete);

const ChatRoom = mongoose.model('CHAT', ChatSchema);

export default ChatRoom;
