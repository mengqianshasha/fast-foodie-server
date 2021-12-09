const userModel = require('./user-model');

const findAllUsers = () =>
  userModel.find();

const findUserById = (userId) =>{
    return userModel.findById(userId);
}


const findByUsernameAndPassword = ({username, password}) =>
  userModel.findOne({username, password});

const findByUsername = ({username}) =>
  userModel.findOne({username});

const findByRole = (role) =>
    userModel.findOne({"role": role});

const createUser = (user) =>
  userModel.create(user);

const updateUser = (user) =>
  userModel.updateOne({_id: user._id}, {
    $set: user
  });

const deleteUser = (userId) =>
  userModel.deleteOne({_id: userId});


// return value is a promise that returns the user of userId
const addToFollowings = (userId, userIdToAdd) => {
    return userModel.findOne({"_id": userId})
        .then(user => {
            if (!(userIdToAdd in user.customerData.followings)){
                user.customerData.followings.push(userIdToAdd);
                return user.save();
            }

        })
}

const deleteFromFollowings = (userId, userIdToDelete) => {
    return userModel.findOne({"_id": userId})
        .then(user => {
            if (userIdToDelete in user.customerData.followings){
                user.customerData.followings = user.customerData.followings.filter(singleUser => singleUser._id !== userIdToDelete);
                return user.save();
            } else {
                return user;
            }
        })
}

const addToFollowers = (userId, userIdToAdd) => {
    return userModel.findOne({"_id": userId})
        .then(user => {
            if (!(userIdToAdd in user.customerData.followers)){
                user.customerData.followers.push(userIdToAdd);
                return user.save();
            }

        })
}

const deleteFromFollowers = (userId, userIdToDelete) => {
    return userModel.findOne({"_id": userId})
        .then(user => {
            if (userIdToDelete in user.customerData.followers){
                user.customerData.followers = user.customerData.followers.filter(singleUser => singleUser._id !== userIdToDelete);
                return user.save();
            } else {
                return user;
            }
        })
}

module.exports = {
  findByUsername, findAllUsers, findUserById,
  findByUsernameAndPassword, findByRole,
  createUser, updateUser, deleteUser,
  addToFollowings, deleteFromFollowings, addToFollowers, deleteFromFollowers
};