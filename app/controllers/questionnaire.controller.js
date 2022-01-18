import QuestionnaireService from '../services/questionnaire.service';
import roomService from '../services/room.service';
import CoachService from '../services/coach.service';

export const create = async (req, res) => {
  try {
    const userId = req.user.ID;
    const questionnaireDTO = { user: userId, ...req.body };
    const questionnaireCreateResult = await QuestionnaireService.create(questionnaireDTO);
    if (questionnaireCreateResult.success) {
      // 추후 결제 후 로직으로 이동
      const coach = await CoachService.findOne();
      await roomService.create(req, { title: `${userId} CHAT ROOM`, user: userId, coach: coach.body._id });
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
      const getQuestionnaireByUserIdResult = await QuestionnaireService.getByUserId(targetUserId);
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
    const getQuestionnaireByUserIdResult = await QuestionnaireService.update(userId, questionnaireId, questionnaireDTO);
    if (getQuestionnaireByUserIdResult.success) {
      return res.jsonResult(200, getQuestionnaireByUserIdResult.body);
    } else {
      return res.jsonResult(500, { message: 'Questionnaire Create Service Error', err: getQuestionnaireByUserIdResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Questionnaire Controller Error', err: err.message });
  }
};
