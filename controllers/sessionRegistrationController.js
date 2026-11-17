const { ObjectId } = require("mongodb");
const createSessionRegistration = require("../models/sessionRegistrationModel");


const registerForSession = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { sessionId } = req.body;
        const attendeeId = req.user.id;

        if (!sessionId || !ObjectId.isValid(sessionId)) {
            return res.status(400).json({
                message: "Valid session ID is required"
            });
        }

        const session = await db.collection("sessions").findOne({
            _id: new ObjectId(sessionId)
        });

        if (!session) {
            return res.status(404).json({
                message: "Session not found"
            });
        }

        const existingRegistration = await db.collection("sessionRegistrations").findOne({
            sessionId,
            attendeeId
        });

        if (existingRegistration) {
            return res.status(400).json({
                message: "Already registered for this session"
            });
        }

        const registration = createSessionRegistration(sessionId, attendeeId);

        await db.collection("sessionRegistrations").insertOne(registration);

        res.status(201).json({
            message: "Session registration successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Session registration failed"
        });
    }
};

const getMySessionRegistrations = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const registrations = await db.collection("sessionRegistrations").aggregate([
            {
                $match: {
                    attendeeId: req.user.id
                }
            },
            {
                $addFields: {
                    sessionObjectId: { $toObjectId: "$sessionId" }
                }
            },
            {
                $lookup: {
                    from: "sessions",
                    localField: "sessionObjectId",
                    foreignField: "_id",
                    as: "session"
                }
            },
            {
                $unwind: "$session"
            },
            {
                $project: {
                    sessionObjectId: 0
                }
            }
        ]).toArray();

        res.json({
            message: "My session registrations fetched successfully",
            registrations
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch session registrations"
        });
    }
};

module.exports = {
    registerForSession,
    getMySessionRegistrations
};