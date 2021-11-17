import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, refPath: 'senderModel' },
    senderModel: { type: String, required: true, enum: ['USER', 'COACH'] },
    tag: { type: String, required: true, enum: ['chat', 'picture', 'breakfast', 'lunch', 'dinner'] },
    chat: String,
    media: Schema.Types.Mixed,
    room: { type: Schema.Types.ObjectId, index: true, ref: 'CHAT_ROOM' },
    readers: [{ type: Schema.Types.ObjectId, refPath: 'readerModel' }]
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

ChatSchema.virtual('readersNum').get(function () {
  return this.readers.length;
});

ChatSchema.plugin(mongoose_delete);

const ChatRoom = mongoose.model('CHAT', ChatSchema);

export default ChatRoom;
