require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const RegExp = /https?:\/\/\w+\b#?/;

const bodyParser = require('body-parser');
const { Joi, celebrate, errors } = require('celebrate');
const { auth } = require('./middlewares/auth');
const users = require('./routes/users');
const cards = require('./routes/cards');
const {
  login,
  createUser,
} = require('./controllers/users');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string()
      .min(2)
      .max(30)
      .default('Жак-Ив Кусто'),
    about: Joi.string()
      .min(2)
      .max(30)
      .default('Исследователь'),
    avatar: Joi.string()
      .min(2)
      .max(30)
      .default('https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png')
      .pattern(RegExp),
    email: Joi.string().required().email(),
    password: Joi.string().min(8).required(),
  }).unknown(true),
}), createUser);

app.use('/users', auth, users);
app.use('/cards', auth, cards);

app.use(errors());

app.use((req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'что-то пошло не так' : message,
  });
  next();
});

app.listen(PORT, () => {
  console.log('Сервер запущен');
});
