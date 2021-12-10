const mongoose = require('mongoose');
const schema = require('./notification-schema');
const notificationModel = mongoose
  .model('NotificationModel', schema);
module.exports = notificationModel;