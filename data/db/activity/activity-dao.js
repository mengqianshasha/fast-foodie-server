const reviewModel = require('./review-model');

const findAllReviews = () =>
    reviewModel.find();

const findReviewById = (reviewId) =>
    reviewModel.findById(reviewId);

const findByUserIdFromNewest = (userId) =>
    reviewModel.find({"user": userId}).sort({_id: -1});

const findByRestaurantIdFromNewest = (restaurantId) =>
    reviewModel.find({"restaurant": restaurantId}).sort({_id: -1});

const createReview = (review) =>
    reviewModel.create(review);

const updateReview = (review) =>
    reviewModel.updateOne({_id: review._id}, {
        $set: review
    });

const deleteReview = (reviewId) =>
    reviewModel.deleteOne({_id: reviewId});

module.exports = {
    findAllReviews, findReviewById,
    findByUserIdFromNewest, findByRestaurantIdFromNewest,
    createReview, updateReview, deleteReview
};