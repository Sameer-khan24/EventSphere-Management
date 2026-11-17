const { ObjectId } = require("mongodb");
const createSessionBookmark = require("../models/sessionBookmarkModel");

const bookmarkSession = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { sessionId } = req.body;
        const attendeeId = req.user.id;

        if (!sessionId || !ObjectId.isValid(sessionId)) {
            return res.status(400).json({
                message: "Valid session ID is required"
            });
        }

        const session = await db.collection("sessions").findOne({
            _id: new ObjectId(sessionId)
        });

        if (!session) {
            return res.status(404).json({
                message: "Session not found"
            });
        }

        const existingBookmark = await db.collection("sessionBookmarks").findOne({
            sessionId,
            attendeeId
        });

        if (existingBookmark) {
            return res.status(400).json({
                message: "Session already bookmarked"
            });
        }

        const bookmark = createSessionBookmark(sessionId, attendeeId);

        await db.collection("sessionBookmarks").insertOne(bookmark);

        res.status(201).json({
            message: "Session bookmarked successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to bookmark session"
        });
    }
};

const getMyBookmarks = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const bookmarks = await db.collection("sessionBookmarks").aggregate([
            {
                $match: {
                    attendeeId: req.user.id
                }
            },
            {
                $addFields: {
                    sessionObjectId: { $toObjectId: "$sessionId" }
                }
            },
            {
                $lookup: {
                    from: "sessions",
                    localField: "sessionObjectId",
                    foreignField: "_id",
                    as: "session"
                }
            },
            {
                $unwind: "$session"
            },
            {
                $project: {
                    sessionObjectId: 0
                }
            }
        ]).toArray();

        res.json({
            message: "Bookmarked sessions fetched successfully",
            bookmarks
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch bookmarks"
        });
    }
};

module.exports = {
    bookmarkSession,
    getMyBookmarks
};