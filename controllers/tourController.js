const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// Store the file in memory instead of disk as a buffer
const multerStorage = multer.memoryStorage();

// Filter out files that are not images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// Multer middleware to handle file uploads
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Upload different files with different names
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);

  if (!req.files.imageCover || !req.files.images) return next();

  // Delete existing images from the server
  const tour = await Tour.findById(req.params.id);
  if (
    tour.images.length > 0 &&
    fs.existsSync(`public/img/tours/${tour.images[0]}`)
  ) {
    tour.images.forEach((image) => {
      fs.unlinkSync(`public/img/tours/${image}`);
    });
  }
  if (tour.imageCover && fs.existsSync(`public/img/tours/${tour.imageCover}`)) {
    fs.unlinkSync(`public/img/tours/${tour.imageCover}`);
  }

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  //console.log(req.body);

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  //console.log(distance, lat, lng, unit);
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], // convert to number
        },
        distanceField: 'distance', // name of the field that will be created calculated distances
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        // we can use this to hide some fields
        distance: 1, // 1:show, 0:hide
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// ------------------ OLD CODE ------------------

// GET all tours
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // EXECUTE QUERY
//   // Tour and Tour.find() also correct.
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;
//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// GET tour
// exports.getTour = catchAsync(async (req, res, next) => {
//   // console.log(req.params.id);
//   // Tour.findOne({ _id: req.params.id})
//   // findById runs like above
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   // null is a falsy value in JS, so when query returns null, code below will run.
//   // tour->null->falsy --> !tour=true
//   if (!tour) {
//     // If we don't use return, code will continue and send response again.(2 times response)
//     return next(new AppError('No tour found with that ID', 404)); // where this code headed?
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

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
