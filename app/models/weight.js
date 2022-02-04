import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const WeightSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER' },
    time: { type: String, required: true, enum: ['morning', 'night'] },
    date: {
      type: Date,
      required: true
    },
    kilograms: { type: Number, required: true }
  },
  {
    collection: 'WEIGHT',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

WeightSchema.plugin(mongoose_delete, { overrideMethods: true });

const Weight = mongoose.model('WEIGHT', WeightSchema);

export default Weight;
