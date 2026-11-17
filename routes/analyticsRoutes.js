const express = require("express");
const router = express.Router();

const { getDashboardAnalytics } = require("../controllers/analyticsController");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.get(
    "/dashboard",
    verifyToken,
    verifyRole(["admin"]),
    getDashboardAnalytics
);

module.exports = router;