const express = require("express");
const router = express.Router();

const { applyForEvent } = require("../controllers/applicationController");
const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.post(
    "/",
    verifyToken,
    verifyRole(["exhibitor"]),
    applyForEvent
);

module.exports = router;