const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const {
    registerExhibitor,
    getAllExhibitors,
    getExhibitorById,
    updateExhibitor,
    searchExhibitors,
    uploadExhibitorFiles,
    downloadExhibitorDocument
} = require("../controllers/exhibitorController");
const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

router.post(
    "/register",
    verifyToken,
    verifyRole(["exhibitor"]),
    registerExhibitor
);
router.get(
    "/search",
    verifyToken,
    verifyRole(["exhibitor"]),
    searchExhibitors
);
router.get(
    "/",
    verifyToken,
    verifyRole(["exhibitor"]),
    getAllExhibitors
);
router.get(
    "/:id",
    verifyToken,
    verifyRole(["exhibitor"]),
    getExhibitorById
);
router.put(
    "/:id",
    verifyToken,
    verifyRole(["exhibitor"]),
    updateExhibitor
);
router.put(
    "/:id/files",
    verifyToken,
    verifyRole(["exhibitor"]),
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "documents", maxCount: 5 }
    ]),
    uploadExhibitorFiles
);
router.get(
    "/:id/documents/:filename",
    verifyToken,
    verifyRole(["exhibitor"]),
    downloadExhibitorDocument
);

module.exports = router;