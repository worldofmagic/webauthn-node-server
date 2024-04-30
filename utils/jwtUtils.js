const jwt = require("jsonwebtoken");
var dotenv = require('dotenv');

dotenv.config();

const secret = process.env.JWT_SECRET;

function generateJwt(payload) {
    return jwt.sign(payload, secret);
}

function validateJwt(token) {
    return jwt.verify(token, secret);
}

module.exports = { generateJwt, validateJwt };