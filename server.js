const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Global Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Server Shutting Down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

// After configuration, we require app file
const app = require('./app');

const DB = process.env.DB_URI.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', false); // in order to remove Deprecationwarning about strictQuery
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to the DB succesully');
  });
// .catch((err) => {
//   console.log(`DB connection err:, ${err}`);
// });

// console.log(process.env.NODE_ENV);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Global Unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Server Shutting Down...');
  console.log(err.name, err.message);
  server.close(() => {
    // If we use direct process.exit-> it will sudden close that means
    // maybe requests are currently running
    // So we use server.close, it gives some time to finish requests
    process.exit(1); // exit code 1 means uncaught exception
  });
  // Generally there is a way to restart the server.
  // But in this case app will stay in crashed.
});
