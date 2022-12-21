const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

// After configuration, we require app file
const app = require('./app');

const DB = process.env.DB_URI.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

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

// Creating Mongo schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'], // 2nd argument will show up in error
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

// Creating Mongo Model based on Mongo schema
const Tour = mongoose.model('Tour', tourSchema); // Model names and variables start with Uppercase

// testTour is an instance of our Tour model // Just like class
// const testTour = new Tour({
//   name: 'The Forest Hiker',
//   rating: 4.5,
//   price: 500,
// });
const testTour = new Tour({
  name: 'The Park Camper',
  price: 598,
});

// Save our instance to our DB using save() method
// save() will return a promise so we can then consume.
testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('Error:', err);
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
