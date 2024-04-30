var { MongoClient, ServerApiVersion } = require('mongodb');
var dotenv = require('dotenv');
var uuid = require('uuid');

dotenv.config();
const mongodbURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;
const authenticatorCollection = process.env.AUTHENTICATOR_COLLECTION;

const client = new MongoClient(mongodbURL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function getAuthenticatorByUsername(username) {
    var result;
    try {
        let query = { "user.username": username };
        await client.connect();
        result = await client.db(dbName).collection(authenticatorCollection).findOne(query);
        console.log("db fetch authenticator result: ", result);
    } finally {
        await client.close();
    }
    return result;
}

async function saveAuthenticator(authenticator) {
    var result;
    authenticator.id = uuid.v4();
    try {
        await client.connect();
        result = await client.db(dbName).collection(authenticatorCollection).insertOne(authenticator);
        console.log('db save authenticator result: ', result);
    } finally {
        await client.close();
    }
    return result;
}

async function deleteAuthenticatorByUserName(username) {
    var result;
    try {
        await client.connect();
        let query = {
            "user.username": username
        }
        result = await client.db(dbName).collection(userCollection).deleteMany(query);
        console.log('db delete user result: ', result);
    } finally {
        await client.close();
    }
    return result;
}

module.exports = { getAuthenticatorByUsername, saveAuthenticator, deleteAuthenticatorByUserName }