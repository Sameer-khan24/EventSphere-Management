const { ObjectId } = require("mongodb");
const createEventRegistration = require("../models/eventRegistrationModel");
const getAvailableEvents = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const events = await db.collection("events")
            .find({})
            .toArray();

        res.json({
            message: "Available events fetched successfully",
            events
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch available events"
        });
    }
};
const registerForEvent = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { eventId } = req.body;

        if (!eventId || !ObjectId.isValid(eventId)) {
            return res.status(400).json({
                message: "Valid event ID is required"
            });
        }

        const event = await db.collection("events").findOne({
            _id: new ObjectId(eventId)
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const existingRegistration = await db.collection("eventRegistrations").findOne({
            eventId,
            attendeeId: req.user.id
        });

        if (existingRegistration) {
            return res.status(400).json({
                message: "Already registered for this event"
            });
        }

        const registration = createEventRegistration(
            eventId,
            req.user.id
        );

        await db.collection("eventRegistrations").insertOne(registration);

        res.status(201).json({
            message: "Event registration successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Event registration failed"
        });
    }
};
const getMyRegistrations = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const registrations = await db.collection("eventRegistrations")
            .aggregate([
                {
                    $match: {
                        attendeeId: req.user.id
                    }
                },
                {
                    $addFields: {
                        eventObjectId: {
                            $toObjectId: "$eventId"
                        }
                    }
                },
                {
                    $lookup: {
                        from: "events",
                        localField: "eventObjectId",
                        foreignField: "_id",
                        as: "event"
                    }
                },
                {
                    $unwind: "$event"
                },
                {
                    $project: {
                        eventObjectId: 0
                    }
                }
            ])
            .toArray();

        res.json({
            message: "Registered events fetched successfully",
            registrations
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch registered events"
        });
    }
};
module.exports = {
    getAvailableEvents,
    registerForEvent,
    getMyRegistrations
};