import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const cardSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'USER', index: true },
    merchant_uid: String,
    card_code: String,
    card_name: String,
    card_number: String,
    card_type: String,
    customer_addr: String,
    customer_email: String,
    customer_name: String,
    customer_postcode: String,
    customer_tel: String,
    customer_uid: String,
    pg_id: String,
    pg_provider: String
  },
  {
    collection: 'CARD',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);
cardSchema.plugin(mongoose_delete, { overrideMethods: true });

const Card = mongoose.model('CARD', cardSchema);

export default Card;
