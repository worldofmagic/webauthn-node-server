const userRepository = require("../repositories/userRepository");
const asyncHandler = require("express-async-handler");
const error = require("../constrains/error");

exports.getAllUser = asyncHandler(async (req, res, next) => {
    console.log("[GET ALL USERS] ENTRY",)
    userRepository.getAllUser().then(response => {
        console.log("[GET ALL USERS] EXIT, response: ", response);
        res.json(response);
    });
});

exports.getUserByUsername = asyncHandler(async (req, res, next) => {
    var username = req.query.username;
    console.log("[GET USER BY USERNAME] ENTRY, username: ", username);
    userRepository.getUserByUsername(username).then(response => {
        if (response == null) {
            return next(error.getNotFoundError());
        }
        else {
            userRepository.getUserByUsername(username).then(response => {
                console.log("[GET USER BY USERNAME] EXIT, response: ", response);
                res.json(response);
            });
        }
    });
});

exports.saveUser = asyncHandler(async (req, res, next) => {
    var user = req.body;
    console.log("[SAVE USER] ENTRY, user: ", user);
    userRepository.getUserByUsername(user.username).then(response => {
        if (response != null) {
            return next(error.getDuplicateError());
        }
        else {
            userRepository.saveUser(user).then(response => {
                console.log("[SAVE USER] EXIT, response: ", response);
                res.status(200).json(response);
            });
        }
    });
});

exports.deleteUserByUserName = asyncHandler(async (req, res, next) => {
    var username = req.body.username;
    console.log("[DELETE USER] ENTRY, username: ", username);
    userRepository.getUserByUsername(user.username).then(response => {
        if (response.username == null) {
            return next(error.getNotFoundError());
        }
        else {
            userRepository.deleteUserByUserName(username).then(response => {
                console.log("[DELETE USER] EXIT, response: ", response);
                res.json(response);
            });
        }
    });
});