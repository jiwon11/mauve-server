import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const MenstruationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER' },
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  {
    collection: 'MENSTRUATION',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

MenstruationSchema.plugin(mongoose_delete);

const Menstruation = mongoose.model('MENSTRUATION', MenstruationSchema);

export default Menstruation;
