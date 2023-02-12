require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');
const { Joi, celebrate, errors } = require('celebrate');
const { auth } = require('./middlewares/auth');
const users = require('./routes/users');
const cards = require('./routes/cards');
const {
  login,
  createUser,
} = require('./controllers/users');
const NotFoundError = require('./errors/notFoundError');
const SERVER_ERROR = require('./errors/ServerError');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string(),
    email: Joi.string().required().email(),
  }),
}), createUser);

app.use('/users', auth, users);
app.use('/cards', auth, cards);

app.use(errors());

app.use(auth, (req, res, next) => {
  next(new NotFoundError('Страница по указанному маршруту не найдена'));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'что-то пошло не так' : message,
  });
  next();
});
app.use((err, req, res, next) => {
  const { statusCode = SERVER_ERROR, message } = err;

  res.status(statusCode).send({
    message: statusCode === SERVER_ERROR
      ? 'Произошла неизвестная ошибка, проверьте корректность запроса'
      : message,
  });

  return next();
});
app.listen(PORT, () => {
  console.log('Сервер запущен');
});
