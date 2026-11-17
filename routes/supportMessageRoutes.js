const express = require("express");
const router = express.Router();

const {
    sendSupportMessage,
    getAllSupportMessages,
    replyToSupportMessage,
    getMySupportMessages
} = require("../controllers/supportMessageController");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.post(
    "/",
    verifyToken,
    verifyRole(["exhibitor"]),
    sendSupportMessage
);
router.get(
    "/",
    verifyToken,
    verifyRole(["admin"]),
    getAllSupportMessages
);

router.put(
    "/:id/reply",
    verifyToken,
    verifyRole(["admin"]),
    replyToSupportMessage
);

router.get(
    "/my-messages",
    verifyToken,
    verifyRole(["exhibitor"]),
    getMySupportMessages
);

module.exports = router;