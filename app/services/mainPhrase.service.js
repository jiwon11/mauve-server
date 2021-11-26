import MainPhraseModel from '../models/mainPhrase';

export default class mainPhraseService {
  static async update(phaseName, phraseData) {
    try {
      const updatedPhraseRecord = await MainPhraseModel.findOneAndUpdate(
        { phase: phaseName },
        {
          $push: { phrases: phraseData }
        },
        {
          returnOriginal: false,
          upsert: true,
          projection: {
            phase: 1,
            phrases: 1
          }
        }
      );
      return { success: true, body: updatedPhraseRecord };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async getByPhase(phaseName) {
    try {
      const allPhraseRecord = await MainPhraseModel.aggregate([{ $match: { phase: phaseName } }, { $project: { _id: 0, phrases: 1 } }]);
      return { success: true, body: allPhraseRecord[0] };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }

  static async getAll() {
    try {
      const allPhraseRecord = await MainPhraseModel.aggregate([{ $project: { _id: 0, phase: 1, phrases: 1 } }]);
      return { success: true, body: allPhraseRecord };
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}