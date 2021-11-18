import mongoose from 'mongoose';
import moment from 'moment';

const Schema = mongoose.Schema;

const PhoneVerifySchema = new Schema(
  {
    phone_NO: { type: String, required: true, index: true },
    token: { type: String, required: true, index: true },
    created_at: { type: Date, expires: '5m', default: moment().format() }
  },
  {
    collection: 'PHONE_VERIFY'
  }
);

const PhoneVerify = mongoose.model('PHONE_VERIFY', PhoneVerifySchema);

export default PhoneVerify;
