export default (req, res, next) => {
  res.jsonResult = function (statusCode, result) {
    let body;
    if (typeof result === 'string') {
      body = {
        message: result
      };
    } else if (typeof result === 'object') {
      body = result;
    }
    return res.status(statusCode).json({
      statusCode,
      body
    });
  };
  next();
};
