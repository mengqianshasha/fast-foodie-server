const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
                                       role: String,
                                       username: String,
                                       password: String,
                                       email: String,
                                       firstName: String,
                                       lastName: String,
                                       image_url: String,
                                       location: String,
                                       addressDetail: String,
                                       birthday: String,
                                       dateJoined: String,
                                       customerData: {
                                           reviews: [String],
                                           followings: [String],
                                           followers: [String],
                                           bookmarks: [String],
                                           visibility: {
                                               location: {type: Boolean, default: true},
                                               birthday: {type: Boolean, default: true},
                                               bookmarks: {type: Boolean, default: true}
                                           }
                                       },
                                       businessData: {
                                           verified: {type: Boolean, default: false},
                                           restaurant: String,
                                           file_url: String
                                       }
                                   }, {collection: 'users'});

module.exports = userSchema;