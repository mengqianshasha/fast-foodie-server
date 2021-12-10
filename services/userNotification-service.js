const userNotificationDao = require('../data/db/notification/notification-dao')
const reviewDao = require('../data/db/review/review-dao')
const userDao = require('../data/db/user/user-dao')
const moment = require('moment')

module.exports = (app) => {

    const findNotificationDetail = async (notifications) => {
        if (notifications === undefined || notifications.length === 0) {
            return [];
        }

        let newNotifications = [];
        for (let i = 0; i < notifications.length; i++) {
            const notification = notifications[i];
            let notificationDetail = {...notification};

            if (notification.type === "new-follower") {
                if (notification.followerDetail) return notifications;
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
            else if (notification.type === "new-review") {
            }
        }




    }






    const userNotifications = (req, res) => {
        let notifications = req.session['userNotifications'];
/*        findNotificationDetail(notifications)
            .then(notificationsDetail => {
                req.session['userActivities'] = notificationsDetail;
                res.json(notificationsDetail);
            })*/
        res.json(notifications);
    }

    app.post('/api/notifications', userNotifications);
}
