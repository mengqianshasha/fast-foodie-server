 // NOTED: Must use the real user/review/... id in the database

const model = require('./activity-model');

const findAllActivitiesFromNewest = () =>
    model.find().sort({_id: -1});

const findActivityById = (activityId) =>
    model.findById(activityId);

const findActivityByUserIdFromNewest = (userId) => {
    return model.find({"user": userId}).sort({_id: -1});
}


const createActivity = (activity) =>
    model.create(activity);

const deleteActivity = (activityId) =>
    model.deleteOne({_id: reviewId});

module.exports = {
    findAllActivitiesFromNewest, findActivityById,
    findActivityByUserIdFromNewest,
    createActivity, deleteActivity
};