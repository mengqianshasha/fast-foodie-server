const userModel = require('./user-model');

const findAllUsers = () =>
    userModel.find();

const findUserById = (userId) => {
    return userModel.findById(userId);
}

const findUserFollowersByIdAsync = async (userId) => {
    let followers = [];
    const findById = userModel.findById(userId)
        .then(user => {
            followers = user.customerData.followers;
        });
    await findById;
    return followers;
}

const findByUsernameAndPassword = ({username, password}) => {
    return userModel.findOne({username, password});
}

const findByUsername = ({username}) =>
    userModel.findOne({username});

const findByRole = (role) =>
    userModel.findOne({"role": role});

const findUsersByRestaurant = (restaurant) => {
    return userModel.find({"businessData.restaurant": restaurant})
}

const createUser = (user) =>
    userModel.create(user);

const updateUser = (user) =>
    userModel.updateOne({_id: user._id}, {
        $set: user
    });

const updateUserAsync = async (user) => {
    await userModel.updateOne({_id: user._id}, {$set: user});
}

const updateBusinessData = (userId, businessData) => {
    return userModel.updateOne({_id: userId}, {$set: {businessData}})
}

const deleteUser = (userId) =>
    userModel.deleteOne({_id: userId});

// return value is a promise that returns the user of userId
const addToFollowings = (userId, userIdToAdd) => {
    return userModel.findOne({"_id": userId})
        .then(user => {
            if (!(user.customerData.followings.includes(userIdToAdd.toString()))) {
                user.customerData.followings.push(userIdToAdd);
                return user.save();
            }
        })
}



const deleteFromFollowings = (userId, userIdToDelete) => {
    return userModel.findOne({"_id": userId})
        .then(user => {
            if (user.customerData.followings.includes(userIdToDelete.toString())) {
                user.customerData.followings = user.customerData.followings.filter(
                    singleUser => singleUser !== userIdToDelete);
                return user.save();
            } else {
                return user;
            }
        })
}

const addToFollowers = (userId, userIdToAdd) => {
    return userModel.findOne({"_id": userId})
        .then(user => {
            if (!(user.customerData.followers.includes(userIdToAdd.toString()))) {
                user.customerData.followers.push(userIdToAdd);
                return user.save();
            }

        })
}

const deleteFromFollowers = (userId, userIdToDelete) => {
    return userModel.findOne({"_id": userId})
        .then(user => {
            if (user.customerData.followers.includes(userIdToDelete.toString())) {
                user.customerData.followers = user.customerData.followers.filter(
                    singleUser => singleUser !== userIdToDelete);
                return user.save();
            } else {
                return user;
            }
        })
}

const deleteReviewOfUser = (userId, reviewId) => {
    return userModel.findOne({"_id": userId})
        .then(user => {
            user.customerData.reviews = user.customerData.reviews.filter(
                review => review !== reviewId);
            return user.save();
        })

}

module.exports = {
    findByUsername, findAllUsers, findUserById, findUserFollowersByIdAsync,
    findByUsernameAndPassword, findByRole, findUsersByRestaurant,
    createUser, updateUser, deleteUser, updateUserAsync,
    addToFollowings, deleteFromFollowings, addToFollowers, deleteFromFollowers,
    updateBusinessData, deleteReviewOfUser
};