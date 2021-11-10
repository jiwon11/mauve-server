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
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

PeriodSchema.plugin(mongoose_delete);

const Period = mongoose.model('PERIOD', PeriodSchema);

export default Period;
