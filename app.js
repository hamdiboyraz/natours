const express = require('express');
const morgan = require('morgan');

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
  next();
});

// 3 - ROUTE
// Mounting routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find user ${req.originalUrl} on this server!`,
  // });

  const err = new Error(`Can't find user ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
