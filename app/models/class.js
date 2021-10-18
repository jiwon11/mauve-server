import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const classSchema = new Schema(
  {
    price: { type: Number, required: true },
    feedback_FRQ: { type: Number, required: true },
    trainer: { type: Schema.Types.ObjectId, ref: 'USER', index: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'USER', index: true }],
    missions: [{ type: Schema.Types.ObjectId, ref: 'CLASS_MISSION' }]
  },
  {
    collection: 'CLASS',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

const Class = mongoose.model('CLASS', classSchema);

export default Class;
