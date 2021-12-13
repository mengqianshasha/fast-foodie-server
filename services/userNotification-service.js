const userNotificationDao = require('../data/db/notification/notification-dao')
const reviewDao = require('../data/db/review/review-dao')
const userDao = require('../data/db/user/user-dao')
const claimDao = require('../data/db/claim/claim-dao')
const moment = require('moment')

module.exports = (app) => {
    const axios = require('axios');

    const findNotificationDetail = async (notifications, newFetchedRecentNotis) => {
        let updatedRecentNotis;
        // if the session doesn't have detail information
        if (notifications.length === 0 || !notifications[0] ||
            (!notifications[0]['reviewDetail'] &&
             !notifications[0]['followerDetail'] &&
            !notifications[0]['claimDetail'])
        ) {
            updatedRecentNotis = newFetchedRecentNotis.map(noti => noti['_doc']);
        }
        // Combine new fetched activities with previous activities
    else
        {
            const currentNotisId = notifications.map(noti => noti['_id'].toString());
            let actualNewNotis = newFetchedRecentNotis.filter(newNoti =>
                                                                  !currentNotisId.includes(
                                                                      newNoti['_doc']['_id'].toString()));
            actualNewNotis = actualNewNotis.map(noti => noti['_doc']);
            let updatedNotis = [...actualNewNotis, ...notifications];
            updatedRecentNotis =
                updatedNotis.length > 10 ? updatedNotis.slice(0, 10) : updatedNotis;
        }

        let newNotifications = [];
        for (let i = 0; i < updatedRecentNotis.length; i++) {
            const notification = updatedRecentNotis[i];

            let notificationDetail = {...notification};
            /*****************************New Follower******************************/
            if (notification.type === "new-follower") {
                // If this notification already has detail, jump to next notification
                if (notification.followerDetail) {
                    newNotifications.push(notification);
                    continue;
                }

                let followerDetail = {};
                try {
                    followerDetail = await userDao.findUserById(notification['follower']).exec();
                } catch (e) {
                    console.log(e);
                }
                notificationDetail = {
                    ...notificationDetail,
                    "followerDetail": followerDetail
                }
            }

            /*****************************New Review for Restaurant******************************/
            else if (notification.type === "new-review") {
                // If this notification already has detail, jump to next notification
                if (notification.reviewDetail) {
                    newNotifications.push(notification);
                    continue;
                }

                let reviewDetail = {};
                try {
                    const findReviewDetail = await reviewDao.findReviewById(notification['review'])
                        .exec();
                    // exec() return a bunch of things, the returned data is inside '_doc' property
                    if (!findReviewDetail) {
                        await userNotificationDao.deleteNotification(notification._id).exec();
                        continue;
                    }
                    reviewDetail = findReviewDetail['_doc']
                } catch (e) {
                    console.log(e)
                }

                let userDetail = {};
                try {
                    userDetail = await userDao.findUserById(reviewDetail['user']).exec();
                } catch (e) {
                    console.log(e);
                }

                reviewDetail = {
                    ...reviewDetail,
                    "userDetail": userDetail
                }
                notificationDetail = {
                    ...notificationDetail,
                    "reviewDetail": reviewDetail
                }
            }

            /*****************************New Claim******************************/
            else if (notification.type === "new-claim") {
                // If this notification already has detail, jump to next notification
                if (notification.userDetail) {
                    newNotifications.push(notification);
                    continue;
                }

                let claimDetail = {};
                try {
                    const findClaimDetail = await claimDao.findClaimById(notification['claim'])
                        .exec();
                    claimDetail = findClaimDetail['_doc'];
                } catch (e) {
                    console.log(e);
                }

                // retrieve user data of this claim
                let userDetail = {};
                try {
                    userDetail = await userDao.findUserById(claimDetail['user']).exec();
                } catch (e) {
                    console.log(e);
                }

                //retrieve restaurant data of this claim
                let restaurantDetail = {};
                try {
                    const restaurantId = claimDetail['restaurant'];
                    const business = await axios.get(
                        `http://api.yelp.com/v3/businesses/${restaurantId}`, {
                            headers: {
                                "Authorization": `Bearer ${process.env.YELP_API_KEY}`
                            }
                        })
                    /*console.log("Retrieved business data");
                    console.log(business.data);*/
                    restaurantDetail = {...business.data}
                } catch (e) {
                    console.log(e);
                }

                // Add all details into claim and notification
                claimDetail = {
                    ...claimDetail,
                    "userDetail": userDetail,
                    "restaurantDetail": restaurantDetail
                }
                notificationDetail = {
                    ...notificationDetail,
                    "claimDetail": claimDetail
                }
            }

            newNotifications.push(notificationDetail);
        }
        return newNotifications;
    }

    const userNotifications = (req, res) => {
        let user = req.session['profile']
        let notifications = req.session['userNotifications'];

        if (user === undefined || notifications === undefined ||user['_id'] === undefined) {
            res.json([]);
            return;
        }

        userNotificationDao.findNotificationByUserIdFromNewest(user['_id'].toString())
            .then(newFetchedNotis => {
                // if newFetched notifications are empty, do nothing and return the session
                if (newFetchedNotis.length === 0) {
                    res.json(notifications);
                    return;
                }

                // if newFetched is the same as the one in session, and the session has detail
                // information Do nothing and return the session
                if (notifications.length !== 0 && notifications[0]
                    && notifications[0]['_id'].toString() === newFetchedNotis[0]['_id'].toString()
                    && (notifications[0]['reviewDetail'] ||
                        notifications[0]['followerDetail'] ||
                        notifications[0]['claimDetail'])) {
                    res.json(notifications);
                    return;
                }

                let newFetchedRecentNotis = newFetchedNotis.length > 10 ?
                                            newFetchedNotis.slice(0, 10) : newFetchedNotis;

                findNotificationDetail(notifications, newFetchedRecentNotis)
                    .then(newNotisDetail => {
                        //console.log(newNotisDetail);

                        req.session['userNotifications'] = newNotisDetail;
                        res.json(newNotisDetail);
                    })
            })
    }

    const createNotification = (req, res) => {
        const newNotification = {
            ...req.body,
            "time_created": moment().format('YYYY-MM-DD HH:mm:ss')
        };
        userNotificationDao.createNotification(newNotification)
            .then(insertedNotification => res.send(insertedNotification))
    }

    app.post('/api/notifications', userNotifications);
    app.post('/api/newNotification', createNotification);
}
