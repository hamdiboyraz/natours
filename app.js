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

module.exports = app;
