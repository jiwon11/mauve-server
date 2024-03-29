import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    sender_user: { type: Schema.Types.ObjectId, ref: 'USER' },
    sender_coach: { type: Schema.Types.ObjectId, ref: 'COACH' },
    //sender: { type: Schema.Types.ObjectId, refPath: 'senderModel' },
    //senderModel: { type: String, required: true, enum: ['USER', 'COACH', 'SYSTEM'] },
    tag: { type: String, required: true, enum: ['chat', 'picture', 'breakfast', 'lunch', 'dinner', 'snack', 'yasik', 'weight'] },
    body: Schema.Types.Mixed,
    //chat: String,
    //media: Schema.Types.Mixed,
    //weight: Schema.Types.Mixed,
    room: { type: Schema.Types.ObjectId, index: true, ref: 'CHAT_ROOM' },
    readers: [{ type: Schema.Types.ObjectId, refPath: 'readerModel' }]
  },
  {
    collection: 'CHAT',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

ChatSchema.index({ created_at: -1 });
ChatSchema.index({ readers: 1 });

ChatSchema.virtual('readersNum').get(function () {
  return this.readers.length;
});

ChatSchema.plugin(mongoose_delete, { overrideMethods: true });

const ChatRoom = mongoose.model('CHAT', ChatSchema);

export default ChatRoom;
