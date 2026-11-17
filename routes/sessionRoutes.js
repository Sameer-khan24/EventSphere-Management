const express = require("express");
const router = express.Router();

const {
    createNewSession,
    getAllSessions,
    updateSession,
    deleteSession
} = require("../controllers/sessionController");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.post(
    "/",
    verifyToken,
    verifyRole(["admin"]),
    createNewSession
);

router.get(
    "/",
    verifyToken,
    verifyRole(["attendee"]),
    getAllSessions
);

router.put(
    "/:id",
    verifyToken,
    verifyRole(["admin"]),
    updateSession
);

router.delete(
    "/:id",
    verifyToken,
    verifyRole(["admin"]),
    deleteSession
);
module.exports = router;