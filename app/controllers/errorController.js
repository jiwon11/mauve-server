import httpStatus from 'http-status-codes';

export const pageNotFoundError = (req, res) => {
  let errorCode = httpStatus.NOT_FOUND;
  const result = {
    status: errorCode,
    body: {
      message: '유효하지 않는 API입니다!'
    }
  };
  res.status(errorCode).json(result);
};

export const respondInternalError = (errors, req, res, next) => {
  let errorCode = httpStatus.INTERNAL_SERVER_ERROR;
  console.log(`Error occured: ${errors.stack}`);
  const result = {
    status: errorCode,
    body: {
      message: '서버에서 에러가 발생하였습니다!'
    }
  };
  res.status(errorCode).json(result);
};
