const express = require("express");
const router = express.Router();

const {
    getMyNotifications,
    markNotificationAsRead,
    createSessionReminder
} = require("../controllers/notificationController");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.get(
    "/",
    verifyToken,
    verifyRole(["attendee"]),
    getMyNotifications
);

router.put(
    "/read/:id",
    verifyToken,
    verifyRole(["attendee"]),
    markNotificationAsRead
);
router.post(
    "/reminder",
    verifyToken,
    verifyRole(["attendee"]),
    createSessionReminder
);

module.exports = router;