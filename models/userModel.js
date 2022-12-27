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
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
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

const User = mongoose.model('User', userSchema);

module.exports = User;
