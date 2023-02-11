const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const { userAuthorization } = require('./middlewares/auth');
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

app.post('/signin', login);
app.post('/signup', createUser);

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', userAuthorization, users);
app.use('/cards', userAuthorization, cards);
app.use((req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});
app.listen(PORT, () => {
  console.log('Сервер запущен');
});
