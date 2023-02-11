require('dotenv').config();
const jwt = require('jsonwebtoken');

const { NOT_FOUND_USER } = require('../constants');
const AuthorizationError = require('../errors/authorizationError');

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw next(new AuthorizationError(NOT_FOUND_USER));
  }

  const token = authorization.replace('Bearer ', '');
  let payload = '';

  try {
    payload = jwt.verify(token, 'very secret');
  } catch (err) {
    throw next(new AuthorizationError(NOT_FOUND_USER));
  }

  req.user = payload;
  return next();
};

module.exports = {
  auth,
};
