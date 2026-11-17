const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function createAdmin() {
    const client = new MongoClient(process.env.MONGO_URL);

    try {
        await client.connect();

        const db = client.db("EventSphere");

        const hashedPassword = await bcrypt.hash("Admin@12345", 10);

        await db.collection("users").insertOne({
            name: "Admin",
            email: "admin@eventsphere.com",
            password: hashedPassword,
            role: "admin",
            createdAt: new Date()
        });

        console.log("Admin account created successfully!");

    } catch (error) {
        console.log("Error:", error);
    } finally {
        await client.close();
    }
}

createAdmin();