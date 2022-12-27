const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

// GET all
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

// GET
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messege: 'This route is not yet defined!',
  });
};

// PATCH
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messege: 'This route is not yet defined!',
  });
};

// DELETE
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messege: 'This route is not yet defined!',
  });
};

// POST
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messege: 'This route is not yet defined!',
  });
};
