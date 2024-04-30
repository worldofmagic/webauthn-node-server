var express = require('express');
var { MongoClient, ServerApiVersion } = require('mongodb');
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const SimpleWebAuthnServer = require('@simplewebauthn/server');
const { getSavedAuthenticatorData, getRegistrationInfo } = require("./utils/bufferUtils");
const user = require('./routes/userRouter.js');
const webauthn = require('./routes/webauthnRouter.js');
// const wiki = require("./routes/wiki.js");

const port = process.env.SERVER_PORT;

const errorLogger = (error, request, response, next) => {
    console.log( `${error}`) 
    next(error) // calling next middleware
  }

const errorHandler = (error, request, response , next) => {
    const status = error.errorCode || 400;
    response.status(status).json({
        errorCode: error.errorCode,
        errorMessage: error.message
    });
}


// const client = new MongoClient(mongodbURL, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });


// Express Config
app.use(cors({
    origin: '*'
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Import User Route
app.use('/user', user);

// Import WebAuthn Route
app.use('/webauthn', webauthn);

// Error Logger
app.use(errorLogger)
// Error Handler
app.use(errorHandler);


app.listen(port || process.env.PORT, err => {
    if (err)
        throw err;
    console.log('Server started! on port %s', port);
});

