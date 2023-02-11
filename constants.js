const OK = 200;
const CREATED = 201;

const validUrl = /https?:\/\/(www\.)?[-a-z0-9-._~:/?#@!$&'()*+,;=]+/;

const NOT_FOUND_USER = 'Неправильные почта или пароль';
module.exports = {
  OK,
  CREATED,
  NOT_FOUND_USER,
  validUrl,
};
