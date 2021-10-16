import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const classSchema = new Schema(
  {
    price: { type: Number, required: true },
    feedback_FRQ: { type: Number, required: true },
    trainer: { type: Schema.Types.ObjectId, ref: 'USER' },
    students: [{ type: Schema.Types.ObjectId, ref: 'USER' }],
    missions: [{ type: Schema.Types.ObjectId, ref: 'CLASS_MISSION' }]
  },
  {
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

classSchema.plugin(mongoose_delete);

const Class = mongoose.model('CLASS', classSchema);

export default Class;
