const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
                                         user: String,
                                         restaurant: String,
                                         time_created: String,
                                         location: String,
                                         rating: Number,
                                         text: String,
                                         img: [{
                                             url: String,
                                             text: String
                                         }],
                                          userInfo: {
                                           username: String,
                                           avatar_url: String,
                                            location: String,
                                            reviewNum: Number,
                                            friendNum: Number,
                                          },
                                         replies: [{
                                             user: String,
                                             text: String,
                                             time_created: String
                                         }]
                                     }, {collection: 'reviews'});

module.exports = reviewSchema;