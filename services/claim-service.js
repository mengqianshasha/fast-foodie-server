const {createClaim, findClaimByUser} = require("../data/db/claim/claim-dao");
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
                    res.json(response[0]);
                })
        }

    }

    app.post('/api/claim', claimBusiness);
    app.get('/api/get_claim', getClaim)
}