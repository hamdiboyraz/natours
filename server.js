const dotenv = require('dotenv');
const mongoose = require('mongoose');

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
  })
  .catch((err) => {
    console.log(`DB connection err:, ${err}`);
  });

// console.log(process.env.NODE_ENV);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
