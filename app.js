const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1 - MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
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
