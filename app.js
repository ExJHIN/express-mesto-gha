const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const users = require('./routes/users');
const cards = require('./routes/cards');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '63de9ace6090e1f5267527f6',
  };

  next();
});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', users);
app.use('/cards', cards);
app.get('*', (res) => {
  res.status(404);
});

app.listen(PORT, () => {
  console.log('Сервер запущен');
});
