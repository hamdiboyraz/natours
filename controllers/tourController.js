const Tour = require('./../models/tourModel');

// GET all tours
exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY
    // 1-Filtering
    const queryObj = { ...req.query }; // Object destructuring
    const excludeFields = [
      'page',
      'sort',
      'limit',
      'fields',
    ];
    // extract excludeFields items from queryObj using foreach method and delete operator.
    // We use foreach because we don't want to get a new array
    excludeFields.forEach((el) => delete queryObj[el]);
    //console.log(queryObj);
    // 2-Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    //console.log(JSON.parse(queryStr));

    //const tours = await Tour.find(queryObj);
    // Tour.find() returns query
    // instead of using above code, we make first query then await the query.
    const query = Tour.find(JSON.parse(queryStr));
    // EXECUTE QUERY
    const tours = await query;
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// GET tour
exports.getTour = async (req, res) => {
  try {
    // Tour.findOne({ _id: req.params.id})
    // findById runs like above
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// PATCH
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, //return the modified document rather than the original
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// DELETE
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// POST
exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()
    // instead of using above, we use mongoose.create() method.
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};
