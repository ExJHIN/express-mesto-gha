/* eslint-disable consistent-return */
const Card = require('../models/card');

const {
  OK,
} = require('../constants');
const NotFoundError = require('../errors/notFoundError');
const BadRequestError = require('../errors/badRequestError');
const ForbiddenError = require('../errors/Forbidden');

// Создание карточки
const createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((newCard) => res.status(OK).send(newCard))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при создании карточки.'));
      }
      return next(err);
    });
};

// Удаление карточки
const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      const userId = req.user._id;
      const ownerId = card ? card.owner.toString() : null;
      if (ownerId === null) {
        return next(new NotFoundError('Карточка с указанным _id не найдена.'));
      }

      if (userId !== ownerId) {
        return next(new ForbiddenError('Данная карточка пренодлежит другому пользователю'));
      }

      return Card.findByIdAndRemove(req.params.cardId)
        .orFail(() => {
          throw new NotFoundError('Передан несуществующий _id карточки.');
        })
        .then(() => res.status(OK).send({ message: 'Карточка удалена' }))
        .catch((err) => {
          if (err.name === 'CastError') {
            return next(new BadRequestError('Переданы некорректные данные при удаление карточки.'));
          }
          return next(err);
        });
    }).catch(next);
};

// Получить все карточки
const readCards = (req, res, next) => {
  Card.find({})
    .then((card) => {
      res.status(OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные для получения карточек.'));
      }

      return next(err);
    });
};

// Лайк карточки
const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(() => {
      throw new NotFoundError('Передан несуществующий _id карточки.');
    })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные для постановки лайка.'));
      }
      next(err);
    })
    .catch(next);
};

// Удалить лайк
const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(() => {
      throw new NotFoundError('Передан несуществующий _id карточки.');
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные для удаления лайка.'));
      }

      return next(err);
    });
};

module.exports = {
  createCard,
  deleteCard,
  readCards,
  likeCard,
  dislikeCard,
};
