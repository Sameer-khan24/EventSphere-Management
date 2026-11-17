const express = require("express");
const router = express.Router();

const {
    getAllApplications,
    updateApplicationStatus
} = require("../controllers/adminController");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.get(
    "/applications",
    verifyToken,
    verifyRole(["admin"]),
    getAllApplications
);

router.put(
    "/applications/:id",
    verifyToken,
    verifyRole(["admin"]),
    updateApplicationStatus
);

module.exports = router;