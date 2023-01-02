const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//const User = require('./userModel');

// Creating Mongo schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // 2nd argument will show up in error
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain characters'], // This does not work with spaces
      validate: {
        validator: function (value) {
          //return validator.isAlpha(value.split(' ').join(''));
          return validator.isAlpha(value.replace(/ /g, ''));
          // return validator.isAlpha(value.split(' ').join(''), 'tr-TR');
        },
        message: 'Tour name must only contain characters.',
      },
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // "this" only points to current doc on NEW document creation, so we cannot use on update
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON - Special type of data that we can use in MongoDB - Nested schema type
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // [longitude, latitude] - Array of numbers - Counterintuitive, generally we write latitude first
      address: String,
      description: String,
    },
    locations: [
      // Array of objects. This is a subdocument/embedded document
      // We can use this type of data for storing data that is related to each other
      // To create a subdocument we should use an array and inside of it we should define an object
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, -> in order to embedding
    guides: [
      // in order to referencing
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // This will show virtual properties in output
    toObject: { virtuals: true }, // This will show virtual properties in output
  }
);

// Indexing
// We can create indexes for fields that we use frequently in our queries
// We can create compound indexes
tourSchema.index({ price: 1, ratingsAverage: -1 }); // 1 = ascending, -1 = descending
tourSchema.index({ slug: 1 });

// Virtual properties
// These are not stored in DB
// We should add 2nd parameter to our schema
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
// This is not a real field in DB, it is a virtual field
// We can use this field to populate data from other collection
tourSchema.virtual('reviews', {
  ref: 'Review', // This is the model name
  foreignField: 'tour', // This is the field in Review model
  localField: '_id', // This is the field in Tour model
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
// We can use more than one each hook
// What is hook -> pre save hook  = middleware terminology

// tourSchema.pre('save', function (next) {
//   console.log(this); // Here this is refer to document(data)
//   next();
// });
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embedding users into tours
// tourSchema.pre('save', async function (next) {
//   // User.findByID returns a query, so map will return an array of queries and queries act like promises
//   // so we need to use Promise.all to wait for all promises to be resolved
//   const guidesPromises = this.guides.map((id) => User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) {
//   this.find({ secretTour: { $ne: true } }); // Here this a query object so we can chain all methods that we have for queries
//   next();
// });

// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// Solution for using find,findone and others start with find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.timeStart = Date.now(); // Define a new variable
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.timeStart} miliseconds!`);
  //console.log(docs);
  next();
});

tourSchema.pre('aggregate', function (docs, next) {
  console.log(this); // Here, this, aggregation object
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  console.log(this.pipeline());
  next();
});

// Creating Mongo Model based on Mongo schema
const Tour = mongoose.model('Tour', tourSchema); // Model names and variables start with Uppercase

module.exports = Tour;
