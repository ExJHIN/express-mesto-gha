/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  OK,
  CREATED,
} = require('../constants');
const NotFoundError = require('../errors/notFoundError');
const BadRequestError = require('../errors/badRequestError');
const ConflictError = require('../errors/conflictError');
const AuthorizationError = require('../errors/authorizationError');
const { JWT_SECRET } = require('../middlewares/auth');
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
  })).then((user) => res.status(CREATED).send({
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
      next(err);
    });
};

// Контроллер login
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      } else {
        const token = jwt.sign({ _id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.send({ token });
      }
    })
    .catch(() => {
      throw new AuthorizationError('Необходима авторизация');
    })
    .catch(next);
};

// Все пользователи
const readUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(OK).send(users))
    .catch((err) => next(err));
};

// Пользователь с определенным id

const readUsersById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден.');
    })
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные при поиске пользователя.'));
      }
      return next(err);
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
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные при поиске пользователя.'));
      }

      return next(err);
    });
};

// Обновление данных пользователя
const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(() => {
      throw next(new NotFoundError('Пользователь по указанному _id не найден.'));
    })
    .then((updateUser) => res.status(OK).send(updateUser))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля.'));
      }
      return next(err);
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
