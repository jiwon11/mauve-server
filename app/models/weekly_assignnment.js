import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const weeklyAssignmentSchema = new Schema(
  {
    url: { type: String, required: true },
    trainer: { type: Schema.Types.ObjectId, ref: 'USER', index: true },
    student: { type: Schema.Types.ObjectId, ref: 'USER', index: true },
    week_NUM: { type: Number, required: true },
    exercise_video: [Schema.Types.Mixed],
    description: { type: String, required: true }
  },
  {
    collection: 'WEEKLY_ASSIGNMENT',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

weeklyAssignmentSchema.plugin(mongoose_delete);

const WeeklyAssignment = mongoose.model('WEEKLY_ASSIGNMENT', weeklyAssignmentSchema);

export default WeeklyAssignment;
