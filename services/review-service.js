const reviewDao = require('../data/db/review/review-dao');
const moment =require('moment')

module.exports = (app) => {
  const findAllReviews = (req, res) => {
    const restaurantId = req.params.restaurantId;
    return reviewDao.findByRestaurantIdFromNewest(restaurantId).then(reviews => res.json(reviews));
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

  app.get('/api/:restaurantId/reviews', findAllReviews);
  app.post('/api/reviews', postNewReview);
  app.delete('/api/reviews/:reviewId', deleteReview);
  app.put('/api/reviews/:reviewId', saveReview);

};