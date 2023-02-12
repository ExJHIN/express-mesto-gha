/* eslint-disable func-names */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const validUrl = '../constants';
const AuthorizationError = require('../errors/authorizationError');
const { NOT_FOUND_USER } = require('../constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: false,
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: false,
  },
  avatar: {
    type: String,
    required: false,
    validator: {
      validate: {
        match: [validUrl, 'Некорректная ссылка. Введите URL адрес '],
      },
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate(value) {
      return validator.isEmail(value);
    },
  },
  password: {
    type: String,
    select: false,
    required: true,
    minlength: 8,
  },
});

userSchema.statics.findUserByCredentials = function (email, password, next) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthorizationError(NOT_FOUND_USER);
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthorizationError(NOT_FOUND_USER);
          }
          return user;
        });
    }).catch(next);
};

module.exports = mongoose.model('user', userSchema);
