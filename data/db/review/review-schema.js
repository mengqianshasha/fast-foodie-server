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
                                             name: String,
                                             avatar_url: String,
                                             location: String,
                                             reviewNum: Number,
                                             friendNum: Number,
                                             followerNum: Number
                                         },
                                         restaurantInfo: {
                                             name: String,
                                             image_url: String,
                                             price: String,
                                             categories: String,
                                             location: String
                                         },
                                         replies: [{
                                             user: String,
                                             text: String,
                                             time_created: String
                                         }]
                                     }, {collection: 'reviews'});

module.exports = reviewSchema;