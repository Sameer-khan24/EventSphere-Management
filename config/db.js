const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.MONGO_URL);

async function connectDB() {
    await mongoClient.connect();
    console.log("MongoDB Connected Successfully");
    await mongoClient
    .db("EventSphere")
    .collection("users")
    .createIndex(
        { email: 1 },
        { unique: true, name: "unique_user_email" }
    );

console.log("Unique Email Index Created Successfully");

    return mongoClient.db("EventSphere");
}

module.exports = connectDB;