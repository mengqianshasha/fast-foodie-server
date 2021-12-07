const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
                                         user: String,
                                         restaurant: String,
                                         time_created: String,
                                         rating: Number,
                                         text: String,
                                         img: [{
                                             url: String,
                                             text: String
                                         }],
                                         replies: [{
                                             user: String,
                                             text: String,
                                             time_created: String
                                         }]
                                     }, {collection: 'reviews'});

module.exports = activitySchema;