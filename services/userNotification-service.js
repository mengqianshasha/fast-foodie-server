const userNotificationDao = require('../data/db/notification/notification-dao')
const reviewDao = require('../data/db/review/review-dao')
const userDao = require('../data/db/user/user-dao')
const claimDao = require('../data/db/claim/claim-dao')
const moment = require('moment')

module.exports = (app) => {
    const axios = require('axios');

    const findNotificationDetail = async (newFetchedRecentNotis) => {
        let updatedRecentNotis = newFetchedRecentNotis.map(noti => noti['_doc']);

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

                // Add all details into claim and notification
                claimDetail = {
                    ...claimDetail,
                    "userDetail": userDetail,
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
        if (user === undefined) {
            res.json([]);
            return;
        }

        userNotificationDao.findNotificationByUserIdFromNewest(user['_id'].toString())
            .then(newFetchedNotis => {
                // if newFetched notifications are empty, do nothing and return the session
                if (!newFetchedNotis || newFetchedNotis.length === 0) {
                    res.json([]);
                    return;
                }

                let newFetchedRecentNotis = newFetchedNotis.length > 10 ?
                                            newFetchedNotis.slice(0, 10) : newFetchedNotis;

                findNotificationDetail(newFetchedRecentNotis)
                    .then(newNotisDetail => {
                        //console.log(newNotisDetail);
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
