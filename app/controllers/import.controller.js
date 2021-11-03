import importService from '../services/import.service';

export const billing = async function (req, res) {
  try {
    const { customer_uid, itemId } = req.body;
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
