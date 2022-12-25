class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // Convert string, then use string method
    this.isOperational = true;

    // When a new object is created, function is called, and this func call won't appear in stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
