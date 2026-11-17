const createExhibitor = require("../models/exhibitorModel");
const path = require("path");
const fs = require("fs");
const registerExhibitor = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const exhibitorData = createExhibitor(req.body);

        if (!exhibitorData.companyName || !exhibitorData.contactEmail) {
            return res.status(400).json({
                message: "Company name and contact email are required"
            });
        }

        exhibitorData.userId = req.user.id;

        await db.collection("exhibitors").insertOne(exhibitorData);

        res.status(201).json({
            message: "Exhibitor profile created successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Exhibitor registration failed"
        });
    }
};
const getAllExhibitors = async (req, res) => {
    try {
        const db = req.app.locals.db;

        const exhibitors = await db.collection("exhibitors")
            .aggregate([
                {
                    $addFields: {
                        userObjectId: {
                            $toObjectId: "$userId"
                        }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userObjectId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        userObjectId: 0,
                        "user.password": 0
                    }
                }
            ])
            .toArray();

        res.status(200).json({
            message: "Exhibitor directory fetched successfully",
            exhibitors
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch exhibitor directory"
        });
    }
};
// Search and Filter Exhibitors
const searchExhibitors = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { companyName, industry } = req.query;

        const filter = {};

        if (companyName) {
            filter.companyName = {
                $regex: companyName,
                $options: "i"
            };
        }

        if (industry) {
            filter.industry = {
                $regex: industry,
                $options: "i"
            };
        }

        const exhibitors = await db.collection("exhibitors")
            .find(filter)
            .toArray();

        res.json({
            message: "Exhibitors search completed",
            exhibitors
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to search exhibitors"
        });
    }
};
const getExhibitorById = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { ObjectId } = require("mongodb");

        const exhibitor = await db.collection("exhibitors").findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!exhibitor) {
            return res.status(404).json({
                message: "Exhibitor not found"
            });
        }

        res.json({
            message: "Exhibitor profile fetched successfully",
            exhibitor
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch exhibitor profile"
        });
    }
};
const updateExhibitor = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { ObjectId } = require("mongodb");

        const updatedData = {};

        const allowedFields = [
            "companyName",
            "description",
            "industry",
            "contactEmail",
            "phone",
            "logo",
            "productsServices",
            "staff",
            "documents"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updatedData[field] = req.body[field];
            }
        });

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({
                message: "At least one field is required to update"
            });
        }

        if (
            updatedData.productsServices !== undefined &&
            !Array.isArray(updatedData.productsServices)
        ) {
            return res.status(400).json({
                message: "Products and services must be an array"
            });
        }

        if (
            updatedData.staff !== undefined &&
            !Array.isArray(updatedData.staff)
        ) {
            return res.status(400).json({
                message: "Staff information must be an array"
            });
        }

        if (
            updatedData.documents !== undefined &&
            !Array.isArray(updatedData.documents)
        ) {
            return res.status(400).json({
                message: "Documents must be an array"
            });
        }

        if (
            updatedData.logo !== undefined &&
            updatedData.logo !== null &&
            typeof updatedData.logo !== "string"
        ) {
            return res.status(400).json({
                message: "Logo must be a valid string URL or path"
            });
        }

        const result = await db.collection("exhibitors").updateOne(
            {
                _id: new ObjectId(req.params.id),
                userId: req.user.id
            },
            { $set: updatedData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Exhibitor profile not found"
            });
        }

        res.json({
            message: "Exhibitor profile updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Profile update failed"
        });
    }
};

const uploadExhibitorFiles = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { ObjectId } = require("mongodb");

        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid exhibitor ID"
            });
        }

        const updatedData = {};

        if (req.files?.logo?.length > 0) {
            updatedData.logo = `/uploads/logos/${req.files.logo[0].filename}`;
        }

        if (req.files?.documents?.length > 0) {
            const documents = req.files.documents.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: `documents/${file.filename}`,
                uploadedAt: new Date()
            }));

            updatedData.documents = documents;
        }

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({
                message: "Please upload a logo or document"
            });
        }

        const result = await db.collection("exhibitors").updateOne(
            {
                _id: new ObjectId(req.params.id),
                userId: req.user.id
            },
            {
                $set: {
                    ...(updatedData.logo && { logo: updatedData.logo })
                },
                ...(updatedData.documents && {
                    $push: {
                        documents: { $each: updatedData.documents }
                    }
                })
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Exhibitor profile not found"
            });
        }

        res.json({
            message: "Files uploaded successfully",
            files: updatedData
        });

    } catch (error) {
        res.status(500).json({
            message: "File upload failed"
        });
    }
};

const downloadExhibitorDocument = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { ObjectId } = require("mongodb");

        const { id, filename } = req.params;
        if (
            !filename ||
            filename !== path.basename(filename) ||
            !/^[a-zA-Z0-9._-]+$/.test(filename)
        ) {
            return res.status(400).json({
                message: "Invalid filename"
            });
        }

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid exhibitor ID"
            });
        }

        const exhibitor = await db.collection("exhibitors").findOne({
            _id: new ObjectId(id),
            userId: req.user.id
        });

        if (!exhibitor) {
            return res.status(404).json({
                message: "Exhibitor profile not found"
            });
        }

        const document = exhibitor.documents.find(
            doc => doc.filename === filename
        );

        if (!document) {
            return res.status(404).json({
                message: "Document not found"
            });
        }

        const filePath = path.join(
            __dirname,
            "../uploads/documents",
            document.filename
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "File not found on server"
            });
        }

        res.download(filePath, document.originalName);

    } catch (error) {
        res.status(500).json({
            message: "Document download failed"
        });
    }
};

module.exports = { registerExhibitor, getAllExhibitors, getExhibitorById, updateExhibitor, searchExhibitors, uploadExhibitorFiles, downloadExhibitorDocument };