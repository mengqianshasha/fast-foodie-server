// NOTED: Must use the real user/review/... id in the database

const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
                                           user: String,
                                           type: String,
                                           time_created: String,
                                           bookmarks: String,
                                           follows: String,
                                           reviews: String
                                       }, {collection: 'activities'});

module.exports = activitySchema;