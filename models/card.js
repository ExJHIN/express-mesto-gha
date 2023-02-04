const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  link: {
    type: String,
    validate(link) {
      const reg = /https?:\W+/;
      return reg.test(link);
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: [],
  }],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('card', cardSchema);
