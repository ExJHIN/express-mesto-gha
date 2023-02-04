// const RegExp = /https?:\W+/;
const users = require('express').Router();

const {
  readUsers,
  updateUser,
  updateAvatar,
  createUser,
  readUsersById,
} = require('../controllers/users');

users.get('/', readUsers);

users.get('/:userId', readUsersById);

users.post('/', createUser);

users.patch('/me', updateUser);

users.patch('/me/avatar', updateAvatar);

module.exports = users;
