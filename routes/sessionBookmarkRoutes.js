const express = require("express");
const router = express.Router();

const {
    bookmarkSession,
    getMyBookmarks
} = require("../controllers/sessionBookmarkController");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.post(
    "/",
    verifyToken,
    verifyRole(["attendee"]),
    bookmarkSession
);

router.get(
    "/my-bookmarks",
    verifyToken,
    verifyRole(["attendee"]),
    getMyBookmarks
);

module.exports = router;