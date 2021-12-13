const reviewDao = require('../data/db/review/review-dao');
const userDao = require('../data/db/user/user-dao');
const activityDao = require('../data/db/activity/activity-dao');
const notificationDao = require('../data/db/notification/notification-dao')
const moment = require('moment')

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
    return reviewDao.createReview(newReview).then(insertedReview =>
    { updateProfileReviews(insertedReview).then(user => {
      req.session['profile'] = user;
      userDao.updateUser(user).then(status=> console.log("user updated"))});
      const activity = {
        user: insertedReview.user,
        type: "review",
        time_created: insertedReview.time_created,
        review: insertedReview._id.toString()
      }
      activityDao.createActivity(activity);
      const notification = {
        user: insertedReview.user,
        type: "new-review",
        time_created: insertedReview.time_created,
        review: insertedReview._id.toString()
      };
      notificationDao.createNotification(notification);
      res.send(insertedReview)
    })
  }

  const deleteProfileReview = async (review) => {
    let user = {}
    const findUser = userDao.findUserById(review['user'])
    .then(res => {
      user = res;
    })
    await findUser;
    user.customerData.reviews = user.customerData.reviews.filter(id => id !== review._id.toString())
    return user
  }

  const deleteReview = (req, res) => {
    const reviewId = req.params.reviewId;
    reviewDao.deleteReview(reviewId).then(status => res.send(status));
    reviewDao.findReviewById(reviewId).then(review => deleteProfileReview(review)
        .then(user => {
          req.session['profile'] = user;
          userDao.updateUser(user)
        }))
  }


    const saveReview = (req, res) => {
        reviewDao.updateReview(req.params.reviewId, req.body).then(status => res.send(status))
    }

  const updateReply = (req, res) => {
    const newReview = req.body;
    reviewDao.updateReview(req.params.reviewId, req.body).then(status => res.send(status));
    const activity = {
      user: newReview.replies[0].user,
      type: "reply-review",
      time_created: newReview.time_created,
      review: newReview._id.toString()
    }
    activityDao.createActivity(activity);
  }


    const findAllReviewsByIdsAsync = async (reviewsId) => {
        let reviewsInfo = [];
        for (let i = 0; i < reviewsId.length; i++) {
            const reviewId = reviewsId[i];
            let reviewInfo = {};
            try {
                const findReviewInfo = await reviewDao.findReviewById(reviewId).exec();
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
            const reviewsId = req.session['profile']['customerData']['reviews'];
            /*console.log(reviewsId);*/
            findAllReviewsByIdsAsync(reviewsId)
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
                findAllReviewsByIdsAsync(user.customerData.reviews)
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