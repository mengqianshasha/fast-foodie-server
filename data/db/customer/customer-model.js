const mongoose = require('mongoose');
const userSchema = require('./customer-schema');
const customerModel = mongoose
  .model('UserModel', userSchema);
module.exports = customerModel;