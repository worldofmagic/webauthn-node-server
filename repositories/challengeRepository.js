var { MongoClient, ServerApiVersion } = require('mongodb');
var dotenv = require('dotenv');
var uuid = require('uuid');

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const mongodbURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;
const challengeCollection = process.env.CHALLENGE_COLLECTION;

const client = new MongoClient(mongodbURL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function getChallengeByUsername(username) {
    var result;
    try {
        let query = { "username": username };
        await client.connect();
        result = await client.db(dbName).collection(challengeCollection).findOne(query);
        console.log("db fetch challenge result: ", result);
    } finally {
        await client.close();
    }
    return result;
}

async function saveChallenge(challenge) {
    var result;
    challenge.id = uuid.v4();
    try {
        await client.connect();
        result = await client.db(dbName).collection(challengeCollection).insertOne(challenge);
        console.log('db save challenge result: ', result);
    } finally {
        await client.close();
    }
    return result;
}

module.exports = { getChallengeByUsername, saveChallenge }