const express = require("express");
const router = express.Router();

const {
    sendMessage,
    getConversation,
    markMessageAsRead,
    getInbox
} = require("../controllers/messageController");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.post(
    "/send",
    verifyToken,
    verifyRole(["exhibitor"]),
    sendMessage
);

router.get(
    "/inbox",
    verifyToken,
    verifyRole(["exhibitor"]),
    getInbox
);

router.get(
    "/:receiverId",
    verifyToken,
    verifyRole(["exhibitor"]),
    getConversation
);

router.put(
    "/read/:messageId",
    verifyToken,
    verifyRole(["exhibitor"]),
    markMessageAsRead
);

module.exports = router;