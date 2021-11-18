import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const recordSchema = new Schema(
  {
    category: { type: String, required: true, default: 'menu' },
    question: { type: String, required: true },
    media: [{ type: Schema.Types.Mixed }],
    user: { type: Schema.Types.ObjectId, ref: 'USER', index: true },
    coach: { type: Schema.Types.ObjectId, ref: 'COACH', index: true }
  },
  {
    collection: 'RECORD',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

recordSchema.plugin(mongoose_delete);

const Record = mongoose.model('RECORD', recordSchema);

export default Record;
