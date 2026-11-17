const { ObjectId } = require("mongodb");
const createFeedback = require("../models/feedbackModel");

const submitFeedback = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { subject, message, rating } = req.body;

        if (!subject?.trim() || !message?.trim()) {
            return res.status(400).json({
                message: "Subject and message are required"
            });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const feedback = createFeedback({
            userId: req.user.id,
            userRole: req.user.role,
            subject: subject.trim(),
            message: message.trim(),
            rating
        });

        const result = await db.collection("feedback").insertOne(feedback);

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedbackId: result.insertedId
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to submit feedback"
        });
    }
};

const getAllFeedback = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const feedback = await db.collection("feedback")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            message: "Feedback fetched successfully",
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch feedback"
        });
    }
};

const replyToFeedback = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;
        const { reply } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid feedback ID"
            });
        }

        if (!reply?.trim()) {
            return res.status(400).json({
                message: "Reply is required"
            });
        }

        const result = await db.collection("feedback").updateOne(
            {
                _id: new ObjectId(id),
                status: "pending"
            },
            {
                $set: {
                    adminReply: reply.trim(),
                    status: "reviewed",
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Pending feedback not found"
            });
        }

        res.json({
            message: "Feedback reply submitted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to reply to feedback"
        });
    }
};

const getMyFeedback = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const userId = req.user.id;

        const feedback = await db.collection("feedback")
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            message: "Your feedback fetched successfully",
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your feedback"
        });
    }
};

module.exports = {
    submitFeedback,
    getAllFeedback,
    replyToFeedback,
    getMyFeedback
};