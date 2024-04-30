var { MongoClient, ServerApiVersion } = require('mongodb');
var dotenv = require('dotenv');
var uuid = require('uuid');

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const mongodbURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;
const userCollection = process.env.USER_COLLECTION;

const client = new MongoClient(mongodbURL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function getAllUser() {
    var result;
    try {
        await client.connect();
        result = await client.db(dbName).collection(userCollection).find().toArray();
        console.log("db fetch result: ", result);
    } finally {
        await client.close();
    }
    return result;
}

async function getUserByUsername(username) {
    var result;
    try {
        let query = { "username": username };
        await client.connect();
        result = await client.db(dbName).collection(userCollection).findOne(query);
        console.log("db fetch result: ", result);
    } finally {
        await client.close();
    }
    return result;
}

async function saveUser(user) {
    var result;
    user.id = uuid.v4();
    user.displayName = user.username;
    try {
        await client.connect();
        result = await client.db(dbName).collection(userCollection).insertOne(user);
        console.log('db save user result: ', result);
    } finally {
        await client.close();
    }
    return result;
}

async function deleteUserByUserName(username) {
    var result;
    try {
        await client.connect();
        let query = {
            "username": username
        }
        result = await client.db(dbName).collection(userCollection).deleteMany(query);
        console.log('db delete user result: ', result);
    } finally {
        await client.close();
    }
    return result;
}

module.exports = { getAllUser, getUserByUsername, saveUser, deleteUserByUserName }