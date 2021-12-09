const mongoose = require('mongoose');
const claimSchema = require('./claim-schema');
const claimModel = mongoose.model('ClaimModel', claimSchema);

module.exports = claimModel;
