require('dotenv').config();
const jwt = require('jsonwebtoken');

const { NOT_FOUND_USER } = require('../constants');
const AuthorizationError = require('../errors/authorizationError');

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  const JWT = req.cookies.jwt;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    if (!JWT) {
      throw next(new AuthorizationError(NOT_FOUND_USER));
    }
  }
  const token = !authorization ? JWT : authorization.replace('Bearer ', '');
  let payload = '';
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw next(new AuthorizationError(NOT_FOUND_USER));
  }
  req.user = payload;
  return next();
};

module.exports = {
  auth,
};
