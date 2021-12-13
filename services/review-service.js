const reviewDao = require('../data/db/review/review-dao');
const userDao = require('../data/db/user/user-dao');
const activityDao = require('../data/db/activity/activity-dao');
const notificationDao = require('../data/db/notification/notification-dao')
const moment = require('moment')
const {findUsersByRestaurant} = require("../data/db/user/user-dao");
const {createNotification} = require("../data/db/notification/notification-dao");

module.exports = (app) => {
    const axios = require('axios');

    const findAllReviews = (req, res) => {
        const restaurantId = req.params.restaurantId;
        /*console.log(restaurantId);*/
        return reviewDao.findByRestaurantIdFromNewest(restaurantId)
            .then(reviews => {
                /*console.log(reviews);*/
                res.json(reviews);
            });
    }

    const updateProfileReviews = async (review) => {
        let user = {}
        const findUser = userDao.findUserById(review['user'])
            .then(res => {
                user = res;
            })
        await findUser;
        user.customerData.reviews.push(review._id.toString())
        return user
    }

    const postNewReview = (req, res) => {
        const newReview = req.body;
        return reviewDao.createReview(newReview).then(insertedReview => {
            updateProfileReviews(insertedReview).then(user => {
                req.session['profile'] = user;
                req.session.save();
                userDao.updateUser(user)
                    .then(status => console.log("user updated"))
            });
            const activity = {
                user: insertedReview.user,
                type: "review",
                time_created: insertedReview.time_created,
                review: insertedReview._id.toString()
            }

            activityDao.createActivityAsync(activity)
                .then(r => console.log("activity created!"));

            findUsersByRestaurant(newReview.restaurant)
                .then(businessOwners => {
                    if (businessOwners && businessOwners.length !== 0) {
                        businessOwners.map(businessOwner => {
                            const notification = {
                                user: businessOwner._id.toString(),
                                type: "new-review",
                                time_created: insertedReview.time_created,
                                review: insertedReview._id.toString()
                            };
                            createNotification(notification);
                        })
                    }
                })

            res.send(insertedReview)
        })
    }

    const deleteProfileReview = async (review) => {
        /*console.log("This is the deleted review");
        console.log(review);*/

        let user = {};
        const findUser = userDao.findUserById(review['user'])
            .then(res => {
                user = res;

                /*console.log("This is the user deleting their review");
                console.log(user);*/
            })
        await findUser;
        user.customerData.reviews =
            user.customerData.reviews.filter(id => id !== review._id.toString())

        /*console.log("This is the user deleting reviewId from their list");
        console.log(user);*/

        return user;
    }

    const deleteActivitySessionReview = async (reviewId, activities) => {
        return activities.filter(act => (act.review && act.review !== reviewId) ||
                                        (act.replyReview && act.replyReview !== reviewId) ||
                                        (!act.review && !act.replyReview));
    }

    const deleteNotificationSessionReview = async (reviewId, notifications) => {
        return notifications.filter(notif => (notif.review && notif.review !== reviewId) ||
                                             !notif.review);
    }

    const deleteReview = (req, res) => {
        const reviewId = req.params.reviewId;
        reviewDao.findReviewById(reviewId)
            .then(review =>
                      deleteProfileReview(review)
                          .then(user => {
                              /****************Update Profile Session***************/
                              req.session['profile'] = user;
                              req.session.save();
                              userDao.updateUser(user)
                                  .then(status => {
                                      console.log("user updated");

                                      /********Update Activities and Notifications Session*********/
                                      let activitySession = req.session['userActivities'];
                                      let newActivitySession;
                                      deleteActivitySessionReview(reviewId, activitySession)
                                              .then(res => newActivitySession = res);
                                      req.session['userActivities'] = newActivitySession;
                                      req.session.save();

                                      let notificationSession = req.session['userNotifications'];
                                      let newNotificationSession;
                                      deleteNotificationSessionReview(reviewId,
                                                                      notificationSession)
                                           .then(res => newNotificationSession = res);
                                      console.log("After deleting review, this is the new notification session");
                                      console.log(newNotificationSession);
                                      req.session['userNotifications'] = newNotificationSession;
                                      req.session.save();
                                  })
                          })
            )
        reviewDao.deleteReview(reviewId)
            .then(status => res.send(status));
    }

    const saveReview = (req, res) => {
        reviewDao.updateReview(req.params.reviewId, req.body)
            .then(status => res.send(status))
    }

    const updateReply = (req, res) => {
        const newReview = req.body;
        const currentReview = reviewDao.findReviewByIdAsync(req.params.reviewId);
        reviewDao.updateReview(req.params.reviewId, req.body)
            .then(status => {
                console.log("DB update reply review!")
                res.send(status);
            });

        /*if (currentReview.replies.length !== 0 || currentReview.replies[0]['user'] !== "") {*/
            const activity = {
                user: newReview.replies[0].user,
                type: "reply-review",
                time_created: newReview.time_created,
                replyReview: newReview._id.toString()
            }
            activityDao.createActivityAsync(activity)
                .then(r => console.log("Reply activity created!"));
        /*}*/


    }

    const findAllReviewsByIdsAsync = async (reviewsId, userId) => {
        let reviewsInfo = [];
        for (let i = 0; i < reviewsId.length; i++) {
            const reviewId = reviewsId[i];
            let reviewInfo = {};
            try {
                const findReviewInfo = await reviewDao.findReviewById(reviewId).exec();
                if (!findReviewInfo) {
                    await userDao.deleteReviewOfUser(userId, reviewId);
                    continue;
                }
                reviewInfo = findReviewInfo['_doc'];
            } catch (e) {
                console.log(e)
            }
            // Retrieve restaurant data of this review
            try {
                const restaurantId = reviewInfo['restaurant'];
                const business = await axios.get(
                    `http://api.yelp.com/v3/businesses/${restaurantId}`, {
                        headers: {
                            "Authorization": `Bearer ${process.env.YELP_API_KEY}`
                        }
                    })
                reviewInfo = {
                    ...reviewInfo,
                    "restaurantDetail": {...business.data}
                }
            } catch (e) {
                console.log(e);
            }
            reviewsInfo.push(reviewInfo);
        }
        return reviewsInfo;
    }

    const findAllReviewsByProfile = (req, res) => {
        if (req.session['profile']) {
            const userId = req.session['profile']._id;
            const reviewsId = req.session['profile']['customerData']['reviews'];
            /*console.log(reviewsId);*/
            findAllReviewsByIdsAsync(reviewsId, userId)
                .then(reviewsInfo => {
                    /*console.log(reviewsInfo);*/
                    res.json(reviewsInfo);
                })
        } else {
            res.json([]);
        }

    }

    const findAllReviewsByUserId = (req, res) => {
        const userId = req.params.userId;
        userDao.findUserById(userId)
            .then(user => {
                findAllReviewsByIdsAsync(user.customerData.reviews, userId)
                    .then(reviewsInfo => {
                        /*console.log(reviewsInfo);*/
                        res.json(reviewsInfo);
                    })
            })
    }

    app.get('/api/:restaurantId/reviews', findAllReviews);
    app.post('/api/reviews', postNewReview);
    app.delete('/api/reviews/:reviewId', deleteReview);
    app.put('/api/reviews/:reviewId', saveReview);
    app.put('/api/reviews/:reviewId/reply', updateReply);
    app.post('/api/profileReviews', findAllReviewsByProfile);
    app.post('/api/profileReviews/:userId', findAllReviewsByUserId);
};