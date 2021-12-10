// NOTED: Must use the real user/review/... id in the database

const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
                                           user: String,
                                           type: String,
                                           time_created: String,
                                           bookmark: String,
                                           follower: String,
                                           review: String
                                       }, {collection: 'activities'});

module.exports = notificationSchema;