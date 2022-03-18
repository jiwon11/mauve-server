import QuestionnaireModel from '../models/questionnaire';
import mongoose from 'mongoose';

export default class QuestionnaireService {
  static async create(questionnaireDTO) {
    try {
      const newQuestionnaire = await QuestionnaireModel.create(questionnaireDTO);
      return { success: true, body: newQuestionnaire };
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err: err.message } };
    }
  }

  static async getByUserId(userId, withDeleted) {
    try {
      const pipeline = [
        {
          $match: {
            user: mongoose.Types.ObjectId(userId)
          }
        }
      ];
      let questionnaireRecord;
      if (withDeleted) {
        questionnaireRecord = await QuestionnaireModel.aggregateWithDeleted(pipeline);
      } else {
        questionnaireRecord = await QuestionnaireModel.aggregate(pipeline);
      }
      return { success: true, body: questionnaireRecord[0] };
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err: err.message } };
    }
  }

  static async update(userId, questionnaireId, questionnaireDTO) {
    try {
      const existQuestionnaireRecord = await QuestionnaireModel.aggregateWithDeleted([
        {
          $match: {
            _id: mongoose.Types.ObjectId(questionnaireId)
          }
        }
      ]);
      if (existQuestionnaireRecord[0].deleted) {
        await QuestionnaireModel.restore({ _id: existQuestionnaireRecord[0]._id });
      }
      const updatedQuestionnaireRecord = await QuestionnaireModel.findByIdAndUpdate({ _id: questionnaireId, user: userId }, questionnaireDTO, { new: true });
      if (updatedQuestionnaireRecord) {
        return { success: true, body: updatedQuestionnaireRecord };
      } else {
        return { success: false, body: { statusCode: 404, err: `User not founded by ID : ${questionnaireId} AND userId : ${userId}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: { statusCode: 500, err: err.message } };
    }
  }
}
