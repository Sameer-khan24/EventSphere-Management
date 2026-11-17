const express = require("express");
const router = express.Router();

const { addEvent, getAllEvents, updateEvent, deleteEvent } = require("../controllers/eventController");
const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.post(
    "/",
    verifyToken,
    verifyRole(["admin"]),
    addEvent
);
router.get("/", getAllEvents);
router.put("/:id", verifyToken, verifyRole(["admin"]), updateEvent);
router.delete("/:id", verifyToken, verifyRole(["admin"]), deleteEvent);
module.exports = router;