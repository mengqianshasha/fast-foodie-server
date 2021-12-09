const userDao = require('../data/db/user/user-dao');
const moment = require('moment')
const {addToFollowings, addToFollowers, deleteFromFollowings, deleteFromFollowers} = require("../data/db/user/user-dao");

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

    const updateUser = (req, res) =>
        userDao.updateUser(req.body)
            .then(status => req.send(status));

    // TODO: Add notifications, activities, reviews, bookmarks into profile later
    const login = (req, res) => {
        userDao.findByUsernameAndPassword(req.body)
            .then(user => {
                if (user) {
                    req.session['profile'] = user;
                    res.json(user);
                    return;
                }
                res.sendStatus(403);
            })
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
            // If restaurant already stored in session
            if (profile.businessData.restaurant.name) {
                res.json(profile);
            }
            // If first query business profile, fetch the restaurant JSON
            else {
                const restaurantId = profile.businessData.restaurant;
                axios.get(`http://api.yelp.com/v3/businesses/${restaurantId}`, {
                    headers: {
                        "Authorization": `Bearer ${process.env.YELP_API_KEY}`
                    }
                }).then(business => {
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

        /**********************************Customer User*********************************/
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
        const userId = req.session['profile'];
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
        const userId = req.session['profile'];
        deleteFromFollowings(userId, followeeId)
            .then(response => {
                deleteFromFollowers(followeeId, userId)
                    .then(state => {
                        req.session['profile']['customerData']['followings'] = req.session['profile']['customerData']['followings'].filter(followingId => followingId !== followeeId);
                        res.sendStatus(200);
                    })
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
    app.put('/api/unfollow', unfollow)
};