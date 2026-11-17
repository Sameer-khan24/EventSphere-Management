const createEvent = require("../models/eventModel");

const addEvent = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const eventData = createEvent(req.body);

        if (!eventData.name || !eventData.date || !eventData.location) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        eventData.organizerId = req.user.id;

        const result = await db.collection("events").insertOne(eventData);

        req.app.locals.io.emit("eventCreated", {
            ...eventData,
            _id: result.insertedId
        });

        res.status(201).json({
            message: "Event created successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Event creation failed"
        });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const events = await db.collection("events")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            message: "Events fetched successfully",
            events
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch events"
        });
    }
};
const updateEvent = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;

        const { ObjectId } = require("mongodb");

        const updatedEvent = {
            name: req.body.name,
            description: req.body.description,
            date: req.body.date,
            location: req.body.location,
            category: req.body.category
        };

        const result = await db.collection("events").updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedEvent }
        );

        if (result.matchedCount === 1) {
            req.app.locals.io.emit("eventUpdated", {
                _id: id,
                ...updatedEvent
            });
        }

        res.json({
            message: "Event updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Event update failed"
        });
    }
};
const deleteEvent = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { ObjectId } = require("mongodb");

        const id = req.params.id;

        const result = await db.collection("events").deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 1) {
            req.app.locals.io.emit("eventDeleted", {
                _id: id
            });
        }

        res.json({
            message: "Event deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Event deletion failed"
        });
    }
};

module.exports = { addEvent, getAllEvents, updateEvent, deleteEvent };