const RegExp = /https?:\/\//;
const { Joi, celebrate, errors } = require('celebrate');
const card = require('express').Router();

const {
  createCard,
  deleteCard,
  readCards,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

card.get('/', readCards);

card.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required().pattern(RegExp),
  }),
}), createCard);

card.delete('/:cardId', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required().pattern(RegExp),
  }),
}), deleteCard);

card.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
}), likeCard);

card.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
}), dislikeCard);

card.use(errors());

module.exports = card;
