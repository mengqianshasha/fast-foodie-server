const userActivityDao = require('../data/db/activity/activity-dao')
const reviewDao = require('../data/db/review/review-dao')
const userDao = require('../data/db/user/user-dao')
const moment = require('moment')


module.exports = (app) => {
    const axios = require('axios');

    const findActivityDetail = async (activities) => {
        if (activities === undefined || activities.length === 0) {
            return [];
        }

        let newActivities = [];
        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
            let activityDetail = {...activity};

            if (activity.type === "review") {
                if (activity.reviewDetail) return activities;
                let reviewDetail = {};

                try {
                    const findReviewDetail = await reviewDao.findReviewById(activity['review']).exec();
                    // I don't know why, but the returned data is inside '_doc' property
                    reviewDetail = findReviewDetail['_doc']
                } catch (e) {
                    console.log(e)
                }

                // Retrieve user data of this review
/*                try {
                    const userId = reviewDetail['user'];
                    let user={};
                    user = await userDao.findUserById(userId).exec();
                    reviewDetail = {
                        ...reviewDetail,
                        "userDetail": {...user}
                    }
                }catch (e) {
                    console.log(e);
                }*/

                // Retrieve restaurant data of this review
                try {
                    const restaurantId = reviewDetail['restaurant'];
                    const business = await axios.get(
                        `http://api.yelp.com/v3/businesses/${restaurantId}`, {
                            headers: {
                                "Authorization": `Bearer ${process.env.YELP_API_KEY}`
                            }
                        })
                    reviewDetail = {
                        ...reviewDetail,
                        "restaurantDetail": {...business.data}
                    }
                } catch (e) {
                    console.log(e);
                }

                activityDetail = {
                    ...activityDetail,
                    "reviewDetail": reviewDetail
                }
            }
            else if (activity.type === "follow") {
                if (activity.followDetail) return activities;
                let followee = {};
                try {
                    followee = await userDao.findUserById(activity['follow']).exec();
                } catch (e) {
                    console.log(e)
                }
                activityDetail = {
                    ...activityDetail,
                    "followDetail": followee
                }
            }

            else if (activity.type === "reply-review") {
                if (activity.reviewDetail) return activities;
                let reviewDetail = {};

                try {
                    const findReviewDetail = await reviewDao.findReviewById(activity['replyReview']).exec();
                    // I don't know why, but the returned data is inside '_doc' property
                    reviewDetail = findReviewDetail['_doc']
                } catch (e) {
                    console.log(e)
                }

                // Retrieve user data of this review
                    const userId = reviewDetail['user'];
                    let user={};
                try {
                    const findUserDetail = await userDao.findUserById(userId).exec();
                    user = findUserDetail['_doc']
                    reviewDetail = {
                        ...reviewDetail,
                        "userDetail": {...user}
                    }
                } catch (e) {
                    console.log(e);
                }

                // Retrieve restaurant data of this review
/*                try {
                    const restaurantId = reviewDetail['restaurant'];
                    const business = await axios.get(
                        `http://api.yelp.com/v3/businesses/${restaurantId}`, {
                            headers: {
                                "Authorization": `Bearer ${process.env.YELP_API_KEY}`
                            }
                        })
                    reviewDetail = {
                        ...reviewDetail,
                        "restaurantDetail": {...business.data}
                    }
                } catch (e) {
                    console.log(e);
                }*/

                activityDetail = {
                    ...activityDetail,
                    "reviewDetail": reviewDetail
                }
            }

            newActivities.push(activityDetail);
        }

        return newActivities.length > 10 ? newActivities.slice(0, 10) : newActivities;
    }

    const userActivities = (req, res) => {
        let activities = req.session['userActivities'];
        findActivityDetail(activities)
            .then(activitiesDetail => {
                req.session['userActivities'] = activitiesDetail;
                res.json(activitiesDetail);
            })
    }

    const createActivity = (req, res) => {
        const newActivity = {
            ...req.body,
            "time_created": moment().format('YYYY-MM-DD HH:mm:ss')
        };
        userActivityDao.createActivity(newActivity)
            .then(insertedActivity => res.send(insertedActivity))
    }



    app.post('/api/activities', userActivities);
    app.post('/api/newActivity', createActivity);

}