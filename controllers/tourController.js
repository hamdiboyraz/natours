const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// GET all tours
exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  // Tour and Tour.find() also correct.
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// GET tour
exports.getTour = catchAsync(async (req, res, next) => {
  // console.log(req.params.id);
  // Tour.findOne({ _id: req.params.id})
  // findById runs like above
  const tour = await Tour.findById(req.params.id).populate('reviews');

  // null is a falsy value in JS, so when query returns null, code below will run.
  // tour->null->falsy --> !tour=true
  if (!tour) {
    // If we don't use return, code will continue and send response again.(2 times response)
    return next(new AppError('No tour found with that ID', 404)); // where this code headed?
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// PATCH
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true, //return the modified document rather than the original
//     runValidators: true, // Validate the input data
//   });

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404)); // where this code headed?
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
exports.updateTour = factory.updateOne(Tour);

// DELETE
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404)); // where this code headed?
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
exports.deleteTour = factory.deleteOne(Tour);

// POST
// exports.createTour = catchAsync(async (req, res, next) => {
//   // const newTour = new Tour({})
//   // newTour.save()
//   // instead of using above, we use mongoose.create() method.
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });
exports.createTour = factory.createOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        //_id: null,
        //_id: '$ratingsAverage',
        //_id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // we seperate each startdates to array. Now we have 27results
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // returns the month of a date as a number between 1-12
        numToursStarts: { $sum: 1 }, // total number of tours
        tours: { $push: '$name' }, // add their names
      },
    },
    {
      $addFields: { month: '$_id' }, // basically name of the field and value
    },
    {
      $project: {
        _id: 0, // 0:hide, 1:show
      },
    },
    {
      $sort: { numToursStarts: -1 },
    },
    {
      $limit: 12, // just reference how to use
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});
