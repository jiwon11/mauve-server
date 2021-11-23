import ImportService from '../services/import.service';
import UserService from '../services/user.service';
import OrderService from '../services/order.service';

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
    console.time('requestPayment');
    const requestPayment = await ImportService.requestPayment(userId, customer_uid, itemId);
    console.timeEnd('requestPayment');
    if (requestPayment.success) {
      const paymentDTO = requestPayment.body.response;
      console.time('createOrder');
      const createOrderResult = await OrderService.create(paymentDTO.customer_uid.split('_')[0], paymentDTO.name.split('_')[0], paymentDTO, paymentDTO.customer_uid, paymentDTO.merchant_uid);
      console.timeEnd('createOrder');
      if (!createOrderResult.success) {
        return res.jsonResult(500, createOrderResult.body);
      }
      console.time('updatePaid');
      const userPaidUpdate = await UserService.updatePaid(userId, true);
      console.timeEnd('updatePaid');
      if (!userPaidUpdate.success) {
        return res.jsonResult(404, userPaidUpdate.body);
      }
      return res.jsonResult(201, createOrderResult.body);
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
      const userPaidUpdate = await UserService.updatePaid(merchant_uid.split('_')[0], true);
      if (!userPaidUpdate.success) {
        return res.jsonResult(404, userPaidUpdate.body);
      }
      const paymentDTO = schedulePayment.body.payment;
      const createOrderResult = await OrderService.create(paymentDTO.customer_uid.split('_')[0], paymentDTO.name.split('_')[0], paymentDTO, paymentDTO.customer_uid, paymentDTO.merchant_uid);
      if (!createOrderResult.success) {
        return res.jsonResult(500, createOrderResult.body);
      }
      return res.jsonResult(201, schedulePayment.body);
    } else {
      return res.jsonResult(schedulePayment.body.statusCode, schedulePayment.body.message);
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Import Controller Error', err });
  }
};

export const unschedule = async (req, res) => {
  try {
    const userId = req.user.ID;
    const recentOrderResult = await OrderService.getRecentOrder(userId);
    if (!recentOrderResult.success) {
      return res.jsonResult(500, { message: 'Order Service Error', body: recentOrderResult.body });
    }
    const unscheduleResult = await ImportService.unschedule(recentOrderResult.body.customer_uid);
    if (!unscheduleResult.success) {
      return res.jsonResult(500, { error: 'Import Service Error', message: unscheduleResult.body.message });
    }
    const userPaidUpdate = await UserService.updatePaid(userId, false);
    if (!userPaidUpdate.success) {
      return res.jsonResult(404, userPaidUpdate.body);
    }
    return res.jsonResult(200, unscheduleResult.body);
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'User Controller Error', err });
  }
};

/**
 * ** 추가 API
 * 결제 취소
 * 결제 환불
 * 구매자의 빌링키 정보 삭제
 */
