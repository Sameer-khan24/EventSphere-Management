const { ObjectId } = require("mongodb");
const createBoothVisit = require("../models/boothVisitModel");

const recordBoothVisit = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { boothId } = req.body;
        const attendeeId = req.user.id;

        if (!boothId || !ObjectId.isValid(boothId)) {
            return res.status(400).json({
                message: "Valid booth ID is required"
            });
        }

        const booth = await db.collection("booths").findOne({
            _id: new ObjectId(boothId),
            status: "approved"
        });

        if (!booth) {
            return res.status(404).json({
                message: "Approved booth not found"
            });
        }

        const visit = createBoothVisit({
            eventId: booth.eventId,
            boothId,
            attendeeId
        });

        await db.collection("boothVisits").insertOne(visit);
        req.app.locals.io.emit("boothVisitRecorded", {
            eventId: booth.eventId,
            boothId,
            attendeeId,
            totalVisits: await db.collection("boothVisits").countDocuments()
        });

        res.status(201).json({
            message: "Booth visit recorded successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to record booth visit"
        });
    }
};

module.exports = { recordBoothVisit };