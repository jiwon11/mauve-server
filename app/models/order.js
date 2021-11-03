import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER', index: true },
    bills: [{ type: Schema.Types.Mixed, required: true }],
    customer_uid: { type: String, index: true },
    merchant_uid: { type: String, index: true }
  },
  {
    collection: 'ORDER',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);
orderSchema.plugin(mongoose_delete);

const Order = mongoose.model('ORDER', orderSchema);

export default Order;
