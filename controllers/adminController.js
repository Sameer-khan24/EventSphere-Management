const { ObjectId } = require("mongodb");

const getAllApplications = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const applications = await db.collection("applications")
            .find()
            .toArray();

        res.json({
            message: "Applications fetched successfully",
            applications
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch applications"
        });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid application status"
            });
        }

        const result = await db.collection("applications").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.json({
            message: `Application ${status} successfully`
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update application status"
        });
    }
};

module.exports = {
    getAllApplications,
    updateApplicationStatus
};