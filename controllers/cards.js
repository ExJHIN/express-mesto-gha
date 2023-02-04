const Card = require('../models/card');

const {
  OK,
  CREATED,
} = require('../constants');

const createCard = (req, res) => {
  const { name, link } = req.body;
  console.log(req.user._id);
  Card.create({ name, link, owner: req.user._id })
    .then((newCard) => res.status(CREATED).send(newCard))
    .catch((err) => res.status(500).send({ message: err.message }));
};

const deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId).then((card) => {
    if (!card) {
      res.status(404).send({ message: 'Карточка не найдена.' });
      return;
    }
    res.status(200).send(card);
  }).catch((err) => res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` }));
};

const readCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((card) => {
      res.status(OK).send(card);
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
        return;
      }
      res.status(200).send(card);
    }).catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки/снятия лайка.' });
      } else {
        res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
        return;
      }
      res.send(card);
    }).catch((err) => {
      res.status(500).send({ message: `Произошла ошибка ${err.name} ${err.message}` });
    });
};

module.exports = {
  createCard,
  deleteCard,
  readCards,
  likeCard,
  dislikeCard,
};
