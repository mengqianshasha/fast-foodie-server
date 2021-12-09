const mongoose = require('mongoose');
const claimSchema = mongoose.Schema({
    user: String,
    restaurant: String,
    time_created: String,
    file_url: String,
    status: {type: String, default: "unprocessed"}
}, {collection: 'claims'})

module.exports = claimSchema;