const AppError = require('./../utils/appError');

const handleCastErrorDB = (err, res) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: "${value}". Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => {
    return el.message;
  });
  const message = `Invalid input data. ${errors.join('. ')}`;
  // console.log(err);
  return new AppError(message, 400);
};

// Here in ES6, curly braces are not needed and implicit return
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    console.log(err);
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B) RENDERED WEBSITE
  console.log(err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // a) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // b)Programming or other unknown error: don't leak error details
    // 1) Log error
    console.log('ERROR', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
  // B) RENDERED WEBSITE
  if (err.isOperational) {
    // a) Operational, trusted error: send message to client
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // b) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.log('ERROR', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack); // Indicates where err is occured
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // in order to distinguish coming from expres err we use error, that means,
    // instead of override, we make hard copy of err
    // let error = {...err} // This is not gonna work, because when we are destructure,
    // we just coppy err object's own methods and properties not prototype's
    let error = Object.create(err);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
