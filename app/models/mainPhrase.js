import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const Schema = mongoose.Schema;

const mainPhraseSchema = new Schema(
  {
    phase: { type: String, required: true, enum: ['effort_time', 'before_period', 'period', 'golden_time'] },
    phrases: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: Schema.Types.Mixed, required: true }
      }
    ]
  },
  {
    collection: 'MAIN_PHRASE',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => {
        return new Date().getTime() + 9 * 3600000;
      }
    }
  }
);

mainPhraseSchema.index({ phase: 1 });

mainPhraseSchema.plugin(mongoose_delete, { overrideMethods: true });

const MainPhrase = mongoose.model('MAIN_PHRASE', mainPhraseSchema);

export default MainPhrase;
