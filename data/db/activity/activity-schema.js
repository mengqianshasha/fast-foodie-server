const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
                                           user: String,
                                           type: String,
                                           time_created: String,
                                           bookmark: String,
                                           follow: String
                                       }, {collection: 'reviews'});
module.exports = activitySchema;