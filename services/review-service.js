const reviewDao = require('../data/db/review/review-dao');
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

    const postNewReview = (req, res) => {
        const newReview = req.body;
        return reviewDao.createReview(newReview).then(insertedReview => res.send(insertedReview))

    }

    const deleteReview = (req, res) => {
        const reviewId = req.params.reviewId;
        reviewDao.deleteReview(reviewId).then(status => res.send(status));
    }

    const saveReview = (req, res) => {
        reviewDao.updateReview(req.params.reviewId, req.body).then(status => res.send(status))
    }

    const updateReply = (req, res) => {
        reviewDao.updateReview(req.params.reviewId, req.body).then(status => res.send(status))
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
        const reviewsId = req.session['profile']['customerData']['reviews'];
        /*console.log(reviewsId);*/
        findAllReviewsByIdsAsync(reviewsId)
            .then(reviewsInfo => {
                /*console.log(reviewsInfo);*/
                res.json(reviewsInfo);
            })
    }

    const findAllReviewsByUserId = (req, res) => {

    }

    app.get('/api/:restaurantId/reviews', findAllReviews);
    app.post('/api/reviews', postNewReview);
    app.delete('/api/reviews/:reviewId', deleteReview);
    app.put('/api/reviews/:reviewId', saveReview);
    app.put('/api/reviews/:reviewId/reply', updateReply);
    app.post('/api/profileReviews', findAllReviewsByProfile);
    app.post('/api/profileReviews/:userId', findAllReviewsByUserId);
};