const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// We basically want to filter out the fields that are not allowed to be updated
// Create new object with only the allowed fields with the same values as the original object
// And return the new object
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /changePassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated such as role
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  // We don't want to delete the user from the database, we just want to deactivate the account
  // 204 status code means that the request was successful but there is no content to send back
  // 204: No Content
  res.status(204).json({
    status: 'success',
    data: null,
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
