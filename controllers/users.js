/* eslint-disable no-shadow */
const User = require('../models/user');

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar }).then((user) => {
    res.status(201).send(user);
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя.' });
    } else {
      res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
    }
  });
};

const readUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

const readUsersById = (req, res) => {
  User.findOne({ _id: req.params.userId }).then((user) => {
    res.status(200).send(user);
  }).catch((err) => {
    if (err.name === 'CastError') {
      res.status(400).send({ message: 'Пользователь по указанному _id не найден.' });
    } else {
      res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
    }
  });
};

// const updateUser = (req, res) => {
//   const { name, about } = req.body;
//   User.findByIdAndUpdate(
//     req.user._id,
//     { name, about },
//     { new: true, runValidators: true },
//   ).then((user) => {
//     if (!user) {
//       res.status(404).send({ message: 'Пользователь с указанным _id не найден.' });
//       return;
//     } res.status(200).send(user);
//   }).catch((err) => {
//     if (err.name === 'ValidationError') {
//       res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
//     } else {
//       res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
//     }
//   });
// };

const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(() => {
      res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
    })
    .then((updateUser) => res.status(200).send(updateUser))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      }
      if (err.name === 'NotFound') {
        res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
      }

      return next(err);
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true },
  ).then((user) => {
    if (!user) {
      res.status(404).send({ message: 'Пользователь с указанным _id не найден.' });
      return;
    }
    res.status(201).send(user);
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
    } else {
      res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
    }
  });
};

// Экспорируем функций
module.exports = {
  createUser,
  readUsers,
  updateAvatar,
  updateUser,
  readUsersById,
};
