const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
  firstName: String,
  lastName: String,
  image_url: String,
  location: String,
  birthday: Date,
  dateJoined: Date,
  reviewCount: Number,
  reviews: Array,
  followersCount: Number,
  followingList: Array,  
  followersCount: Number,
  followersList: Array,
  visibility: {
      location: {type: Boolean, defaultValue: true},
      birthday: {type: Boolean, defaultValue: true},
      bookmarks: {type: Boolean, defaultValue: true}
  }
}, {collection: 'users'});

module.exports = userSchema;