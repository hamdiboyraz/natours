const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercasse: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password; // abc === abc : true, abc === 123 : false
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  // We only want to hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // We set our password to the hashed password (encrypted version of the original password),
  // so we don't save the plain text password
  // We only want to hash the password if it has been modified (or is new)
  // Hash the password with cost of 12, default is 10
  // More cost, it means more secure, but it takes more time
  this.password = await bcrypt.hash(this.password, 12);
  // We don't want to save the passwordConfirm field to the database
  // We delete passwordConfirm field from the database
  // We don't need it anymore, we just use it to validate the password
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkPassword = async function (inputPassword) {
  // inputPassword is the password that user typed in
  // this.password is the password that is stored in the database
  // We use bcrypt.compare() to compare the inputPassword and the password stored in the database
  return await bcrypt.compare(inputPassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const pwChangedTimestamp = this.passwordChangedAt.getTime() / 1000;

    // True means changed after the token was issued (JWTTimestamp)
    return pwChangedTimestamp > JWTTimestamp;
  }

  // False means NOT changed
  // If the passwordChangedAt field is not set, it means the password has never been changed
  // So we return false
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
