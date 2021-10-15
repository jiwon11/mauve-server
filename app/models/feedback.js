import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
    answer: { type: String, required: true },
    feedback_media: [{ type: Schema.Types.Mixed }],
    trainer: { type: Schema.Types.ObjectId, ref: 'USER' },
    record: { type: Schema.Types.ObjectId, ref: 'RECORD' }
  },
  {
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

feedbackSchema.plugin(mongoose_delete);

const Feedback = mongoose.model('FEEDBACK', feedbackSchema);

export default Feedback;
