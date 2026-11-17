const getDashboardAnalytics = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const totalUsers = await db.collection("users").countDocuments();
        const totalExhibitors = await db.collection("users").countDocuments({
            role: "exhibitor"
        });
        const totalAttendees = await db.collection("users").countDocuments({
            role: "attendee"
        });
        const totalEvents = await db.collection("events").countDocuments();

        const totalBooths = await db.collection("booths").countDocuments();
        const availableBooths = await db.collection("booths").countDocuments({
            status: "available"
        });
        const reservedBooths = await db.collection("booths").countDocuments({
            status: "reserved"
        });
        const approvedBooths = await db.collection("booths").countDocuments({
            status: "approved"
        });
        const totalBoothVisits = await db.collection("boothVisits").countDocuments();

        const boothVisitsByEvent = await db.collection("boothVisits").aggregate([
            {
                $group: {
                    _id: "$eventId",
                    totalVisits: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "events",
                    let: { eventId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        { $toString: "$_id" },
                                        { $toString: "$$eventId" }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "eventDetails"
                }
            },
            {
                $unwind: "$eventDetails"
            },
            {
                $project: {
                    _id: 0,
                    eventName: "$eventDetails.name",
                    totalVisits: 1
                }
            }
        ]).toArray();   

        const boothAnalyticsByEvent = await db.collection("booths").aggregate([
            {
                $group: {
                    _id: "$eventId",
                    totalBooths: { $sum: 1 },
                    availableBooths: {
                        $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] }
                    },
                    reservedBooths: {
                        $sum: { $cond: [{ $eq: ["$status", "reserved"] }, 1, 0] }
                    },
                    approvedBooths: {
                        $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
                    },
                    rejectedBooths: {
                        $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: "events",
                    let: { eventId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        { $toString: "$_id" },
                                        { $toString: "$$eventId" }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "eventDetails"
                }
            },
            {
                $unwind: "$eventDetails"
            },
            {
                $project: {
                    _id: 0,
                    eventName: "$eventDetails.name",
                    totalBooths: 1,
                    availableBooths: 1,
                    reservedBooths: 1,
                    approvedBooths: 1,
                    rejectedBooths: 1
                }
            }
        ]).toArray();

        const totalSessionRegistrations = await db.collection("sessionRegistrations")
            .countDocuments();

        const totalEventRegistrations = await db.collection("eventRegistrations")
            .countDocuments();

        const sessionPopularity = await db.collection("sessionRegistrations").aggregate([
            {
                $group: {
                    _id: "$sessionId",
                    totalRegistrations: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "sessions",
                    let: { sessionId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        { $toString: "$_id" },
                                        { $toString: "$$sessionId" }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "sessionDetails"
                }
            },
            {
                $unwind: "$sessionDetails"
            },
            {
                $project: {
                    _id: 1,
                    title: "$sessionDetails.title",
                    speaker: "$sessionDetails.speaker",
                    topic: "$sessionDetails.topic",
                    totalRegistrations: 1
                }
            },
            {
                $sort: { totalRegistrations: -1 }
            },
            {
                $limit: 5
            }
        ]).toArray();

        res.json({
            message: "Dashboard analytics fetched successfully",
            users: {
                totalUsers,
                totalExhibitors,
                totalAttendees
            },
            totalEvents,
            registrations: {
                totalEventRegistrations,
                totalSessionRegistrations
            },
            booths: {
                totalBooths,
                availableBooths,
                reservedBooths,
                approvedBooths,
                totalBoothVisits
            },
            boothAnalyticsByEvent,
            boothVisitsByEvent,
            sessionPopularity
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard analytics"
        });
    }
};

module.exports = {
    getDashboardAnalytics
};