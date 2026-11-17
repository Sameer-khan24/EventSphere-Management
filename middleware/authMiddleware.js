const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. Invalid or missing token."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!ObjectId.isValid(decoded.id)) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        const db = req.app.locals.db;

        const user = await db.collection("users").findOne({
            _id: new ObjectId(decoded.id)
        });

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        if ((decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) {
            return res.status(401).json({
                message: "Session expired. Please login again."
            });
        }

        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = verifyToken;