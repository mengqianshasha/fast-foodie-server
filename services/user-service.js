const userDao = require('../data/db/user/user-dao');

module.exports = (app) => {
  const findAllUsers = (req, res) =>
    userDao.findAllUsers()
      .then(users => res.json(users));

  const findUserById = (req, res) =>
    userDao.findUserById(req.userId)
      .then(user => res.json(user));

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
        if(user) {
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
              if(user) {
                  res.sendStatus(404);
              } else {
                  res.sendStatus(200);
              }
          })
  }

  const register = (req, res) => {
    userDao.findByUsername(req.body)
      .then(user => {
        if(user) {
          res.sendStatus(404);
          return;
        }
        userDao.createUser(req.body)
          .then(user => {
            req.session['profile'] = user;
            res.json(user)
          });
      })
  }

  const profile = (req, res) =>
    res.json(req.session['profile']);

  const logout = (req, res) =>
    res.send(req.session.destroy());

  app.post('/api/login', login);
  app.post('/api/register', register);
  app.post('/api/profile', profile);
  app.post('/api/logout', logout);
  app.put('/api/editProfile', updateUser);
  app.delete('/api/users/:userId', deleteUser);
  app.get('/api/users', findAllUsers);
  app.get('/api/users/:userId', findUserById);
  app.post('/api/register/verify', verifyUsername);
};