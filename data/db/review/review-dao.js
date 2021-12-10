const reviewModel = require('./review-model');

const findAllReviews = () =>
    reviewModel.find();

const findAllReviewsFromNewest = () => {
    return reviewModel.find().sort({"_id": -1});
}

const findReviewById = (reviewId) =>
    reviewModel.findById(reviewId);

const findReviewByIdAsync = async (reviewId) => {
    return reviewModel.findById(reviewId);
}

const findReviewsByIdsFromNewest = (userIds) => {
    return reviewModel.find({user: {$in: userIds}}).sort({"_id": -1});
}
const findByUserIdFromNewest = (userId) =>
    reviewModel.find({"user": userId}).sort({_id: -1});

const findByRestaurantIdFromNewest = (restaurantId) =>
    reviewModel.find({"restaurant": restaurantId}).sort({_id: -1});

const findReviewsByLocationExcludeUser= (location, user) => {
    return reviewModel.find({location: location}).nor([{user: user}]).sort({"_id": -1});
}
const createReview = (review) =>
    reviewModel.create(review);

const updateReview = (id, review) =>
    reviewModel.updateOne({_id: id}, {
        $set: review
    });

const deleteReview = (reviewId) =>
    reviewModel.deleteOne({_id: reviewId});

module.exports = {
    findAllReviews, findReviewById, findReviewByIdAsync,
    findByUserIdFromNewest, findByRestaurantIdFromNewest,
    createReview, updateReview, deleteReview,
    findAllReviewsFromNewest, findReviewsByLocationExcludeUser, findReviewsByIdsFromNewest,
};