const defaultActivities = require('../data/placeholder-data/activities/allCustomerActivities.json');
const nearbyActivities = require('../data/placeholder-data/activities/nearbyActivities.json');
const followingActivities = require('../data/placeholder-data/activities/followingsActivities.json');

module.exports = (app) => {
    const getAllCustomerActivities = (req, res) => {
        res.json(defaultActivities);
    }
    app.get("/api/all_activities", getAllCustomerActivities);


    const getNearbyCustomerActivities = (req, res) => {
        res.json(nearbyActivities);
    }
    app.get("/api/nearby_activities", getNearbyCustomerActivities);

    const getFollowingCustomerActivities = (req, res) => {
        res.json(followingActivities);
    }
    app.get("/api/following_activities", getFollowingCustomerActivities);
}
