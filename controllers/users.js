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
        next(new ConflictError('email занят'));
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля. Заполните поля, в них должно быть от 2 до 30 символов'));
      }
      if (err.name === 'Bad Request') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля. Заполните поля, в них должно быть от 2 до 30 символов'));
      }
      next(err);
    });
};

// Контроллер login
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      bcrypt.compare(password, user.password);
      const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true }).send({
        message: 'Успешно добавлено',
        Token: token,
      });
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    })
    .catch(next);
};

// Все пользователи
const readUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные.'));
      }
      return next(err);
    });
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
      throw next(new NotFoundError('Пользователь по указанному _id не найден.'));
    })
    .then((user) => {
      const userData = {
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
        email: user.email,
      };
      res.status(200).send(userData);
    })
    .catch((err) => {
      if (err.name === 'NotFound') {
        return next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }

      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные при поиске пользователя.'));
      }

      return next(err);
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
    } res.status(OK).send(user);
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
    } else {
      res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
    }
  });
};

// Смена аватарки
const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      throw next(new NotFoundError('Пользователь с указанным _id не найден.'));
    })
    .then((newAvatar) => res.status(OK).send(newAvatar))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении аватара.'));
      }

      if (err.name === 'NotFound') {
        return next(new NotFoundError('Пользователь с указанным _id не найден.'));
      }

      return next(err);
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
