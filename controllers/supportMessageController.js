const { ObjectId } = require("mongodb");
const createSupportMessage = require("../models/supportMessageModel");

const sendSupportMessage = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const { subject, message } = req.body;
        const senderId = req.user.id;
        const senderRole = req.user.role;

        if (!subject?.trim() || !message?.trim()) {
            return res.status(400).json({
                message: "Subject and message are required"
            });
        }

        const receiver = await db.collection("users").findOne({
            role: "admin"
        });

        if (!receiver) {
            return res.status(404).json({
                message: "Admin account not found"
            });
        }

        const supportMessage = createSupportMessage({
            senderId,
            senderRole,
            receiverId: receiver._id.toString(),
            subject: subject.trim(),
            message: message.trim()
        });

        const result = await db.collection("supportMessages")
            .insertOne(supportMessage);

        res.status(201).json({
            message: "Support message sent successfully",
            messageId: result.insertedId
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to send support message"
        });
    }
};
const getAllSupportMessages = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const messages = await db.collection("supportMessages")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            message: "Support messages fetched successfully",
            messages
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch support messages"
        });
    }
};

const replyToSupportMessage = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const { id } = req.params;
        const { reply } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid support message ID"
            });
        }

        if (!reply?.trim()) {
            return res.status(400).json({
                message: "Reply is required"
            });
        }

        const result = await db.collection("supportMessages").updateOne(
            {
                _id: new ObjectId(id),
                status: "open"
            },
            {
                $set: {
                    adminReply: reply.trim(),
                    status: "replied",
                    isRead: false,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Open support message not found"
            });
        }

        res.json({
            message: "Support reply sent successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to send support reply"
        });
    }
};

const getMySupportMessages = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const exhibitorId = req.user.id;

        const messages = await db.collection("supportMessages")
            .find({ senderId: exhibitorId })
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            message: "Your support messages fetched successfully",
            messages
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your support messages"
        });
    }
};

module.exports = {
    sendSupportMessage,
    getAllSupportMessages,
    replyToSupportMessage,
    getMySupportMessages
};