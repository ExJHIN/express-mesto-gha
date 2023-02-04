const card = require('express').Router();

const {
  createCard,
  deleteCard,
  readCards,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

card.post('/', createCard);

card.delete('/:cardId', deleteCard);

card.get('/', readCards);

card.put('/:cardId/likes', likeCard);
card.delete('/:cardId/likes', dislikeCard);

// Экспортируем "роутер"
module.exports = card;
