const httpStatus = require("http-status-codes");

function errorHandler(err, req, response, next) {
  console.log("error Name : " + err.name);
  if (err.name === "UnauthorizedError") {
    // jwt authentication error
    return response.status(httpStatus.StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Not authorized to use.",
    });
  }

  if (err.name === "ValidationError") {
    //  validation error
    return response.status(httpStatus.StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: err.message,
    });
  }

  // default to 500 server error
  return response.status(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message,
  });
}

module.exports = errorHandler;
