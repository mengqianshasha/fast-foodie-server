const {
    createClaim,
    findClaimByUser,
    findAllClaims,
    findClaimById,
    approveClaimById,
    denyClaimById
} = require("../data/db/claim/claim-dao");
const {updateBusinessData, findUsersByRestaurant} = require("../data/db/user/user-dao");
const {createNotification} = require("../data/db/notification/notification-dao");
const {getYelpDetail} = require("../data/api/yelp-api");
module.exports = (app) => {

    const claimBusiness = (req, res) => {
        const claim = req.body;

        // get restaurant
        getYelpDetail(claim.restaurant)
            .then(restaurantData => {
                const restaurant = restaurantData.data;

                // create claim
                const newClaim = {
                    ...claim,
                    restaurantInfo: {
                        name: restaurant.name,
                        image_url: restaurant.image_url,
                        price: restaurant.price,
                        categories: restaurant.categories.map(category => category.title)
                            .reduce((prev, curr) => [prev, ', ', curr]),
                        location: restaurant.location['display_address'].map(addr => addr).join(', ')
                    }
                }
                createClaim(newClaim)
                    .then(response => {
                        createNotification({
                            user: "61b27099141351ab03bf256a",
                            type: "new-claim",
                            time_created: claim.time_created,
                            claim: response._id
                        })
                            .then(noti => {
                                res.sendStatus("200");
                            })
                    })
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

    const checkRestaurantClaimStatus = (req, res) => {
        findUsersByRestaurant(req.params['restaurantId'])
            .then(users => {
                if (users && users.length !== 0) {
                    res.send('yes');
                } else {
                    res.send('no');
                }
            })
    }
    app.post('/api/claim', claimBusiness);
    app.get('/api/get_claim/:claimId', getClaimById);
    app.get('/api/get_claim', getClaim);
    app.get('/api/get_claims', getAllClaims);
    app.put('/api/approve_claim', approveClaim);
    app.put('/api/deny_claim', denyClaim);
    app.get('/api/restaurant_claim_status/:restaurantId', checkRestaurantClaimStatus)
}