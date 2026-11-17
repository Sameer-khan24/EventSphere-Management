const { ObjectId } = require("mongodb");

const getEventFloorPlan = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { eventId } = req.params;

        if (!ObjectId.isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID"
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

        const booths = await db.collection("booths")
            .find({
               eventId,
               status: { $in: ["available", "approved"] },
               row: { $exists: true },
               column: { $exists: true }
})
            .sort({ row: 1, column: 1 })
            .toArray();

        res.json({
            message: "Event floor plan fetched successfully",
            event: event.name,
            totalBooths: booths.length,
            booths
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch event floor plan"
        });
    }
};

module.exports = { getEventFloorPlan };