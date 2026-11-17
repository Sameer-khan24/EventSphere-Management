const express = require("express");
const router = express.Router();

const { createNewBooth,
        getAllBooths,
        reserveBooth,
        getMyReservedBooths,
        getAllReservedBooths,
        updateBoothStatus,
        updateBoothDetails
      } = require("../controllers/boothController");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.post(
    "/",
    verifyToken,
    verifyRole(["admin"]),
    createNewBooth
);

router.get(
    "/",
    verifyToken,
    verifyRole(["admin", "exhibitor"]),
    getAllBooths
);

router.post(
    "/reserve",
    verifyToken,
    verifyRole(["exhibitor"]),
    reserveBooth
);

router.get(
    "/my-reservations",
    verifyToken,
    verifyRole(["exhibitor"]),
    getMyReservedBooths
);

router.get(
    "/reserved",
    verifyToken,
    verifyRole(["admin"]),
    getAllReservedBooths
);

router.put(
    "/:id/status",
    verifyToken,
    verifyRole(["admin"]),
    updateBoothStatus
);

router.put(
    "/:id",
    verifyToken,
    verifyRole(["admin"]),
    updateBoothDetails
);

module.exports = router;