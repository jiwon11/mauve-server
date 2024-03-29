import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
    answer: { type: String, required: true },
    feedback_media: [{ type: Schema.Types.Mixed }],
    coach: { type: Schema.Types.ObjectId, ref: 'COACH', index: true },
    record: { type: Schema.Types.ObjectId, ref: 'RECORD', index: true }
  },
  {
    collection: 'FEEDBACK',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

feedbackSchema.plugin(mongoose_delete, { overrideMethods: true });

const Feedback = mongoose.model('FEEDBACK', feedbackSchema);

export default Feedback;
