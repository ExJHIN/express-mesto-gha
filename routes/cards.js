const card = require('express').Router();

const {
  createCard,
  deleteCard,
  readCards,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

card.get('/', readCards);

card.post('/', createCard);

card.delete('/:cardId', deleteCard);

card.put('/:cardId/likes', likeCard);
card.delete('/:cardId/likes', dislikeCard);

module.exports = card;
