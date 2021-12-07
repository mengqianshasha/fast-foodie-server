const defaultActivities = require('../data/placeholder-data/homepage-recent-activities/allCustomerActivities.json');
const nearbyActivities = require('../data/placeholder-data/homepage-recent-activities/nearbyActivities.json');
const followingActivities = require('../data/placeholder-data/homepage-recent-activities/followingsActivities.json');

module.exports = (app) => {

    // get all activities of customers
    const getAllCustomerActivities = (req, res) => {
        res.json(defaultActivities);
    }


    // get activities of those who are in the same city with the logged-in user
    const getNearbyCustomerActivities = (req, res) => {
        res.json(nearbyActivities);
    }


    // get activities of logged-in user's followings
    const getFollowingCustomerActivities = (req, res) => {
        res.json(followingActivities);
    }



    app.get("/api/activities/all", getAllCustomerActivities);
    app.get("/api/activities/nearby", getNearbyCustomerActivities);
    app.get("/api/activities/following", getFollowingCustomerActivities);


}
