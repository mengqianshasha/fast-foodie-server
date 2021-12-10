// NOTED: Must use the real user/review/... id in the database

const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
                                           user: String,
                                           type: String,
                                           time_created: String,
                                           bookmark: String,
                                           follow: String,
                                           review: String
                                       }, {collection: 'activities'});

module.exports = activitySchema;