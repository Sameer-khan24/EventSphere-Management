const { ObjectId } = require("mongodb");
const createMessage = require("../models/messageModel");

// Send Message
const sendMessage = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { receiverId, message } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({
                message: "Receiver ID and message are required"
            });
        }

        if (!ObjectId.isValid(receiverId)) {
            return res.status(400).json({
                message: "Invalid receiver ID"
            });
        }

        const receiver = await db.collection("users").findOne({
            _id: new ObjectId(receiverId),
            role: "exhibitor"
        });

        if (!receiver) {
            return res.status(404).json({
                message: "Exhibitor not found"
            });
        }

        const newMessage = createMessage(req.body, req.user.id);

        await db.collection("messages").insertOne(newMessage);

        res.status(201).json({
            message: "Message sent successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to send message"
        });
    }
};

// Get Conversation
const getConversation = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { receiverId } = req.params;

        if (!ObjectId.isValid(receiverId)) {
            return res.status(400).json({
                message: "Invalid receiver ID"
            });
        }

        const senderId = req.user.id;

        const messages = await db.collection("messages").find({
            $or: [
                {
                    senderId,
                    receiverId
                },
                {
                    senderId: receiverId,
                    receiverId: senderId
                }
            ]
        }).sort({ createdAt: 1 }).toArray();

        res.json({
            message: "Conversation fetched successfully",
            messages
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch conversation"
        });
    }
};

const markMessageAsRead = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { messageId } = req.params;

        if (!ObjectId.isValid(messageId)) {
            return res.status(400).json({
                message: "Invalid message ID"
            });
        }

        const result = await db.collection("messages").updateOne(
            {
                _id: new ObjectId(messageId),
                receiverId: req.user.id
            },
            {
                $set: { isRead: true }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Message not found"
            });
        }

        res.json({
            message: "Message marked as read"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to mark message as read"
        });
    }
};
const getInbox = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const messages = await db.collection("messages")
            .aggregate([
                {
                    $match: {
                        receiverId: req.user.id
                    }
                },
                {
                    $addFields: {
                        senderObjectId: {
                            $toObjectId: "$senderId"
                        }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "senderObjectId",
                        foreignField: "_id",
                        as: "sender"
                    }
                },
                {
                    $unwind: {
                        path: "$sender",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    
    $lookup: {
        from: "exhibitors",
        let: {
            senderId: { $toString: "$sender._id" }
        },
        pipeline: [
            {
                $match: {
                    $expr: {
                        $eq: ["$userId", "$$senderId"]
                    }
                }
            }
        ],
        as: "company"
    }
},
                {
                    $unwind: {
                        path: "$company",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        senderObjectId: 0,
                        "sender.password": 0
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                }
            ])
            .toArray();

        res.json({
            message: "Inbox fetched successfully",
            messages
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch inbox"
        });
    }
};

module.exports = {
    sendMessage,
    getConversation,
    markMessageAsRead,
    getInbox
};