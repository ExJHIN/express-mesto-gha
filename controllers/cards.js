const Card = require('../models/card');

const {
  OK,
} = require('../constants');
const NotFoundError = require('../errors/notFoundError');
const BadRequestError = require('../errors/badRequestError');
const ForbiddenError = require('../errors/Forbidden');

// Создание карточки
const createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((newCard) => res.status(OK).send(newCard))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
      }
    });
};

// Удаление карточки
const deleteCard = (req, res, next) => {
  const owner = req.user._id;
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Передан несуществующий _id карточки');
      } else if (!card.owner.equals(owner)) {
        throw new ForbiddenError('Вы можете удалять только созданные вами карточки');
      } else {
        card.remove().then(() => res.send(card));
      }
    }).catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для удаления карточки.'));
      } else {
        res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
      }
    });
};

// Получить все карточки
const readCards = (req, res) => {
  Card.find({})
    .then((card) => {
      res.status(OK).send(card);
    })
    .catch((err) => {
      res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
    });
};

// Лайк карточки
const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
        return;
      }
      res.status(200).send(card);
    }).catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятия лайка.' });
      } else {
        res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
      }
    });
};

// Удалить лайк
const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
        return;
      }
      res.send(card);
    }).catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятия лайка.' });
      } else {
        res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
      }
    });
};

module.exports = {
  createCard,
  deleteCard,
  readCards,
  likeCard,
  dislikeCard,
};
