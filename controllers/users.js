/* eslint-disable no-shadow */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  OK,
} = require('../constants');
const NotFoundError = require('../errors/notFoundError');
const BadRequestError = require('../errors/badRequestError');
const ConflictError = require('../errors/conflictError');

// Создаем пользователя
const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10).then((hashpassword) => User.create({
    name,
    about,
    avatar,
    email,
    password: hashpassword,
  })).then((user) => res.status(OK).send({
    _id: user._id,
    name,
    about,
    avatar,
    email,
  }))
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('email занят'));
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля. Заполните поля, в них должно быть от 2 до 30 символов'));
      }
      if (err.name === 'Bad Request') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля. Заполните поля, в них должно быть от 2 до 30 символов'));
      }
      return next(err);
    });
};

// Контроллер login
const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'very secret', { expiresIn: '7d' });
      res.send({ token });
    }).catch(next);
};

// Все пользователи
const readUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

// Пользователь с определенным id
const readUsersById = (req, res) => {
  User.findOne({ _id: req.params.userId })
    .orFail()
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные.' });
      } else {
        res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
      }
    });
};

// Получение информации о текущем пользователе
const gettingUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      const error = new Error('Пользователь по указанному _id не найден.');
      error.name = 'NotFound';
      throw error;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'NotFound') {
        return next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }

      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные при поиске пользователя.'));
      }

      return next;
    });
};

// Обновление данных пользователя
const updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  ).then((user) => {
    if (!user) {
      res.status(404).send({ message: 'Пользователь с указанным _id не найден.' });
      return;
    } res.status(200).send(user);
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
    } else {
      res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
    }
  });
};

// Смена аватарки
const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  ).then((user) => {
    if (!user) {
      res.status(404).send({ message: 'Пользователь с указанным _id не найден.' });
      return;
    }
    res.status(200).send(user);
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
  login,
  gettingUserInfo,
};
