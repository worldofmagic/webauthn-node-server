const express = require("express");
const router = express.Router();

const webauthn_Controller = require("../controllers/webauthnController");

router.post("/register/start", webauthn_Controller.registerStart);

router.post("/register/finish", webauthn_Controller.registerFinish);

module.exports = router;