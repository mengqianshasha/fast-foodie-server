const mongoose = require('mongoose');
const userSchema = require('./user-schema');
const activityModel = mongoose
  .model('UserModel', userSchema);
module.exports = activityModel;