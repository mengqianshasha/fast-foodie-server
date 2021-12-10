const {createClaim, findClaimByUser, findAllClaims, findClaimById, approveClaimById, denyClaimById} = require("../data/db/claim/claim-dao");
const {updateBusinessData} = require("../data/db/user/user-dao");
module.exports = (app) => {
    const claimBusiness = (req, res) => {
        createClaim(req.body)
            .then(response => {
                res.sendStatus("200");
            })
    }


    const getClaim = (req, res) => {

        const profile = req.session['profile'];
        if (profile !== undefined) {
            findClaimByUser(req.session['profile']['_id'])
                .then(response => {
                    if (response === undefined || response.length === 0) {
                        res.json({});
                    } else {
                        const claim = response[0];
                        if (claim.status === "approved") {
                            req.session['profile'] = {
                                ...req.session['profile'],
                                businessData: {
                                    ...req.session['profile']['businessData'],
                                    verified: true,
                                    restaurant: claim.restaurant,
                                }
                            }
                            req.session.save();
                        }
                        res.json(claim);
                    }

                })
        } else {
            res.json({});
        }

    }

    const getAllClaims = (req, res) => {
        findAllClaims()
            .then(response => {
                res.json(response)
            })
    }

    const getClaimById = (req, res) => {
        findClaimById(req.params['claimId'])
            .then(response => {
                res.json(response)
            })
    }

    const approveClaim = (req, res) => {
        const claim = req.body;
        approveClaimById(claim._id)
            .then(response => {
                updateBusinessData(claim.user, {
                    verified: true,
                    restaurant: claim.restaurant,
                    file_url: claim.file_url
                })
                    .then(resp => {
                        res.sendStatus(200);
                    })
            })
    }


    const denyClaim = (req, res) => {
        const claim = req.body;
        denyClaimById(claim._id)
            .then(response => {
                res.sendStatus(200)
            })
    }

    app.post('/api/claim', claimBusiness);
    app.get('/api/get_claim/:claimId', getClaimById);
    app.get('/api/get_claim', getClaim);
    app.get('/api/get_claims', getAllClaims);
    app.put('/api/approve_claim', approveClaim);
    app.put('/api/deny_claim', denyClaim)
}