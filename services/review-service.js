const reviewDao = require('../data/db/review/review-dao');
const userDao = require('../data/db/user/user-dao');
const activityDao = require('../data/db/activity/activity-dao');
const notificationDao = require('../data/db/notification/notification-dao')
const moment = require('moment')
const {findUsersByRestaurant} = require("../data/db/user/user-dao");
const {createNotification} = require("../data/db/notification/notification-dao");

module.exports = (app) => {

    const findAllReviews = (req, res) => {
        const restaurantId = req.params.restaurantId;
        return reviewDao.findByRestaurantIdFromNewest(restaurantId)
            .then(reviews => {
                //console.log(reviews);
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
        console.log("This is the deleted review");
        console.log(review);
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

        console.log("This is the user deleting reviewId from their list");
        console.log(user);

        return user;
    }

    const deleteReview = (req, res) => {
        const reviewId = req.params.reviewId;
        reviewDao.findReviewById(reviewId)
            .then(review => {
                const reviewId = review._id.toString();
                const currentUser = req.session['profile'];
                let newUserReviews = currentUser.customerData.reviews.filter(
                    review => review !== reviewId);
                let newUser = {
                    ...currentUser,
                    "customerData": {
                        ...currentUser.customerData,
                        "reviews": newUserReviews
                    }
                };
                userDao.updateUserAsync(newUser)
                    .then(r => {
                              req.session['profile'] = newUser;
                              reviewDao.deleteReview(reviewId)
                                  .then(status => res.send(status));
                          }
                    )
            });
    }

    const saveReview = (req, res) => {
        reviewDao.updateReview(req.params.reviewId, req.body)
            .then(status => {
                res.send(status);
            })
    }

    const updateReply = (req, res) => {
        const newReview = req.body;
        const currentReview = reviewDao.findReviewByIdAsync(req.params.reviewId);
        reviewDao.updateReview(req.params.reviewId, req.body)
            .then(status => {
                console.log("DB update reply review!")
                res.send(status);
            });

        /************create a reply activity*************************/
        const activity = {
            user: newReview.replies[0].user,
            type: "reply-review",
            time_created: newReview.time_created,
            replyReview: newReview._id.toString()
        }
        activityDao.createActivityAsync(activity)
            .then(r => console.log("Reply activity created!"));
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
            reviewsInfo.push(reviewInfo);
        }
        return reviewsInfo;
    }

    const findAllReviewsByProfile = (req, res) => {
        if (req.session['profile']) {
            const userId = req.session['profile']._id;
            const reviewsId = req.session['profile']['customerData']['reviews'];
            const orderedReviewsId = reviewsId.sort().reverse();
            //console.log(orderedReviewsId);
            findAllReviewsByIdsAsync(orderedReviewsId, userId)
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
                const orderedReviewsId = user.customerData.reviews.sort().reverse();
                findAllReviewsByIdsAsync(orderedReviewsId, userId)
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