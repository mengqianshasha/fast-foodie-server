const defaultActivities = require('../data/placeholder-data/homepage-recent-activities/allCustomerActivities.json');
const nearbyActivities = require('../data/placeholder-data/homepage-recent-activities/nearbyActivities.json');
const followingActivities = require('../data/placeholder-data/homepage-recent-activities/followingsActivities.json');
const review1111 = require('../data/placeholder-data/homepage-recent-activities/reviews/review1111.json');
const review2221 = require('../data/placeholder-data/homepage-recent-activities/reviews/review2221.json');
const user111 = require('../data/placeholder-data/homepage-recent-activities/users/user111.json');
const {getYelpDetail} = require("../data/api/yelp-api");
const {findUserById, addToFollowings} = require("../data/db/user/user-dao");
const {
    findAllReviewsFromNewest,
    findReviewsByLocationExcludeUser,
    findReviewsByIdsFromNewest
} = require("../data/db/review/review-dao");

module.exports = (app) => {
    const user444 = "61b01f33c0b7b9b715b07b11";
    const user333 = "61b01b5da49c6aa973522eab";


    const transformReviews = async (reviews) => {

        let result = [];
        if (reviews === undefined || reviews.length === 0){
            return [];
        }

        for (let review of reviews) {
            // user
            let user = {};
            const findUser = findUserById(review['user'])
                .then(res => {
                    user = res;
                })

            // restaurant
            let restaurant = {};
            const findRestaurant = getYelpDetail(review['restaurant'])
                .then(res => {
                    restaurant = res.data;
                })

            // transformation
            await findUser;
            await findRestaurant;
            result.push({
                type: "review",
                user: {
                    _id: user['_id'],
                    name: user['firstName'] + ' ' + user['lastName'],
                    img_url: user['image_url']
                },
                restaurant: {
                    _id: review['restaurant'],
                    name: restaurant['name'],
                    img_url: restaurant['image_url']
                },
                review: {
                    _id: review['_id'],
                    text: review['text'],
                    rating: review['rating'],
                    photo_url: ("img" in review && review['img'].length !== 0) ? review['img'][0]['url'] : ''
                }
            })
        }
        return result;
    };

    // get all activities of customers
    const getAllCustomerActivities = (req, res) => {
        findAllReviewsFromNewest()
            .then(reviews => {
                transformReviews(reviews)
                    .then(response => {
                        res.json(response)
                    })
            })
    }


// get activities of those who are in the same city with the logged-in user
    const getNearbyCustomerActivities = (req, res) => {
        const user = req.session['profile'];
        if (user === undefined) {
            res.json({});
        } else {
            findReviewsByLocationExcludeUser(user.location, user._id)
                .then(reviews => {
                    transformReviews(reviews)
                        .then(result => {
                            res.json(result);
                        })
                })
        }

    }


// get activities of logged-in user's followings
    const getFollowingCustomerActivities = (req, res) => {
        const user = req.session['profile'];
        if (user === undefined || Object.keys(user).length === 0) {
            res.json({});
        }
        findReviewsByIdsFromNewest(user.customerData['followings'])
            .then(reviews => {
                transformReviews(reviews)
                    .then(result => {
                        res.json(result);
                    })
            })
    }

app.get("/api/activities/all", getAllCustomerActivities);
app.get("/api/activities/nearby", getNearbyCustomerActivities);
app.get("/api/activities/following", getFollowingCustomerActivities);


}
