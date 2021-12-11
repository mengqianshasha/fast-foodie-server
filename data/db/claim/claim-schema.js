const mongoose = require('mongoose');
const claimSchema = mongoose.Schema({
                                            user: String,
                                            restaurant: String,
                                            time_created: String,
                                            file_url: String,
                                            status: {type: String, default: "unprocessed"},
                                            restaurantName: String,
                                            userName: String
}, {collection: 'claims'})

module.exports = claimSchema;