import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const trainerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER' },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    birthdate: { type: Date, required: true, default: moment.tz('Asia/Seoul').format('YYYY-MM-DD') }
  },
  {
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

trainerSchema.plugin(mongoose_delete);

const Trainer = mongoose.model('TRAINER', trainerSchema);

export default Trainer;
