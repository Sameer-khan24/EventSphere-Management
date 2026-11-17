
const { ObjectId } = require("mongodb");
const createNotification = require("../models/notificationModel");

const getMyNotifications = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const notifications = await db.collection("notifications")
            .find({ attendeeId: req.user.id })
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            message: "Notifications fetched successfully",
            notifications
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch notifications"
        });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid notification ID"
            });
        }

        const result = await db.collection("notifications").updateOne(
            {
                _id: new ObjectId(id),
                attendeeId: req.user.id
            },
            {
                $set: { isRead: true }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json({
            message: "Notification marked as read"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update notification"
        });
    }
};

const createSessionReminder = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { sessionId } = req.body;
        const attendeeId = req.user.id;

        if (!sessionId || !ObjectId.isValid(sessionId)) {
            return res.status(400).json({
                message: "Valid session ID is required"
            });
        }

        const bookmark = await db.collection("sessionBookmarks").findOne({
            sessionId,
            attendeeId
        });

        if (!bookmark) {
            return res.status(403).json({
                message: "Please bookmark this session first"
            });
        }

        const session = await db.collection("sessions").findOne({
            _id: new ObjectId(sessionId)
        });

        if (!session) {
            return res.status(404).json({
                message: "Session not found"
            });
        }

        const [time, period] = session.startTime.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        const scheduledFor = new Date(
            `${session.date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+05:00`
        );

        const notification = createNotification({
            sessionId,
            title: `Reminder: ${session.title}`,
            message: `Your bookmarked session "${session.title}" is scheduled soon.`,
            scheduledFor
        }, attendeeId);

        await db.collection("notifications").insertOne(notification);

        res.status(201).json({
            message: "Session reminder scheduled successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to schedule session reminder"
        });
    }
};

module.exports = {
    getMyNotifications,
    markNotificationAsRead,
    createSessionReminder
};
