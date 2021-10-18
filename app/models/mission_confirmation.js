import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const classConfirmationSchema = new Schema(
  {
    url: { type: String, required: true },
    class_mission: { type: Schema.Types.ObjectId, ref: 'CLASS_MISSION', index: true },
    student: { type: Schema.Types.ObjectId, ref: 'USER', index: true }
  },
  {
    collection: 'CLASS_CONFIRMATION',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

classConfirmationSchema.plugin(mongoose_delete);

const classConfirmation = mongoose.model('CLASS_CONFIRMATION', classConfirmationSchema);

export default classConfirmation;
