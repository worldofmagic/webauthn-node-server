const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/userController");

router.get("/all", user_controller.getAllUser);

router.get("/", user_controller.getUserByUsername);

router.post("/", user_controller.saveUser);

router.delete("/", user_controller.deleteUserByUserName);

module.exports = router;


// const express = require("express");
// const router = express.Router();

// const userRepository = require("../repositories/user-repository");

// router.get('/all', function (req, res) {
//     console.log("[GET USER] ENTRY",)
//     userRepository.getAllUser().then(response => {
//         console.log("[GET USER] EXIT, response: ", response);
//         res.json(response);
//     });
// });

// router.get('/', function (req, res) {
//     var username = req.query.username;
//     console.log("[GET USER] ENTRY, username: ", username)
//     userRepository.getUserByUsername(username).then(response => {
//         console.log("[GET USER] EXIT, response: ", response);
//         res.json(response);
//     });
// });

// router.post('/', function (req, res) {
//     var user = req.body;
//     console.log("[SAVE USER] ENTRY, user: ", user);
//     userRepository.getUserByUsername(user.username).then(response => {
//         if (response != null) {
//             res.status(409).json({
//                 errorCode: 409,
//                 errorMessage: "This user is already existing in the system."
//             });
//         }
//         else {
//             userRepository.saveUser(user).then(response => {
//                 console.log("[SAVE USER] EXIT, response: ", response);
//                 res.status(200).json(response);
//             });
//         }
//     });
// });

// router.delete('/', function (req, res) {
//     var username = req.body.username;
//     console.log("[DELETE USER] ENTRY, username: ", username);
//     userRepository.getUserByUsername(user.username).then(response => {
//         if (response.username == null) {
//             res.status(404).json({
//                 errorCode: 404,
//                 errorMessage: "This user is not existing in the system."
//             });
//         }
//         else {
//             userRepository.deleteUserByUserName(username).then(response => {
//                 console.log("[DELETE USER] EXIT, response: ", response);
//                 res.json(response);
//             });
//         }
//     });
// });

// module.exports = router;