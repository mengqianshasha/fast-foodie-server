 // NOTED: Must use the real user/review/... id in the database

const model = require('./notification-model');

const findAllNotificationsFromNewest = () =>
    model.find().sort({_id: -1});

const findNotificationById = (notificationId) =>
    model.findById(notificationId);

const findNotificationByUserIdFromNewest = (userId) => {
    return model.find({"user": userId}).sort({_id: -1});
}

const createNotification = (notification) =>
    model.create(notification);

const deleteNotification = (notificationId) =>
    model.deleteOne({_id: notificationId});

module.exports = {
    findAllNotificationsFromNewest, findNotificationById,
    findNotificationByUserIdFromNewest,
    createNotification, deleteNotification
};