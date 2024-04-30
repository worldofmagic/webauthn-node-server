const express = require("express");
const router = express.Router();

const webauthn_Controller = require("../controllers/webauthnController");

router.post("/register/start", webauthn_Controller.registerStart);

router.post("/register/finish", webauthn_Controller.registerFinish);

router.post("/login/start", webauthn_Controller.loginStart);

router.post("/login/finish", webauthn_Controller.loginFinish)

module.exports = router;