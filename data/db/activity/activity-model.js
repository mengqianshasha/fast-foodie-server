const mongoose = require('mongoose');
const schema = require('./activity-schema');
const activityModel = mongoose
  .model('ActivityModel', schema);
module.exports = activityModel;