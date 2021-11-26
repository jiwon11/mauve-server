import mainPhraseService from '../services/mainPhrase.service';

export const update = async (req, res) => {
  try {
    const phase = req.params.phase;
    const phraseData = req.body.phrase;
    const phraseUpdateResult = await mainPhraseService.update(phase, phraseData);
    if (!phraseUpdateResult.success) {
      return res.jsonResult(500, { message: 'Main Phrase Service Error', err: phraseUpdateResult.body });
    }
    return res.jsonResult(201, phraseUpdateResult.body);
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Main Phrase Controller Error', err: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const phraseGetAllResult = await mainPhraseService.getAll();
    if (!phraseGetAllResult.success) {
      return res.jsonResult(500, { message: 'Main Phrase Service Error', err: phraseGetAllResult.body });
    }
    return res.jsonResult(200, phraseGetAllResult.body);
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Main Phrase Controller Error', err: err.message });
  }
};
