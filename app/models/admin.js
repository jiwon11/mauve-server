import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    name: {
      type: String,
      validate: {
        validator: function (v) {
          return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(v);
        },
        message: props => `이름은 반드시 한글이어야 합니다. 입력한 이름 : ${props.value}`
      }
    },
    pass_code: { type: String, required: true, unique: true },
    role: { type: String, default: 'admin' }
  },
  {
    collection: 'ADMIN',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

adminSchema.plugin(mongoose_delete, { overrideMethods: true });

const Admin = mongoose.model('ADMIN', adminSchema);

export default Admin;
