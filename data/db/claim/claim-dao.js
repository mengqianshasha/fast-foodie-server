const claimModel = require('./claim-model');

const createClaim = (params) =>
    claimModel.create(params)

const findClaimByUser = (userId) =>
    claimModel.find({user: userId}).sort({"_id": -1})

const findAllClaims = () =>
    claimModel.find().sort({"_id": -1})

const findClaimById = (claimId) =>
    claimModel.findById(claimId)


const approveClaimById = (claimId) =>
    claimModel.updateOne({"_id": claimId}, {$set: {"status": "approved"}})

const denyClaimById = (claimId) =>
    claimModel.updateOne({"_id": claimId}, {$set: {"status": "denied"}})

module.exports = {
    createClaim,
    findClaimByUser, findAllClaims, findClaimById,
    approveClaimById, denyClaimById
}