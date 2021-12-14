const userActivityDao = require('../data/db/activity/activity-dao')
const reviewDao = require('../data/db/review/review-dao')
const userDao = require('../data/db/user/user-dao')
const moment = require('moment')

module.exports = (app) => {
    const axios = require('axios');

    const findActivityDetail = async (newFetchedActivities) => {

        let updatedRecentActs = newFetchedActivities.map(act => act['_doc']);

        // Add detail information into each activity
        let newActivities = [];
        for (let i = 0; i < updatedRecentActs.length; i++) {
            const activity = updatedRecentActs[i];

            let activityDetail = {...activity};
            /*****************************Review Activity******************************/
            if (activity.type === "review") {
                // If this activity already has detail, jump to next activity
                if (activity.reviewDetail) {
                    newActivities.push(activity);
                    continue;
                }

                let reviewDetail = {};
                try {
                    const findReviewDetail = await reviewDao.findReviewById(activity['review'])
                        .exec();
                    // exec() return a bunch of things, the object is inside '_doc' property
                    if (!findReviewDetail) {
                        await userActivityDao.deleteActivity(activity._id).exec();
                        continue;
                    }
                    reviewDetail = findReviewDetail['_doc'];
                } catch (e) {
                    console.log(e)
                }

                activityDetail = {
                    ...activityDetail,
                    "reviewDetail": reviewDetail
                }
            }
            /*****************************Follow Activity******************************/
            else if (activity.type === "follow") {
                // If this activity already has detail, jump to next activity
                if (activity.followDetail) {
                    newActivities.push(activity);
                    continue;
                }

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

            /*****************************Reply Review Activity******************************/
            else if (activity.type === "reply-review") {
                // If this activity already has detail, jump to next activity
                if (activity.reviewDetail) {
                    newActivities.push(activity);
                    continue;
                }

                let reviewDetail = {};
                try {
                    const findReviewDetail = await reviewDao.findReviewById(activity['replyReview'])
                        .exec();
                    if (!findReviewDetail) {
                        userActivityDao.deleteActivity(activity._id);
                        continue;
                    }
                    // exec() return a bunch of things, the object is inside '_doc' property
                    reviewDetail = findReviewDetail['_doc']
                } catch (e) {
                    console.log(e)
                }

                // Retrieve user data of this review
                const userId = reviewDetail['user'];
                let user = {};
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

                activityDetail = {
                    ...activityDetail,
                    "reviewDetail": reviewDetail
                }
            }
            newActivities.push(activityDetail);
        }
        return newActivities;
    }

    const userActivities = (req, res) => {
        let user = req.session['profile'];

        if (!user) {
            res.json([]);
            return;
        }

        userActivityDao.findActivityByUserIdFromNewest(user['_id'].toString())
            .then(newFetchedActivities => {
                 //console.log(newFetchedActivities);

                // if newFetched activities are empty, do nothing and return the session
                if (!newFetchedActivities || newFetchedActivities.length === 0) {
                    //console.log("return early because nothing new fetched");
                    res.json([]);
                    return;
                }
                let newFetchedRecentActs = newFetchedActivities.length > 10 ?
                                           newFetchedActivities.slice(0, 10) : newFetchedActivities;

                findActivityDetail(newFetchedRecentActs)
                    .then(newActsDetail => {
                        //console.log(newActsDetail);
                        res.json(newActsDetail);
                    })
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