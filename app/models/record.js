import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const recordSchema = new Schema(
  {
    category: { type: String, required: true, enum: ['meals', 'exercise'] },
    question: { type: String, required: true },
    media: [{ type: Schema.Types.Mixed }],
    student: { type: Schema.Types.ObjectId, ref: 'USER', index: true },
    class: { type: Schema.Types.ObjectId, ref: 'CLASS', index: true }
  },
  {
    collection: 'RECORD',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

recordSchema.plugin(mongoose_delete);

const Record = mongoose.model('RECORD', recordSchema);

export default Record;
