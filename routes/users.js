const users = require('express').Router();
const { Joi, celebrate, errors } = require('celebrate');

const RegExp = /https?:\W+/;

const {
  readUsers,
  updateUser,
  updateAvatar,
  readUsersById,
  gettingUserInfo,
} = require('../controllers/users');

users.get('/', readUsers);
users.get('/me', gettingUserInfo);

users.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex(),
  }),
}), readUsersById);

users.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUser);

users.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(RegExp),
  }),
}), updateAvatar);

users.use(errors());

module.exports = users;
