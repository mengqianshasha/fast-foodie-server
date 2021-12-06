const defaultActivities = require('../data/placeholder-data/homepage-recent-activities/allCustomerActivities.json');
const nearbyActivities = require('../data/placeholder-data/homepage-recent-activities/nearbyActivities.json');
const followingActivities = require('../data/placeholder-data/homepage-recent-activities/followingsActivities.json');

module.exports = (app) => {

    // get all activities of customers
    const getAllCustomerActivities = (req, res) => {
        res.json(defaultActivities);
    }
    app.get("/api/all_activities", getAllCustomerActivities);


    // get activities of those who are in the same city with the logged-in user
    const getNearbyCustomerActivities = (req, res) => {
        res.json(nearbyActivities);
    }
    app.get("/api/nearby_activities", getNearbyCustomerActivities);


    // get activities of logged-in user's followings
    const getFollowingCustomerActivities = (req, res) => {
        res.json(followingActivities);
    }
    app.get("/api/following_activities", getFollowingCustomerActivities);

    const getProfileTesting = (req, res) => {
        res.json({

        })
    }

    app.get("/api/testing_check_login_status", getProfileTesting);
}
