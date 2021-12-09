const activityDao = require('../data/db/activity/activity-dao');
const moment = require('moment')

module.exports = (app) => {
    const findActivityByUserId = (userId) => {
        return activityDao.findByUserIdFromNewest()
    }







}