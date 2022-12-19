const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// GET
// GET all tours
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length, // When we are send multiple object, it make sense
    data: {
      tours, // ES6 enables us use this style <- tours: tours (same name)
    },
  });
});

// GET specific tour
app.get('/api/v1/tours/:id', (req, res) => {
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
});

// PATCH
app.patch('/api/v1/tours/:id', (req, res) => {
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
});

// DELETE
app.delete('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invaild ID',
    });
  }

  const updatedTours = tours.filter((el) => el.id !== tour.id);
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
});

// POST
app.post('/api/v1/tours', (req, res) => {
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
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
