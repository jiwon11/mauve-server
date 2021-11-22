import ImportService from '../services/import.service';
import UserService from '../services/user.service';

export const getUserCardInfo = async (req, res) => {
  try {
    const userId = req.user.ID;
    const billingKeyResult = await ImportService.getUserCards(userId);
    if (billingKeyResult.success) {
      return res.jsonResult(200, billingKeyResult.body);
    } else {
      return res.jsonResult(500, { message: 'User Service Error', body: billingKeyResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};

export const billing = async function (req, res) {
  try {
    const { customer_uid, itemId } = req.body;
    const userId = req.user.ID;
    const requestPayment = await ImportService.requestPayment(userId, customer_uid, itemId);
    if (requestPayment.success) {
      const userPaidUpdate = await UserService.updatePaid(userId);
      if (userPaidUpdate.success) {
        return res.jsonResult(201, requestPayment.body);
      } else {
        return res.jsonResult(404, userPaidUpdate.body);
      }
    } else {
      return res.jsonResult(requestPayment.body.statusCode, requestPayment.body.message);
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Import Controller Error', err });
  }
};

export const callbackSchedule = async function (req, res) {
  try {
    const { imp_uid, merchant_uid } = req.body;
    const schedulePayment = await ImportService.callbackSchedule(imp_uid, merchant_uid);
    if (schedulePayment.success) {
      const userPaidUpdate = await UserService.updatePaid(userId);
      if (userPaidUpdate.success) {
        return res.jsonResult(201, schedulePayment.body);
      } else {
        return res.jsonResult(404, userPaidUpdate.body);
      }
    } else {
      return res.jsonResult(schedulePayment.body.statusCode, schedulePayment.body.message);
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Import Controller Error', err });
  }
};

/**
 * ** 추가 API
 * 결제 취소
 * 결제 환불
 * 결제요청예약 취소
 * 구매자의 빌링키 정보 삭제
 */
