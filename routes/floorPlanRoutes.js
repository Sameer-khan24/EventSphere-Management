const express = require("express");
const router = express.Router();

const { getEventFloorPlan } = require("../controllers/floorPlanController");
const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.get(
    "/:eventId",
    verifyToken,
    verifyRole(["admin", "exhibitor", "attendee"]),
    getEventFloorPlan
);

module.exports = router;