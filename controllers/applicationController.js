const createApplication = require("../models/applicationModel");

const applyForEvent = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const applicationData = createApplication(
            req.body,
            req.user.id
        );

        if (!applicationData.eventId || !applicationData.boothPreference) {
            return res.status(400).json({
                message: "Event ID and booth preference are required"
            });
        }

        const { ObjectId } = require("mongodb");

        const event = await db.collection("events").findOne({
            _id: new ObjectId(applicationData.eventId)
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        await db.collection("applications").insertOne(applicationData);

        res.status(201).json({
            message: "Application submitted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Application submission failed"
        });
    }
};

module.exports = { applyForEvent };