const userDao = require('../data/db/user/user-dao');
const userActivityDao = require('../data/db/activity/activity-dao')
const userNotificationDao = require('../data/db/notification/notification-dao')
const moment = require('moment')

const {addToFollowings, addToFollowers, deleteFromFollowings, deleteFromFollowers} = require(
    "../data/db/user/user-dao");
const {getYelpDetail} = require("../data/api/yelp-api");
const {log_axios_error} = require("../utils/error-logger");

module.exports = (app) => {
    const axios = require('axios');

    const findAllUsers = (req, res) =>
        userDao.findAllUsers()
            .then(users => res.json(users));

    const findUserById = (req, res) => {
        userDao.findUserById(req.params['userId'])
            .then(user => {
                res.json(user)
            })
    }

    const deleteUser = (req, res) =>
        userDao.deleteUser(req.params.userId)
            .then(status => req.send(status));

    const updateUser = (req, res) => {
            const newUser = req.body;
            if (newUser.role !== "business") {
                userDao.updateUser(newUser)
                    .then(status => {
                        req.session['profile'] = req.body;
                        res.send(status);
                    })
            } else {
                const newBusinessUser = {
                    ...newUser,
                    "businessData": {
                        ...newUser.businessData,
                        "restaurant": newUser.businessData.restaurant.id
                    }
                }
                userDao.updateUser(newBusinessUser)
                    .then(status => {
                        req.session['profile'] = newUser;
                        res.send(status);
                    })
            }
        };

    // TODO: Add notifications, activities, reviews, bookmarks into profile later
    const login = (req, res) => {
        userDao.findByUsernameAndPassword(req.body)
            .then(user => {
                if (user) {
                    req.session['profile'] = user;

                    // Attach user-activities list to session
                    userActivityDao.findActivityByUserIdFromNewest((user['_id']).toString())
                        .then(activities => {
                            if (activities) {
                                req.session['userActivities'] = activities.length > 10
                                                                ? activities.slice(0, 10)
                                                                : activities;
                            } else {
                                req.session['userActivities'] = [];
                            }
                        })

                        // Attach user-notifications list to session
                        .then(status => {
                            userNotificationDao.findNotificationByUserIdFromNewest(
                                user['_id'].toString())
                                .then(
                                    notifications => {
                                        if (notifications) {
                                            req.session['userNotifications'] =
                                                notifications.length > 10
                                                ? notifications.slice(0, 10) : notifications;
                                        } else {
                                            req.session['userNotifications'] = [];
                                        }
                                        res.json(user);
                                    }
                                )
                        })
                } else {
                    res.sendStatus(403);
                }
            })
    }

    const getSession = (req, res) => {
        res.send(req.session);
    }

    const verifyUsername = (req, res) => {
        userDao.findByUsername(req.body)
            .then(user => {
                if (user) {
                    res.sendStatus(404);
                } else {
                    res.sendStatus(200);
                }
            })
    }

    const register = (req, res) => {
        userDao.findByUsername(req.body)
            .then(user => {
                if (user) {
                    res.sendStatus(404);
                    return;
                }

                let newUser = req.body;
                newUser = {
                    ...newUser,
                    "dateJoined": moment().format("YYYY-MM-DD"),
                }

                userDao.createUser(newUser)
                    .then(user => {
                        req.session['profile'] = user;
                        res.json(user) // Not necessary, could be status 200
                    });
            })
    }

    const profile = (req, res) => {
        let profile = req.session['profile'];

        /**********************************Business owner*********************************/
        if (profile !== undefined && profile.role === "business") {
            // If restaurant already stored in session, or user is unverified
            if (profile.businessData.restaurant.name || !profile.businessData.verified) {
                res.json(profile);
            }
            // If first query business profile, fetch the restaurant JSON
            else {
                const restaurantId = profile.businessData.restaurant;
                getYelpDetail(restaurantId).then(business => {
                    profile = {
                        ...profile,
                        "businessData": {
                            ...profile.businessData,
                            "restaurant": {...business.data}
                        }
                    };
                    req.session['profile'] = profile;
                    res.json(profile);
                }).catch(e => {
                    log_axios_error(e);
                    profile = {
                        ...profile,
                        "businessData": {
                            ...profile.businessData,
                            "restaurant": {"id": restaurantId}
                        }
                    };
                    req.session['profile'] = profile;
                    res.json(profile);
                })
            }
        }
        /**********************************Other User*********************************/
        else {
            res.json(profile);
        }
    }

    const admin = (req, res) => {
        userDao.findByRole("admin")
            .then(admin => {
                req.session['admin'] = admin;
                res.json(admin)
            })
    }

    const logout = (req, res) =>
        res.send(req.session.destroy());

    const follow = (req, res) => {
        const followeeId = req.body['followeeId'];
        const userId = req.session['profile']['_id'];
        addToFollowings(userId, followeeId)
            .then(response => {
                addToFollowers(followeeId, userId)
                    .then(state => {
                        req.session['profile']['customerData']['followings'].push(followeeId);
                        res.sendStatus(200);
                    })
            })
    }

    const unfollow = (req, res) => {
        const followeeId = req.body['followeeId'];
        const userId = req.session['profile']['_id'];
        deleteFromFollowings(userId, followeeId)
            .then(response => {
                deleteFromFollowers(followeeId, userId)
                    .then(state => {
                        req.session['profile']['customerData']['followings'] =
                            req.session['profile']['customerData']['followings'].filter(
                                followingId => followingId !== followeeId);
                        res.sendStatus(200);
                    })
            })
    }

    const findUserByIdAsync = async (usersId) => {
        let usersInfo = [];
        for (let i = 0; i < usersId.length; i++) {
            const userId = usersId[i];
            let userInfo = {};
            try {
                userInfo = await userDao.findUserById(userId).exec();
            } catch (e) {
                console.log(e);
            }
            usersInfo.push(userInfo);
        }
        return usersInfo;
    }

    const findFollowings = (req, res) => {
        const followingsId = req.session['profile']['customerData']['followings'];
        /*console.log(followingsId);*/
        findUserByIdAsync(followingsId)
            .then(followingsInfo => {
                /*console.log(followingsInfo);*/
                res.json(followingsInfo);
            })
    }

    const findFollowers = (req, res) => {
        const followersId = req.session['profile']['customerData']['followers'];
        /*console.log(followersId);*/
        findUserByIdAsync(followersId)
            .then(followersInfo => {
                /*console.log(followersInfo);*/
                res.json(followersInfo);
            })
    }

    app.post('/api/login', login);
    app.post('/api/register', register);
    app.post('/api/profile', profile);
    app.post('/api/logout', logout);
    app.put('/api/editProfile', updateUser);
    app.delete('/api/users/:userId', deleteUser);
    app.get('/api/users', findAllUsers);
    app.get('/api/users/:userId', findUserById);
    app.get('/api/admin', admin);
    app.post('/api/register/verify', verifyUsername);
    app.put('/api/follow', follow);
    app.put('/api/unfollow', unfollow);
    app.get('/api/session', getSession);
    app.post('/api/allFollowings', findFollowings);
    app.post('/api/allFollowers', findFollowers);

};