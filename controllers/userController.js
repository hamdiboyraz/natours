const multer = require('multer');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// Specify the destination and filename for the uploaded file
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    // user-userId-timestamp.jpeg
    // user-5e8f4cb0b0b-20200420.jpeg
    const ext = file.mimetype.split('/')[1]; // jpeg
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

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

// Upload a single file with the name 'photo'
exports.uploadUserPhoto = upload.single('photo');

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

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

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
  if (req.file) filteredBody.photo = req.file.filename;

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

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do NOT update passwords with this! (Because of findByIdAndUpdate)
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// POST
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messege: 'This route is not yet defined! Please use /signup instead',
  });
};
