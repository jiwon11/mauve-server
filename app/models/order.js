import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER', index: true },
    item: { type: Schema.Types.ObjectId, ref: 'ITEM', index: true },
    bills: { type: Schema.Types.Mixed, required: true },
    customer_uid: { type: String, index: true },
    merchant_uid: { type: String, index: true }
  },
  {
    collection: 'ORDER',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);
orderSchema.plugin(mongoose_delete, { overrideMethods: true });

const Order = mongoose.model('ORDER', orderSchema);

export default Order;
