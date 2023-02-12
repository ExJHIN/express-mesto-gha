const users = require('express').Router();

const {
  readUsers,
  updateUser,
  updateAvatar,
  readUsersById,
  gettingUserInfo,
} = require('../controllers/users');

users.get('/', readUsers);
users.get('/me', gettingUserInfo);
users.get('/:userId', readUsersById);

users.patch('/me', updateUser);
users.patch('/me/avatar', updateAvatar);

module.exports = users;
