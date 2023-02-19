/* eslint-disable func-names */
require('dotenv').config();
const jwt = require('jsonwebtoken');

const { JWT_SECRET = '337fd74160df4d86dd7435ef560348417' } = process.env;

const { NOT_FOUND_USER } = require('../constants');
const AuthorizationError = require('../errors/authorizationError');

const extractBearerToken = function (header) {
  return header.replace('Bearer ', '');
};

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthorizationError(NOT_FOUND_USER));
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new AuthorizationError(NOT_FOUND_USER));
  }

  req.user = payload;
  return next();
};

module.exports = {
  auth,
  JWT_SECRET,
};
