const claimModel = require('./claim-model');

const createClaim = (params) =>
    claimModel.create(params)

const findClaimByUser = (userId) =>
    claimModel.find({user: userId}).sort({"_id": -1})



module.exports = {
    createClaim, findClaimByUser
}