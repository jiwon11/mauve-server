import QuestionnaireService from '../services/questionnaire.service';
import roomService from '../services/room.service';
import CoachService from '../services/coach.service';
import { createSlackNewUser } from '../queue/slack-user-queue';
import { createGreetingMessage } from '../libs/utils/greetingMessage';

export const create = async (req, res) => {
  try {
    const userId = req.user.ID;
    const questionnaireDTO = { user: userId, ...req.body };
    const getQuestionnaireByUserIdResult = await QuestionnaireService.getByUserId(userId, true);
    let questionnaireCreateResult;
    let statusCode;
    if (getQuestionnaireByUserIdResult.body) {
      questionnaireCreateResult = await QuestionnaireService.update(userId, getQuestionnaireByUserIdResult.body._id, questionnaireDTO);
      statusCode = 200;
    } else {
      questionnaireCreateResult = await QuestionnaireService.create(questionnaireDTO);
      statusCode = 201;
    }
    if (questionnaireCreateResult.success) {
      // 추후 결제 후 로직으로 이동
      const coach = await CoachService.findOne();
      const roomCreateResult = await roomService.create({ title: `${userId} CHAT ROOM`, user: userId, coach: coach.body._id });
      console.log(roomCreateResult.body);
      await createGreetingMessage(req, roomCreateResult.body);
      if (process.env.NODE_ENV === 'production') {
        await createSlackNewUser({ userId: userId });
      }
      return res.jsonResult(201, questionnaireCreateResult.body);
    } else {
      return res.jsonResult(questionnaireCreateResult.body.statusCode, { message: 'Questionnaire Service Error', err: questionnaireCreateResult.body.err });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Questionnaire Controller Error', err: err.message });
  }
};

export const getByUserId = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const userId = req.user.ID;
    const userRole = req.user.role;
    if (userId === targetUserId || userRole === 'coach') {
      const getQuestionnaireByUserIdResult = await QuestionnaireService.getByUserId(targetUserId, false);
      if (getQuestionnaireByUserIdResult.success) {
        return res.jsonResult(200, getQuestionnaireByUserIdResult.body);
      } else {
        return res.jsonResult(500, { message: 'Questionnaire Create Service Error', err: getQuestionnaireByUserIdResult.body });
      }
    } else {
      return res.jsonResult(403, { message: 'Questionnaire Controller Error', err: '이 계정은 권한이 없습니다.' });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Questionnaire Controller Error', err: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const questionnaireId = req.params.id;
    const userId = req.user.ID;
    const questionnaireDTO = { user: userId, ...req.body };
    const updateQuestionnaireResult = await QuestionnaireService.update(userId, questionnaireId, questionnaireDTO);
    if (updateQuestionnaireResult.success) {
      return res.jsonResult(200, updateQuestionnaireResult.body);
    } else {
      return res.jsonResult(500, { message: 'Questionnaire Update Service Error', err: updateQuestionnaireResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Questionnaire Controller Error', err: err.message });
  }
};
