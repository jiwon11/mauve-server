import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const bodyInfoSchema = new Schema(
  {
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    purpose: { type: String, required: true },
    experience: { type: String, required: true },
    type: { type: String, required: true },
    sequence: { type: String, required: true },
    focus_target: { type: String, required: true },
    trouble: { type: String, required: true },
    inbody_img: { type: Schema.Types.Mixed, required: true },
    student: { type: Schema.Types.ObjectId, ref: 'USER', index: true }
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

bodyInfoSchema.plugin(mongoose_delete);

const BodyInfo = mongoose.model('BODY_INFO', bodyInfoSchema);

export default BodyInfo;
