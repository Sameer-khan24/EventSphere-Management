const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

const { recordBoothVisit } = require("../controllers/boothVisitController");

router.post(
    "/",
    verifyToken,
    verifyRole(["attendee"]),
    recordBoothVisit
);

module.exports = router;