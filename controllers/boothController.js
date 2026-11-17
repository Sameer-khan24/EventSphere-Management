
const { ObjectId } = require("mongodb");
const createBooth = require("../models/boothModel");

const createNewBooth = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const {
            eventId,
            boothNumber,
            size,
            location,
            price,
            row,
            column
        } = req.body;

        if (!eventId || !boothNumber?.trim() || !size?.trim() || !location?.trim() ||
            price === undefined || row === undefined || column === undefined) {
            return res.status(400).json({
                message: "All booth details are required"
            });
        }

        if (!ObjectId.isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
            return res.status(400).json({
                message: "Price must be a valid non-negative number"
            });
        }

        if (!Number.isInteger(row) || !Number.isInteger(column) ||
            row < 1 || column < 1) {
            return res.status(400).json({
                message: "Row and column must be positive integers"
            });
        }

        const event = await db.collection("events").findOne({
            _id: new ObjectId(eventId)
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const existingBooth = await db.collection("booths").findOne({
            eventId,
            boothNumber: boothNumber.trim()
        });

        if (existingBooth) {
            return res.status(409).json({
                message: "Booth number already exists for this event"
            });
        }

        const booth = createBooth({
            eventId,
            boothNumber: boothNumber.trim(),
            size: size.trim(),
            location: location.trim(),
            price,
            row,
            column
        });

        const result = await db.collection("booths").insertOne(booth);

        req.app.locals.io.emit("boothCreated", {
            ...booth,
            _id: result.insertedId
        });

        res.status(201).json({
            message: "Booth created successfully",
            boothId: result.insertedId
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create booth"
        });
    }
};

const getAllBooths = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const booths = await db.collection("booths")
            .find({ status: "available" })
            .toArray();

        res.json({
            message: "Available booths fetched successfully",
            booths
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch available booths"
        });
    }
};

const reserveBooth = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { boothId } = req.body;
        const exhibitorId = req.user.id;

        if (!boothId || !ObjectId.isValid(boothId)) {
            return res.status(400).json({
                message: "Valid booth ID is required"
            });
        }

        const result = await db.collection("booths").updateOne(
            {
                _id: new ObjectId(boothId),
                status: "available"
            },
            {
                $set: {
                    status: "reserved",
                    exhibitorId
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Booth not found or already reserved"
            });
        }

        req.app.locals.io.emit("boothReserved", {
            boothId,
            exhibitorId,
            status: "reserved"
        });

        res.json({
            message: "Booth reserved successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to reserve booth"
        });
    }
};

const getMyReservedBooths = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const exhibitorId = req.user.id;

        const booths = await db.collection("booths")
            .find({
                exhibitorId,
                status: { $in: ["reserved", "approved"] }
            })
            .toArray();

        res.json({
            message: "Reserved booths fetched successfully",
            booths
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch reserved booths"
        });
    }
};

const getAllReservedBooths = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const booths = await db.collection("booths")
            .find({ status: { $in: ["reserved", "approved"] } })
            .toArray();

        res.json({
            message: "Reserved booths fetched successfully",
            booths
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch reserved booths"
        });
    }
};

const updateBoothStatus = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;
        const { status } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid booth ID"
            });
        }

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected"
            });
        }

        const updateFields = status === "rejected"
            ? { status: "available", exhibitorId: null }
            : { status: "approved" };

        const result = await db.collection("booths").updateOne(
            {
                _id: new ObjectId(id),
                status: "reserved"
            },
            {
                $set: updateFields
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Reserved booth not found"
            });
        }

        req.app.locals.io.emit("boothStatusUpdated", {
            boothId: id,
            status: status === "approved" ? "approved" : "available"
        });

        res.json({
            message: status === "approved"
                ? "Booth approved successfully"
                : "Booth rejected and made available again"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update booth status"
        });
    }
};

const updateBoothDetails = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;

        const {
            boothNumber,
            size,
            location,
            price,
            row,
            column
        } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid booth ID"
            });
        }

        const booth = await db.collection("booths").findOne({
            _id: new ObjectId(id)
        });

        if (!booth) {
            return res.status(404).json({
                message: "Booth not found"
            });
        }

        const updateData = {};

        if (boothNumber !== undefined) {
            if (typeof boothNumber !== "string" || !boothNumber.trim()) {
                return res.status(400).json({
                    message: "Invalid booth number"
                });
            }

            const duplicate = await db.collection("booths").findOne({
                eventId: booth.eventId,
                boothNumber: boothNumber.trim(),
                _id: { $ne: new ObjectId(id) }
            });

            if (duplicate) {
                return res.status(409).json({
                    message: "Booth number already exists for this event"
                });
            }

            updateData.boothNumber = boothNumber.trim();
        }

        if (size !== undefined) {
            if (typeof size !== "string" || !size.trim()) {
                return res.status(400).json({
                    message: "Invalid booth size"
                });
            }
            updateData.size = size.trim();
        }

        if (location !== undefined) {
            if (typeof location !== "string" || !location.trim()) {
                return res.status(400).json({
                    message: "Invalid booth location"
                });
            }
            updateData.location = location.trim();
        }

        if (price !== undefined) {
            if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    message: "Price must be a valid non-negative number"
                });
            }
            updateData.price = price;
        }

        if (row !== undefined) {
            if (!Number.isInteger(row) || row < 1) {
                return res.status(400).json({
                    message: "Row must be a positive integer"
                });
            }
            updateData.row = row;
        }

        if (column !== undefined) {
            if (!Number.isInteger(column) || column < 1) {
                return res.status(400).json({
                    message: "Column must be a positive integer"
                });
            }
            updateData.column = column;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "At least one valid booth detail is required"
            });
        }

        await db.collection("booths").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        req.app.locals.io.emit("boothDetailsUpdated", {
            boothId: id,
            ...updateData
        });

        res.json({
            message: "Booth details updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update booth details"
        });
    }
};

module.exports = {
    createNewBooth,
    getAllBooths,
    reserveBooth,
    getMyReservedBooths,
    getAllReservedBooths,
    updateBoothStatus,
    updateBoothDetails
};
