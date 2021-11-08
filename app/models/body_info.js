import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const BodyInfoSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER' },
    time: { type: String, required: true, enum: ['morning', 'night'] },
    kilograms: { type: Number, required: true }
  },
  {
    collection: 'BODY_INFO',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

BodyInfoSchema.plugin(mongoose_delete);

const BodyInfo = mongoose.model('BODY_INFO', BodyInfoSchema);

export default BodyInfo;
