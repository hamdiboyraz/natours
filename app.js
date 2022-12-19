const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// 1 - MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json()); // Before this, we used to call body.parser

app.use((res, req, next) => {
  console.log('Hello from the middleware!');
  next(); // If we don't write this, we can't get response. Code will be stucked here
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // ISOString nicely formatted at date
  next();
});

const tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/dev-data/data/tours-simple.json`
  )
);

// 2 - ROUTE HANDLERS

// GET all tours
const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length, // When we are send multiple object, it make sense
    data: {
      tours, // ES6 enables us use this style <- tours: tours (same name)
    },
  });
};

// GET tour
const getTour = (req, res) => {
  //console.log(req.params);
  //const id = parseInt(req.params.id); Alternative solution for convert number
  const id = req.params.id * 1; // Simple trick that JS string*number to convert number
  const tour = tours.find((el) => el.id === id);

  // if (id>tours.length) { ... } // Another very simple solution.
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

// PATCH
const updateTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  const updatedTour = { ...tour, ...req.body };
  //const updatedTour = Object.assign(tour, req.body);
  const updatedTours = tours.map((el) =>
    el.id === updatedTour.id ? updatedTour : el
  );

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (err) => {
      res.status(200).json({
        status: 'success',
        data: {
          tours: updatedTours,
        },
      });
    }
  );
};

// DELETE
const deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invaild ID',
    });
  }

  const updatedTours = tours.filter(
    (el) => el.id !== tour.id
  );
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (err) => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};

// POST
const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1; // Give manually id
  const newTour = Object.assign({ id: newId }, req.body); // Merge two object

  tours.push(newTour); // Add our newTour to tours
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

// Instead of callback functions, create func with their specific names
// in order to organize our codes.
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
// app.post('/api/v1/tours', createTour);

// 3 - ROUTE

// Above code is not enough when change routes, so we group functions based on same URL with using route method
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// 4 - START SERVER

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
