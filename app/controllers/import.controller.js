import importService from '../services/import.service';

export const billing = async function (req, res) {
  try {
    const { customer_uid, itemId } = req.body;
    const userId = req.user.ID;
    const requestPayment = await importService.requestPayment(userId, customer_uid, itemId);
    return res.jsonResult(201, requestPayment);
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Import Controller Error', err });
  }
};

export const callbackSchedule = async function (req, res) {
  try {
    const { imp_uid, merchant_uid } = req.body;
    const userId = req.user.ID;
    const requestPayment = await importService.callbackSchedule(imp_uid, merchant_uid);
    return res.jsonResult(201, requestPayment);
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
