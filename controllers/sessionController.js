const { ObjectId } = require("mongodb");
const createSession = require("../models/sessionModel");

const createNewSession = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const sessionData = req.body;

        if (
            !sessionData.eventId ||
            !sessionData.title ||
            !sessionData.date ||
            !sessionData.startTime ||
            !sessionData.endTime
        ) {
            return res.status(400).json({
                message: "Required session details are missing"
            });
        }

        if (!ObjectId.isValid(sessionData.eventId)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const event = await db.collection("events").findOne({
            _id: new ObjectId(sessionData.eventId)
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const newSession = createSession(sessionData);

        const result = await db.collection("sessions").insertOne(newSession);

        req.app.locals.io.emit("sessionCreated", {
            ...newSession,
            _id: result.insertedId
        });

        res.status(201).json({
            message: "Session created successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Session creation failed"
        });
    }
};

const getAllSessions = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const sessions = await db.collection("sessions")
            .find({})
            .toArray();

        res.json({
            message: "Sessions fetched successfully",
            sessions
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch sessions"
        });
    }
};
const updateSession = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        const allowedFields = [
            "title", "description", "speaker",
            "topic", "location", "date",
            "startTime", "endTime"
        ];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        const result = await db.collection("sessions").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Session not found" });
        }

        req.app.locals.io.emit("sessionUpdated", {
            sessionId: id,
            ...updateData
        });

        res.json({ message: "Session updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Session update failed" });
    }
};
const deleteSession = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        const result = await db.collection("sessions").deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Session not found" });
        }

        req.app.locals.io.emit("sessionDeleted", {
            sessionId: id
        });

        res.json({ message: "Session deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Session deletion failed" });
    }
};

module.exports = {
    createNewSession,
    getAllSessions,
    updateSession,
    deleteSession
};