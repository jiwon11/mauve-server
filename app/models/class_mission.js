import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import moment from 'moment';

const Schema = mongoose.Schema;

const classMissionSchema = new Schema(
  {
    end_date: { type: Date, required: true, default: moment().tz('Asia/Seoul').format('YYYY-MM-DD') },
    point_NUM: { type: Number, required: true },
    description: { type: String, required: true },
    class: { type: Schema.Types.ObjectId, ref: 'CLASS', index: true },
    fulfill_students: [{ type: Schema.Types.ObjectId, ref: 'STUDENT' }]
  },
  {
    collection: 'CLASS_MISSION',
    timestamps: {
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

classMissionSchema.plugin(mongoose_delete);

const ClassMission = mongoose.model('CLASS_MISSION', classMissionSchema);

export default ClassMission;
