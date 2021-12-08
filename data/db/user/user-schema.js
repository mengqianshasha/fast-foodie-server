const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
                                       role: String,
                                       username: String,
                                       password: String,
                                       email: String,
                                       firstName: String,
                                       lastName: String,
                                       image_url: {type: String, default: "https://as2.ftcdn.net/v2/jpg/00/64/67/63/1000_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"},
                                       location: {type: String, default: ""},
                                       addressDetail: {type: String, default: ""},
                                       birthday: {type: String, default: ""},
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
                                           restaurant: {type: String, default: ""},
                                           file_url: {type: String, default: ""}
                                       }
                                       // adminData: {
                                       //
                                       // }
                                   }, {collection: 'users'});

module.exports = userSchema;