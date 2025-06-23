exports.successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });
};

exports.errorResponse = (res, message, code = 500, error = null) => {
  return res.status(code).json({
    success: false,
    message,
    data: null,
    error,
  });
};
