const express = require("express");
const router = express.Router();

const {
    submitFeedback,
    getAllFeedback,
    replyToFeedback,
    getMyFeedback
} = require("../controllers/feedbackController");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.post(
    "/",
    verifyToken,
    verifyRole(["attendee", "exhibitor"]),
    submitFeedback
);

router.get(
    "/",
    verifyToken,
    verifyRole(["admin"]),
    getAllFeedback
);

router.put(
    "/:id/reply",
    verifyToken,
    verifyRole(["admin"]),
    replyToFeedback
);

router.get(
    "/my-feedback",
    verifyToken,
    verifyRole(["attendee", "exhibitor"]),
    getMyFeedback
);

module.exports = router;