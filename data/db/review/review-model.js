const mongoose = require('mongoose');
const userSchema = require('./user-schema');
const reviewModel = mongoose
  .model('UserModel', userSchema);
module.exports = reviewModel;