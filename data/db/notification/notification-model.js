const mongoose = require('mongoose');
const schema = require('./activity-schema');
const notificationModel = mongoose
  .model('ActivityModel', schema);
module.exports = notificationModel;