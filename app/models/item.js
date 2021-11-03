import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const itemSchema = new Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    period: { type: Number, required: true }
  },
  {
    collection: 'ITEM',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);
itemSchema.plugin(mongoose_delete);

const Item = mongoose.model('ITEM', itemSchema);

export default Item;
