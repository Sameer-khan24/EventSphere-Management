const express = require("express");
const router = express.Router();

const {
    getAvailableEvents,
    registerForEvent,
    getMyRegistrations
} = require("../controllers/attendeeController");
const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.get(
    "/events",
    verifyToken,
    verifyRole(["attendee"]),
    getAvailableEvents
);
router.post(
    "/register",
    verifyToken,
    verifyRole(["attendee"]),
    registerForEvent
);
router.get(
    "/my-registrations",
    verifyToken,
    verifyRole(["attendee"]),
    getMyRegistrations
);
module.exports = router;