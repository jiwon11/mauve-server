import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const PeriodSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER' },
    ovulation_day: { type: Date, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: false }
  },
  {
    collection: 'PERIOD',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

PeriodSchema.index({ user: 1 });
PeriodSchema.plugin(mongoose_delete, { overrideMethods: true });

const Period = mongoose.model('PERIOD', PeriodSchema);

export default Period;
