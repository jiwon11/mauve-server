import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const whiteListSchema = new Schema(
  {
    phone_NO: { type: String, required: true, unique: true }
  },
  {
    collection: 'WHITE_LIST'
  }
);

whiteListSchema.plugin(mongoose_delete);

const WhiteList = mongoose.model('WHITE_LIST', whiteListSchema);

export default WhiteList;
