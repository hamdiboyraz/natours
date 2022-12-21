const Tour = require('./../models/tourModel');

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or pice',
    });
  }
  next();
};

// GET all tours
exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: tours.length, // When we are send multiple object, it make sense
    // data: {
    //   tours, // ES6 enables us use this style <- tours: tours (same name)
    // },
  });
};

// GET tour
exports.getTour = (req, res) => {
  //console.log(req.params);
  //const id = parseInt(req.params.id); Alternative solution for convert number
  const id = req.params.id * 1; // Simple trick that JS string*number to convert number
  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    // data: {
    //   tour,
    // },
  });
};

// PATCH
exports.updateTour = (req, res) => {
  const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);

  // const updatedTour = { ...tour, ...req.body };
  //const updatedTour = Object.assign(tour, req.body);
  // const updatedTours = tours.map((el) =>
  //   el.id === updatedTour.id ? updatedTour : el
  // );

  //   fs.writeFile(
  //     `${__dirname}/dev-data/data/tours-simple.json`,
  //     JSON.stringify(updatedTours),
  //     (err) => {
  //       res.status(200).json({
  //         status: 'success',
  //         data: {
  //           tours: updatedTours,
  //         },
  //       });
  //     }
  //   );
};

// DELETE
exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);

  // const updatedTours = tours.filter(
  //   (el) => el.id !== tour.id
  // );
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(updatedTours),
  //   (err) => {
  //     res.status(204).json({
  //       status: 'success',
  //       data: null,
  //     });
  //   }
  // );
};

// POST
exports.createTour = (req, res) => {
  // const newId = tours[tours.length - 1].id + 1; // Give manually id
  // const newTour = Object.assign({ id: newId }, req.body); // Merge two object
  // tours.push(newTour); // Add our newTour to tours
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: newTour,
  //       },
  //     });
  //   }
  // );
};
