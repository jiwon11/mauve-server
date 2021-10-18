import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const studentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER', index: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    birthdate: { type: Date, required: true, default: moment.tz('Asia/Seoul').format('YYYY-MM-DD') }
  },
  {
    collection: 'STUDENT',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

studentSchema.plugin(mongoose_delete);

const Student = mongoose.model('STUDENT', studentSchema);

export default Student;
