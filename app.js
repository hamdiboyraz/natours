const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1 - GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100, // 100 requests from same IP in an hour
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  message: 'Too many requests from this IP, please try again in an hour!',
});

// put limit on all routes starting with /api
app.use('/api', limiter);

app.use(express.json()); // Before this, we used to call body.parser
app.use(express.static(`${__dirname}/public`));

app.use((res, req, next) => {
  console.log('Hello from the middleware!');
  next(); // If we don't write this, we can't get response. Code will be stucked here
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // ISOString nicely formatted at date
  // console.log(req.headers);
  next();
});

// 3 - ROUTE
// Mounting routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find user ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find user ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
