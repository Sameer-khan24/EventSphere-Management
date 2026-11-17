const express = require("express");
const router = express.Router();

const {
    registerForSession,
    getMySessionRegistrations
} = require("../controllers/sessionRegistrationController");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.post(
    "/register",
    verifyToken,
    verifyRole(["attendee"]),
    registerForSession
);

router.get(
    "/my-registrations",
    verifyToken,
    verifyRole(["attendee"]),
    getMySessionRegistrations
);

module.exports = router;