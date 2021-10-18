import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const weeklyPlanSchema = new Schema(
  {
    trainer: { type: Schema.Types.ObjectId, ref: 'USER', index: true },
    week_NUM: { type: Number, required: true },
    exercise_video: [Schema.Types.Mixed],
    description: { type: String, required: true }
  },
  {
    collection: 'WEEKLY_PLAN',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

weeklyPlanSchema.plugin(mongoose_delete);

const WeeklyPlan = mongoose.model('WEEKLY_PLAN', weeklyPlanSchema);

export default WeeklyPlan;
